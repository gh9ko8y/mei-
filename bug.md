# Aria 项目 Bug 清单

> 审查日期：2026-07-08  
> 审查方式：人工逐行 + DebateForge 多模型交叉验证  
> 覆盖文件：src/main.py、src/auth/*、src/database/*、src/memory/*、src/graph/*、src/retention/*、src/personality/*、src/stickers/*

严重度说明：**critical** = 上线即崩/数据泄露/认证绕过；**high** = 主流程异常；**medium** = 边界场景失效；**low** = 维护性/小概率。

---

## 一、Critical（必修，上线即崩/安全基线）

### Bug #1 — 注册接口参数错位，注册后任何用户无法登录
- **文件**：`src/main.py:286`
- **代码**：`user = user_store.register(req.username, req.password, req.nickname)`
- **问题**：`UserStore.register` 签名是 `(aria_id, username, password, nickname, is_admin)`，调用时把 `req.username` 当 aria_id、`req.password` 当 username、`req.nickname` 当 password。结果：用户名与密码完全错位，aria_id 拿到的是用户名，密码哈希存的是昵称。
- **影响**：`/auth/register` 写入后，用户无法用 aria_id 登录。同时 `user_store.exists(req.username)` 检查的是 aria_id 而非 username，重复注册检测失效。
- **修复**：调成 `user_store.register(aria_id=req.username, username=req.username, password=req.password, nickname=req.nickname or req.username)`，并在 `register` 内显式 `KeyError` 处理 aria_id 冲突。

### Bug #2 — `JWT_SECRET` 硬编码默认值，可预测/可伪造
- **文件**：`src/auth/service.py:11`
- **代码**：`JWT_SECRET = os.environ.get("JWT_SECRET", "aria-dev-secret-change-in-production")`
- **问题**：源码提交后默认值是公开字符串，攻击者无需 `.env` 即可签出任意 `user_id` 的 token。
- **影响**：完整认证绕过，可冒充任意用户（含 admin）。
- **修复**：去掉默认值；启动时若 `JWT_SECRET` 未设置直接 `raise RuntimeError`。同时把签名长度从 16 字符提到 ≥32。

### Bug #3 — 管理员默认密码硬编码在源码
- **文件**：`src/main.py:60-66`
- **代码**：`password="linxi2026"`
- **问题**：源码泄露即拿到 admin 凭证；这是 Aria 号 `001` 的固定密码。
- **影响**：admin 账户失陷，且 admin 逻辑里还强制 `id=1` 覆盖任何已存在 id=1 的用户。
- **修复**：从环境变量或密钥管理服务读默认密码；启动时若已存在 admin 强制要求首次登录改密。

### Bug #4 — 双存储分脑：内存与数据库互不可见
- **文件**：`src/main.py:458-578`
- **问题**：
  - `chat/send` 写入 `db_manager`（DB）
  - `chat/send/stream` 写入 `memory_store`（内存）
  - `graph_retrieval` 从 `memory_store` 读
  - `chat/history` 从 `db_manager` 读
- **影响**：流式/非流式两条路径的历史永远不互通；图谱检索只能看到内存数据，新会话无任何历史。
- **修复**：选定单一存储源（推荐 DB），让 `graph_retrieval` 改读 `EventRepository`；`MemoryStore` 留作兼容层但不再写主路径。

### Bug #5 — `UserStore` / `active_personas` / `verification_codes` 全是进程内可变 dict，无锁
- **文件**：`src/main.py:47-53`、`src/auth/user_store.py:20-44`、`src/auth/email_verify.py:11`
- **问题**：FastAPI 默认多线程，多个 worker 并发 `register` 同 aria_id 时 `aria_id in self._by_aria_id` 检查 + `self._by_aria_id[aria_id] = ...` 写入非原子，可能重复成功；验证码 dict 同样存在覆盖/丢失。
- **影响**：并发注册竞态、验证码被覆盖导致合法用户收不到码。
- **修复**：`UserStore` 改 DB 持久化；验证码加 `threading.Lock` 或用 Redis。

---

## 二、High（主流程异常/数据越权）

### Bug #6 — `query_by_valid_time` 引用未定义变量 `start`
- **文件**：`src/memory/store.py:64-75`
- **代码**：
  ```python
  if end:
      events = [e for e in self._events if
                (e.valid_end is None and e.valid_start <= end) or
                (e.valid_end and e.valid_end >= start)]   # start 未定义
  ```
- **问题**：当 `start=None, end=<datetime>` 时 `start` 已被短路掉不会抛 `NameError`，但会抛 `TypeError: '>=' not supported between instances of 'datetime.datetime' and 'NoneType'`（已复现）。
- **影响**：双时态查询只要传 `end` 就会崩。
- **修复**：改为 `(e.valid_end and e.valid_end >= end)` 或在 start 为 None 时直接返回空集。

### Bug #7 — `get_session_events` 无 user_id 过滤
- **文件**：`src/database/repositories.py:49-56`
- **问题**：仅按 `session_id` 查询，**任何用户拿到 session_id 都能拉全库该 session 的全部消息**（已复现：u1 和 u2 共用 session_id "s1" 时互相可见）。
- **影响**：跨用户数据越权访问。
- **修复**：函数签名加 `user_id: int` 并 `.filter(Event.user_id == user_id, Event.session_id == session_id)`；调用方一并修改。

### Bug #8 — `search_by_keyword` 用 AND 连接多个 ilike
- **文件**：`src/database/repositories.py:58-83`
- **代码**：`conditions = [...]; for kw in keywords: conditions.append(Event.content.ilike(f"%{kw}%")); filter(and_(*conditions))`
- **问题**：所有关键词必须同时命中才返回。多词查询几乎必空。
- **影响**：记忆检索几乎总是"无相关历史"，看起来像 AI 失忆。
- **修复**：用 OR 连接每个关键词，按命中数 + 重要性排序：`filter(or_(*[Event.content.ilike(...) for kw in keywords]))`，内存版 `MemoryStore.search_by_keyword` 已经是这个正确做法（`src/memory/store.py:152`），DB 版应保持一致。

### Bug #9 — 管理员初始化强制改 id=1，会静默覆盖已有用户
- **文件**：`src/main.py:60-73`
- **代码**：
  ```python
  admin_user = user_store.register(aria_id="001", username="百事非", password="linxi2026", ...)
  if admin_user:
      user_store._users.pop(admin_user.id, None)
      user_store._by_aria_id.pop("001", None)
      admin_user.id = 1
      user_store._users[1] = admin_user
      user_store._by_aria_id["001"] = 1
  ```
- **问题**：
  1. 直接操作私有字典破坏封装；
  2. 若 `register` 返回 `None`（aria_id 冲突），`admin_user.id = 1` 抛 `AttributeError`；
  3. 若已有用户占用了 `id=1`，会被静默覆盖；
  4. `_next_id` 没同步推进，后续注册用户会复用 `id=2` 与 `id=1` 共存但 admin 永远是 id=1，状态错乱。
- **修复**：把 admin 当作普通用户注册（用第一个可用 id），不要改 id；或者用 `aria_id=ADMIN_ARIA_ID` 查找已存在的 admin。

### Bug #10 — `CORS allow_origins=["*"]` + `allow_credentials=True` 同时开启
- **文件**：`src/main.py:85-91`
- **问题**：浏览器规范禁止这种组合；且所有源都可携带凭证，CSRF 与跨域凭据泄露。
- **影响**：任意第三方网站可代表已登录用户调用 API。
- **修复**：列出具体 origin（如 `https://aria.vin, https://app.aria.vin`），或者把 `allow_credentials` 改 False。

### Bug #11 — 密码哈希用 SHA256 + 8 位 MD5 salt
- **文件**：`src/auth/service.py:15-19`
- **问题**：没有用 bcrypt/argon2/scrypt 这种自带成本因子的算法；签名也只截断 16 字符（2⁶⁴ 空间），加 GPU 算力后彩虹表/碰撞风险显著。
- **影响**：数据库一旦泄露，密码易被批量还原。
- **修复**：改用 `passlib[bcrypt]` 或 `argon2-cffi`，签名长度提到 ≥32。

### Bug #12 — `send_email` 在未配置 SMTP 时"假装成功"
- **文件**：`src/auth/email_verify.py:58-66`
- **问题**：未设 `EMAIL_USER`/`EMAIL_PASSWORD` 时直接 `return True` 并把验证码打印到 stdout。开发环境 OK，但**生产若忘配** SMTP，接口会返回"验证码已发送"而用户永远收不到。
- **影响**：注册流程假阳性。
- **修复**：检测到 `EMAIL_USER` 为空时 `raise RuntimeError` 或在 `/auth/send-code` 直接 `503`。

### Bug #13 — 数据库 `User` 模型缺 `password_hash` / `aria_id`
- **文件**：`src/database/models.py:13-22`
- **问题**：业务全在内存 `UserStore`，数据库 `User` 表只有 `username/nickname/phone`。
- **影响**：一旦想持久化用户或迁移到多实例，密码字段无落点；`register/login` 无法落到 DB。
- **修复**：补 `aria_id`、`password_hash` 字段，并实现 `UserRepository`。

### Bug #14 — `/data/stickers` 硬编码绝对 Linux 路径
- **文件**：`src/main.py:96-98`
- **问题**：开发机是 Windows，硬编码 `/data/stickers` 会让 `StaticFiles` 报错。
- **影响**：Windows 本地开发起不来服务；不同部署环境无法重定位。
- **修复**：读 `STICKER_DIR` 环境变量，默认 `./data/stickers`（相对路径）。

---

## 三、Medium（边界场景/逻辑错误）

### Bug #15 — `ilike` 未转义 `%` / `_` 通配符
- **文件**：`src/database/repositories.py:74`
- **问题**：用户输入含 `%` 或 `_` 时会作为通配符放大匹配（仅 PostgreSQL/SQLite LIKE 行为；SQLAlchemy 仍绑参所以不是 SQL 注入）。
- **修复**：`kw.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')`，并用 `ESCAPE '\\'`。

### Bug #16 — `/auth/register`、`/auth/login` 返回 `TokenResponse` 缺必填字段
- **文件**：`src/main.py:290-295, 304-311`
- **问题**：`TokenResponse` 模型 `aria_id` 和 `nickname` 是必填字段，但两个端点都没传，pydantic 校验失败 → 500。
- **修复**：把这两个字段设为 `Optional` 或在响应里补全（`aria_id=user.aria_id, nickname=user.nickname`）。

### Bug #17 — `email_verify.generate_code` 用 `random` 而非 `secrets`
- **文件**：`src/auth/email_verify.py:33`
- **问题**：6 位数字验证码理论上可被预测（实际攻击成本高，但不符合密码学实践）。
- **修复**：`code = ''.join(random.SystemRandom().choices(string.digits, k=6))` 或 `secrets.choice` 循环。

### Bug #18 — `register` 返回 `None`（aria_id 冲突）时 main.py 不检查
- **文件**：`src/main.py:286-289`
- **问题**：`if not user: raise HTTPException(...)` 已经处理了 `None` 返回，所以这里 OK；但 `admin_user` 那一段（`if admin_user:` 之后才取值）没处理 `None`，会抛 `AttributeError`（见 Bug #9）。

### Bug #19 — 自定义 `.env` 解析器不处理引号/转义/多行
- **文件**：`src/main.py:32-39`
- **问题**：手写的 `for line in f: ...` 解析器不支持带等号的值（如密码 `pass=abc=def`）、不支持引号包裹的字符串。
- **修复**：直接用 `python-dotenv` 的 `load_dotenv()`。

### Bug #20 — `verification_codes` 内存 dict 无大小限制
- **文件**：`src/auth/email_verify.py:11`
- **问题**：攻击者批量调 `/auth/send-code` 可撑爆内存；现有 `verification_codes` 没有任何 TTL 之外的清理机制（除 `verify_code` 命中时删除）。
- **修复**：用 LRU/TTL 数据结构，或后端切 Redis + 过期。

### Bug #21 — `MemoryStore` 与 `EventRepository.search_by_keyword` 行为分叉
- **文件**：`src/memory/store.py:147-158` vs `src/database/repositories.py:74-83`
- **问题**：内存版用打分排序（命中关键词数 / 关键词数 × 重要性），DB 版用 AND 全命中。同样的输入两个存储返回结果不同。
- **修复**：DB 版按内存版的算法改写（见 Bug #8 修复方案）。

### Bug #22 — `should_send_sticker` 阈值过宽，实际触发率远高于 30%
- **文件**：`src/stickers/manager.py:76-108`
- **问题**：
  - `if len(ai_reply) < 30: return True` — 所有短回复必发
  - `trigger_words` 命中必发
  - 30% 随机是兜底
  - 实际短回复 + 触发词命中场景占大多数，比例 >70%。
- **修复**：把短回复 / 触发词改为加权概率（比如短回复 60%、触发词 70%、其他 30%），保证期望概率在 30% 左右。

### Bug #23 — `chat/send` 表情包标记双重处理
- **文件**：`src/main.py:504` + `529-533`
- **问题**：`sticker_manager.process_reply` 已在 reply 末尾追加 `[STICKER:xxx]`，存进数据库后又被解析剥离。这意味着数据库里存的 AI 回复**包含表情包标记字符串**，影响图谱检索内容。
- **修复**：`sticker_manager.process_reply` 改返回 `(reply_text, sticker_category)` 二元组，由 main.py 决定如何注入 sticker 字段；或存库前先剥离。

### Bug #24 — `StickerManager._consecutive_count` 字段从未被读写
- **文件**：`src/stickers/manager.py:70`
- **问题**：字段定义但只引用 1 次（在 `__init__`），`should_send_sticker` 的 `consecutive_stickers` 参数从外部传入但内部不使用该字段。
- **修复**：要么实现自增逻辑，要么删除字段。

### Bug #25 — `_retrieve_emotion` 用 `source_state_id` 当 event_id 查询
- **文件**：`src/graph/retrieval.py:147-156`
- **问题**：`trigger.source_state_id` 是 `emotion_states.id`（情绪态 id），不是 `events.id`；传给 `memory.get_event` 永远找不到对应事件。
- **影响**：情绪图谱检索失效。
- **修复**：先用 `source_state_id` 查到 `EmotionState` 对象，再取其 `event_id` 查事件。

### Bug #26 — `check_memory_trigger` 浪费一次 `get_user_events(limit=1)`
- **文件**：`src/retention/engine.py:65-67`
- **问题**：`events = self.memory.get_user_events(..., limit=1); if events: first_event = self.memory.get_user_events(..., limit=1000)` —— 第一个查询结果立刻丢弃。
- **修复**：直接 `first_event = self.memory.get_user_events(..., limit=1)`，要最早一条再倒序取或用 `limit=1` 之后 `[-1]`。

### Bug #27 — `create_token` 把 username 编码进 payload
- **文件**：`src/auth/service.py:35`
- **问题**：JWT payload 暴露用户名（轻量 PII 泄露），且没有"标准 JWT"格式（不是 base64url，不带 `iss`/`iat` 等声明）。
- **修复**：用 `PyJWT` 库，payload 只放 `sub`（user_id）+ `exp`。

---

## 四、Low（维护性/小概率）

### Bug #28 — `_strip_intent_keywords` 关键词全在查询里时退化为空字符串
- **文件**：`src/graph/retrieval.py:62-68`
- **问题**：`if not result: return query` 兜底已经写了，但调用方 `search_by_keyword(user_id, "")` 会触发 `keywords=[]` → 返回 `[]`，与意图不符。
- **修复**：检测空字符串时直接返回空列表。

### Bug #29 — `get_session_events` 排序依赖同一秒插入的稳定顺序
- **文件**：`src/database/repositories.py:50-56`
- **问题**：`valid_start` 默认 `datetime.utcnow()`，同一秒插入的多条记录靠 Python 稳定排序保留插入顺序；跨时区/多进程时钟偏差会让对话顺序错乱。
- **修复**：增加 `id` 作为 tie-breaker：`order_by(Event.valid_start, Event.id)`。

### Bug #30 — `check_memory_trigger` 在关键词搜索空时仍走历史情绪判断
- **文件**：`src/retention/engine.py:55-62`
- **问题**：第 2/3 个触发规则（情绪模式、纪念日）**总会运行**无论用户说什么，每轮对话都重新统计。
- **影响**：性能浪费，且每次对话都尝试插入 `[记忆提示]`/`[惊喜提示]`，会刷屏。
- **修复**：触发规则互相 short-circuit，只在第一条没触发时跑下一条。

### Bug #31 — `from src.main import app` 时即创建全局实例并连 DB
- **文件**：`src/main.py:47-78`
- **问题**：模块导入即触发 `db_manager.create_tables()`、注册 admin、初始化 mimo client。导入慢且无法用于纯单元测试。
- **修复**：把所有全局实例化挪到 `lifespan` 上下文管理器（FastAPI 推荐的启动钩子）。

### Bug #32 — `chat/send/stream` 用 `memory_store`，与 `/chat/send` 数据完全分离
- **文件**：`src/main.py:543-578`
- **问题**：见 Bug #4；这是流式路径下的具体表现。
- **修复**：同 Bug #4。

### Bug #33 — `chat/send` 中 `valence, arousal` 计算时已离开 with 上下文
- **文件**：`src/main.py:507-540`
- **问题**：`with db_manager.get_session() as session:` 块在 526 行结束，但 `valence, arousal` 是在块内赋值的局部变量，块外仍可用——这里**不**是 bug。但 `emotion = emotion_repo.get_latest(req.user_id)` 在 502 行调用了 session 内 repo，session 已 commit/close 后再访问 `emotion.valence` 属性如果 session 已 detach 会抛 `DetachedInstanceError`（SQLAlchemy 1.4+ 默认 expire_on_commit=True）。**当前 `emotion_label` 只取 `_get_emotion_label(emotion)`，emotion 在 close 之前属性已被读取过，所以暂时安全**；但任何后续扩展（例如 `emotion.to_dict()` 移到 with 块外）都会爆。
- **修复**：把 with 块扩到返回前；或者在 `emotion_repo.get_latest` 之后立即 copy 出需要字段。

---

## 五、修复优先级建议

### P0（必须先修）
1. Bug #1（注册不可用）
2. Bug #2（JWT 默认密钥）
3. Bug #3（admin 默认密码）
4. Bug #4 / #32（双存储分脑）
5. Bug #6（变量未定义 → TypeError）
6. Bug #7（数据越权）
7. Bug #10（CORS 配置错误）

### P1（上线前修）
8. Bug #8（关键词搜索几乎失效）
9. Bug #9（admin id 覆盖）
10. Bug #11（密码哈希算法）
11. Bug #12（send_email 假装成功）
12. Bug #13（DB 缺字段）
13. Bug #14（硬编码路径）
14. Bug #16（TokenResponse 缺字段）

### P2（迭代中修）
15. 其余 medium / low 项

---

## 六、建议的重构方向

1. **统一存储后端**：把 `MemoryStore`、`GraphStore`、`UserStore` 全部从内存实现切到 DB，所有 `main.py` 写入路径只走 `db_manager`。
2. **引入 PyJWT + passlib[bcrypt]**：替换手写的简化 token 与 SHA256 哈希。
3. **FastAPI lifespan 启动钩子**：把全局实例化、admin 初始化、模型 client 创建全部挪到 `lifespan` 上下文，模块导入即可做单元测试。
4. **统一两套情绪标签**：`MemoryStore.get_emotion_label` 的 `"低落/难过"`/`"焦虑/愤怒"` 与 `main.py:_get_emotion_label` 的 `"难过"`/`"焦虑"` 应当统一，否则 sticker 抑制规则永远不生效。
5. **sticker 注入分层**：`sticker_manager.process_reply` 改返回 `(text, sticker_category)`，由接口层决定是否在响应中暴露 sticker 字段，存储前先剥离标记。

---

*本清单由 MiMo Code + DebateForge 多模型交叉验证产出，已在 Python 3.13 + SQLAlchemy 2.x 环境下复现关键 bug。*
