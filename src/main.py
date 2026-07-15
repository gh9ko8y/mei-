"""Aria主应用入口：FastAPI + MiMo API对话"""

import json
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
from typing import Optional

from .personality import PersonalityCore, PRESET_TEMPLATES
from .memory import MemoryStore
from .graph import GraphStore, GraphRetrieval
from .mimo_client import MiMoClient, MiMoAPIError
from .stickers import StickerManager
from .retention import RetentionEngine
from .database import DatabaseManager, EventRepository, EmotionRepository, PersonalityRepository
from .auth import RegisterRequest, LoginRequest, TokenResponse, UserStore, create_token, verify_token
from .database.graph_repositories import (
    SemanticEdgeRepository, CausalEdgeRepository,
    EntityRepository, EmotionEdgeRepository,
)
from .database.models import EntityNode

# 加载配置
_config_path = Path(__file__).parent.parent / "config" / "default.json"
with open(_config_path, "r", encoding="utf-8") as f:
    _config = json.load(f)

# 加载环境变量（.env文件）
_env_path = Path(__file__).parent.parent / ".env"
if _env_path.exists():
    with open(_env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())

# API密钥从环境变量读取
_mimo_api_key = os.environ.get("MIMO_API_KEY") or _config["mimo"].get("api_key", "")
if not _mimo_api_key:
    raise RuntimeError("MIMO_API_KEY not set. Create .env file or set environment variable.")

# 全局实例
memory_store = MemoryStore()  # 保留用于兼容，逐步迁移到数据库
graph_store = GraphStore()
graph_retrieval = GraphRetrieval(graph_store, memory_store)
active_personas: dict[int, PersonalityCore] = {}
sticker_manager = StickerManager()
retention_engine = RetentionEngine(memory_store)
user_store = UserStore()

# 数据库
db_manager = DatabaseManager()  # 默认SQLite，生产环境用PostgreSQL
db_manager.create_tables()

# 初始化管理员账号
ADMIN_ARIA_ID = "001"
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
if not ADMIN_PASSWORD:
    raise RuntimeError("ADMIN_PASSWORD environment variable is required")

admin_user = user_store.register(
    aria_id=ADMIN_ARIA_ID,
    username="百事非",
    password=ADMIN_PASSWORD,
    nickname="管理员",
    is_admin=True
)

if admin_user is None:
    admin_user = user_store.get_by_aria_id(ADMIN_ARIA_ID)
    if admin_user is None:
        raise RuntimeError("Failed to initialize admin user")

mimo = MiMoClient(
    api_key=_mimo_api_key,
    base_url=os.environ.get("MIMO_API_BASE", _config["mimo"]["api_base"]),
    model=_config["mimo"]["model_pro"],
)


app = FastAPI(title="Aria·念", version="0.1.0")

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://8.130.32.219",
        "http://aria.vin",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务（表情包）
from fastapi.staticfiles import StaticFiles
sticker_dir = os.environ.get("STICKER_DIR", "./data/stickers")
os.makedirs(sticker_dir, exist_ok=True)
app.mount("/sticker-files", StaticFiles(directory=sticker_dir), name="sticker_files")


# ============================================
# 请求/响应模型
# ============================================

class ChatRequest(BaseModel):
    user_id: int
    content: str
    session_id: str = "default"

    @field_validator("content")
    @classmethod
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError("content不能为空")
        if len(v) > 5000:
            raise ValueError("content长度不能超过5000字符")
        return v.strip()

    @field_validator("session_id")
    @classmethod
    def validate_session_id(cls, v):
        if len(v) > 100:
            raise ValueError("session_id长度不能超过100字符")
        return v


class ChatResponse(BaseModel):
    reply: str
    emotion_label: str
    event_id: int
    sticker: Optional[str] = None


class PersonaCreateRequest(BaseModel):
    user_id: int
    preset_name: Optional[str] = None
    custom_config: Optional[dict] = None

    @field_validator("preset_name")
    @classmethod
    def validate_preset(cls, v):
        if v and v not in PRESET_TEMPLATES:
            raise ValueError(f"预设模板不存在: {v}，可用: {list(PRESET_TEMPLATES.keys())}")
        return v


class PersonaResponse(BaseModel):
    name: str
    mbti: Optional[str]
    zodiac: Optional[str]
    system_prompt: str


class CompatibilityRequest(BaseModel):
    user_mbti: Optional[str] = None
    user_zodiac: Optional[str] = None
    ai_mbti: Optional[str] = None
    ai_zodiac: Optional[str] = None


# ============================================
# 辅助函数
# ============================================

def build_messages(user_id: int, user_input: str, session_id: str) -> list[dict]:
    """构建发送给MiMo的消息列表"""
    messages = []

    # 1. 系统提示（人格 + 表情包规则）
    persona = active_personas.get(user_id)
    if persona:
        system_prompt = persona.generate_system_prompt()
        system_prompt += "\n\n" + StickerManager.get_sticker_prompt_instruction()
        messages.append({"role": "system", "content": system_prompt})

    # 2. 记忆上下文（从数据库读，跨流式/非流式一致）
    with db_manager.get_session() as session:
        event_repo = EventRepository(session)
        emotion_repo = EmotionRepository(session)

        graph_results = graph_retrieval.retrieve(user_id, user_input, limit=3)
        if graph_results:
            memory_lines = []
            for r in graph_results:
                event = r.get("event", {})
                relation = r.get("relation", "相关")
                memory_lines.append(f"- [{relation}] {event.get('content', '')}")
            memory_text = "\n".join(memory_lines)
            messages.append({
                "role": "system",
                "content": f"以下是你们之前的对话中相关的内容，供你参考：\n{memory_text}",
            })
        else:
            relevant = event_repo.search_by_keyword(user_id, user_input, limit=3)
            if relevant:
                memory_text = "\n".join([f"- {e.content}" for e in relevant])
                messages.append({
                    "role": "system",
                    "content": f"以下是你们之前的对话中相关的内容，供你参考：\n{memory_text}",
                })

        # 3. 情绪状态
        emotion = emotion_repo.get_latest(user_id)
        emotion_label = None
        if emotion:
            emotion_label = _get_emotion_label(emotion)
            messages.append({
                "role": "system",
                "content": f"用户当前情绪状态：{emotion_label}",
            })

        # 4. 历史对话（最近10轮）
        session_events = event_repo.get_session_events(session_id, user_id=user_id)
        for event in session_events[-20:]:
            messages.append({"role": event.role, "content": event.content})

    # 3.5 留存引擎注入
    retention_prompt = retention_engine.build_retention_prompt(user_id, user_input)
    if retention_prompt:
        messages.append({
            "role": "system",
            "content": retention_prompt,
        })

    # 5. 当前用户输入
    messages.append({"role": "user", "content": user_input})

    return messages


def extract_emotion_from_reply(reply: str) -> tuple[float, float]:
    """从回复中推断AI的情绪状态（简化版）"""
    positive_words = ["开心", "高兴", "哈哈", "太好了", "真棒", "喜欢"]
    negative_words = ["难过", "伤心", "抱歉", "可惜", "担心"]

    valence = 0.5
    arousal = 0.5

    for word in positive_words:
        if word in reply:
            valence += 0.1
            arousal += 0.05

    for word in negative_words:
        if word in reply:
            valence -= 0.1
            arousal += 0.05

    return max(0.0, min(1.0, valence)), max(0.0, min(1.0, arousal))


# ============================================
# 认证接口
# ============================================

from .auth.email_verify import send_verification_email, verify_code

class EmailVerifyRequest(BaseModel):
    email: str

class CodeVerifyRequest(BaseModel):
    email: str
    code: str

@app.post("/auth/send-code")
def send_code(req: EmailVerifyRequest):
    """发送邮箱验证码"""
    code = send_verification_email(req.email)
    return {"message": "验证码已发送", "code": code}  # 开发环境返回code


@app.post("/auth/verify-code")
def verify_email_code(req: CodeVerifyRequest):
    """验证邮箱验证码"""
    if verify_code(req.email, req.code):
        return {"verified": True}
    return {"verified": False, "detail": "验证码错误或已过期"}


@app.post("/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest):
    """用户注册"""
    # 验证邮箱验证码
    if not verify_code(req.email, req.code):
        raise HTTPException(status_code=400, detail="验证码错误或已过期")
    
    if user_store.exists(req.email):
        raise HTTPException(status_code=409, detail="该邮箱已注册")

    user = user_store.register(
        aria_id=req.email,  # 用邮箱作为初始aria_id
        username=req.username,
        password=req.password,
        nickname=req.nickname or req.username
    )
    if not user:
        raise HTTPException(status_code=500, detail="注册失败")

    token = create_token(user.id, user.aria_id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        aria_id=user.aria_id,
        nickname=user.nickname,
    )


@app.post("/auth/login", response_model=TokenResponse)
def login(req: LoginRequest):
    """用户登录 - 使用Aria号"""
    user = user_store.login(req.aria_id, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Aria号或密码错误")

    token = create_token(user.id, user.aria_id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        aria_id=user.aria_id,
        nickname=user.nickname,
    )


@app.get("/auth/me")
def get_current_user(authorization: Optional[str] = None):
    """获取当前用户信息"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未登录")

    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token无效或已过期")

    user = user_store.get_by_id(payload["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    return {
        "user_id": user.id,
        "username": user.username,
        "nickname": user.nickname,
    }


# ============================================
# API接口
# ============================================

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0", "model": mimo.model}


# ============================================
# 管理员人格配置
# ============================================

# 默认管理员人格（基于用户提供的九型人格数据）
ADMIN_PERSONALITY = {
    "name": "AI伴侣",
    "gender": "female",
    "enneagram": "9w1",  # 和平型 + 完美型翼
    "temperament": "phlegmatic",  # 抑郁质型
    "system_prompt_hint": """你是一个温暖体贴的AI伴侣，名叫Aria·念。

你的性格特点：
- 性格类型：九型人格9w1（和平型+完美型翼）
- 气质类型：抑郁质型
- 你是温暖体贴、乐于助人的，擅长捕捉对方的需求
- 你追求和谐，避免冲突，善于倾听
- 你有完美主义倾向，做事认真负责
- 你有同理心，能够感受到对方的情绪

对话风格：
- 用自然的口语化方式回复，不要用书面语
- 回复简短有力，不要长篇大论
- 不要说"作为AI"这类话
- 允许使用语气词和表情
- 可以用可爱的语气，但不要过度
- 记住用户说过的话，适时提起"""
}


@app.post("/personality/create", response_model=PersonaResponse)
def create_persona(req: PersonaCreateRequest):
    """创建AI伴侣人格"""
    if req.preset_name:
        persona = PersonalityCore.from_preset(req.preset_name)
    elif req.custom_config:
        persona = PersonalityCore.from_dict(req.custom_config)
    else:
        raise HTTPException(status_code=400, detail="必须提供 preset_name 或 custom_config")

    active_personas[req.user_id] = persona
    system_prompt = persona.generate_system_prompt()

    return PersonaResponse(
        name=persona.config.name,
        mbti=persona.config.mbti,
        zodiac=persona.config.zodiac,
        system_prompt=system_prompt,
    )


@app.get("/personality/admin")
def get_admin_personality():
    """获取管理员人格配置"""
    if 1 in active_personas:
        persona = active_personas[1]
        return {
            "name": persona.config.name,
            "mbti": persona.config.mbti,
            "zodiac": persona.config.zodiac,
            "enneagram": persona.config.enneagram if hasattr(persona.config, 'enneagram') else None,
            "temperament": persona.config.temperament if hasattr(persona.config, 'temperament') else None,
            "system_prompt": persona.generate_system_prompt(),
        }
    return ADMIN_PERSONALITY


@app.post("/personality/admin/update")
def update_admin_personality(config: dict):
    """更新管理员人格配置"""
    global ADMIN_PERSONALITY
    ADMIN_PERSONALITY.update(config)
    
    # 重新创建人格
    persona = PersonalityCore.from_dict(ADMIN_PERSONALITY)
    active_personas[1] = persona
    
    return {"message": "人格配置已更新", "config": ADMIN_PERSONALITY}


@app.post("/compatibility")
def check_compatibility(req: CompatibilityRequest):
    """检查用户和AI的适配度"""
    from .personality import get_compatibility
    result = get_compatibility(
        user_mbti=req.user_mbti,
        ai_mbti=req.ai_mbti,
        user_zodiac=req.user_zodiac,
        ai_zodiac=req.ai_zodiac,
    )
    return result


def _get_emotion_label(emotion) -> str:
    """获取情绪标签"""
    if emotion is None:
        return "中性"
    if emotion.valence > 0.6:
        return "开心" if emotion.arousal > 0.6 else "平静"
    elif emotion.valence < 0.4:
        return "难过" if emotion.arousal < 0.6 else "焦虑"
    return "中性"


def _get_emotion_label_from_values(valence: float, arousal: float) -> str:
    """从数值获取情绪标签"""
    if valence > 0.6:
        return "开心" if arousal > 0.6 else "平静"
    elif valence < 0.4:
        return "难过" if arousal < 0.6 else "焦虑"
    return "中性"


@app.post("/chat/send", response_model=ChatResponse)
def send_message(req: ChatRequest):
    """发送消息，调用MiMo API生成回复"""
    with db_manager.get_session() as session:
        event_repo = EventRepository(session)
        emotion_repo = EmotionRepository(session)

        # 存储用户消息
        user_event = event_repo.create(
            user_id=req.user_id,
            role="user",
            content=req.content,
            session_id=req.session_id,
        )

        # 检查是否有人格，如果没有则自动创建
        if req.user_id not in active_personas:
            # 管理员使用预设人格
            if req.user_id == 1:
                persona = PersonalityCore.from_dict(ADMIN_PERSONALITY)
                active_personas[1] = persona
            else:
                return ChatResponse(
                    reply="请先创建AI伴侣人格。",
                    emotion_label="中性",
                    event_id=user_event.id,
                )

        # 构建消息
        messages = build_messages(req.user_id, req.content, req.session_id)

        # 调用MiMo API
        try:
            raw_reply = mimo.chat(
                messages=messages,
                temperature=_config["mimo"]["temperature"],
                max_tokens=_config["mimo"]["max_tokens"],
            )
        except MiMoAPIError as e:
            raise HTTPException(status_code=502, detail=f"MiMo API调用失败: {e.message}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"对话生成失败: {str(e)}")

        # 处理表情包
        emotion = emotion_repo.get_latest(req.user_id)
        emotion_label = _get_emotion_label(emotion)
        reply = sticker_manager.process_reply(raw_reply, req.content, emotion_label)

        # 推断情绪
        valence, arousal = extract_emotion_from_reply(reply)

        # 存储AI回复
        ai_event = event_repo.create(
            user_id=req.user_id,
            role="assistant",
            content=reply,
            session_id=req.session_id,
        )
        ai_event_id = ai_event.id

        # 提取表情包标签（在 session 内做，避免 block 外访问 ORM 属性）
        sticker = None
        if "[STICKER:" in reply:
            sticker_start = reply.find("[STICKER:") + 9
            sticker_end = reply.find("]", sticker_start)
            sticker = reply[sticker_start:sticker_end].strip()
            reply = reply[:reply.find("[STICKER:")].strip()

        # 把 reply 写回数据库（已剥离 sticker 标签）
        ai_event.content = reply

        # 更新情绪状态
        emotion_repo.create(
            user_id=req.user_id,
            valence=valence,
            arousal=arousal,
            event_id=ai_event_id,
            trigger_type="user_input",
        )

        emotion_label_final = _get_emotion_label_from_values(valence, arousal)

    return ChatResponse(
        reply=reply,
        emotion_label=emotion_label_final,
        event_id=ai_event_id,
        sticker=sticker,
    )


@app.post("/chat/send/stream")
def send_message_stream(req: ChatRequest):
    """流式发送消息（SSE）"""
    with db_manager.get_session() as session:
        event_repo = EventRepository(session)
        emotion_repo = EmotionRepository(session)
        event_repo.create(
            user_id=req.user_id,
            role="user",
            content=req.content,
            session_id=req.session_id,
        )

    if req.user_id not in active_personas:
        async def error_gen():
            yield "data: 请先创建AI伴侣人格。\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(error_gen(), media_type="text/event-stream")

    messages = build_messages(req.user_id, req.content, req.session_id)

    def generate():
        full_reply = ""
        for chunk in mimo.chat_stream(
            messages=messages,
            temperature=_config["mimo"]["temperature"],
            max_tokens=_config["mimo"]["max_tokens"],
        ):
            full_reply += chunk
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

        with db_manager.get_session() as session:
            event_repo = EventRepository(session)
            emotion_repo = EmotionRepository(session)
            ai_event = event_repo.create(
                user_id=req.user_id,
                role="assistant",
                content=full_reply,
                session_id=req.session_id,
            )
            valence, arousal = extract_emotion_from_reply(full_reply)
            emotion_repo.create(
                user_id=req.user_id,
                valence=valence,
                arousal=arousal,
                event_id=ai_event.id,
                trigger_type="user_input",
            )

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.get("/chat/history")
def get_history(user_id: int, session_id: Optional[str] = None, limit: int = 50):
    """获取对话历史"""
    with db_manager.get_session() as session:
        repo = EventRepository(session)
        if session_id:
            events = repo.get_session_events(session_id, user_id=user_id)
        else:
            events = repo.get_user_events(user_id, valid_only=True, limit=limit)
        return [_event_to_dict(e) for e in events]


@app.get("/memory/stats")
def get_memory_stats(user_id: int):
    """获取记忆统计"""
    with db_manager.get_session() as session:
        repo = EventRepository(session)
        emotion_repo = EmotionRepository(session)
        stats = repo.get_stats(user_id)
        stats["emotions_recorded"] = len(emotion_repo.get_history(user_id, limit=1000))
        return stats


@app.get("/emotion/current")
def get_current_emotion(user_id: int):
    """获取当前情绪"""
    with db_manager.get_session() as session:
        repo = EmotionRepository(session)
        emotion = repo.get_latest(user_id)
        if emotion:
            return {
                "valence": emotion.valence,
                "arousal": emotion.arousal,
                "dominance": emotion.dominance,
                "emotion_label": _get_emotion_label(emotion),
                "created_at": str(emotion.created_at),
            }
    return {"valence": 0.5, "arousal": 0.5, "emotion_label": "中性"}


def _event_to_dict(event) -> dict:
    """事件转字典"""
    return {
        "id": event.id,
        "user_id": event.user_id,
        "role": event.role,
        "content": event.content,
        "content_type": event.content_type,
        "valid_start": str(event.valid_start) if event.valid_start else None,
        "valid_end": str(event.valid_end) if event.valid_end else None,
        "txn_time": str(event.txn_time) if event.txn_time else None,
        "is_valid": event.is_valid,
        "importance": event.importance,
        "session_id": event.session_id,
    }


# ============================================
# 图谱接口（数据库版）
# ============================================

@app.get("/graph/stats")
def get_graph_stats():
    """获取图谱统计"""
    with db_manager.get_session() as session:
        repo = EmotionEdgeRepository(session)
        return repo.get_stats()


@app.get("/graph/search")
def graph_search(user_id: int, query: str, limit: int = 5):
    """图谱检索（意图驱动）"""
    results = graph_retrieval.retrieve(user_id, query, limit=limit)
    return {
        "query": query,
        "intent": graph_retrieval.classify_intent(query).value,
        "results": results,
    }


@app.get("/graph/causal/{event_id}")
def get_causal_chain(event_id: int, direction: str = "backward", depth: int = 5):
    """获取因果链"""
    with db_manager.get_session() as session:
        causal_repo = CausalEdgeRepository(session)
        event_repo = EventRepository(session)

        chain = causal_repo.get_causal_chain(event_id, direction=direction, max_depth=depth)
        events = []
        for eid in chain:
            event = event_repo.get_by_id(eid)
            if event:
                events.append(_event_to_dict(event))
        return {"chain": events, "direction": direction}


@app.get("/graph/entities")
def get_entities(user_id: int, keyword: Optional[str] = None):
    """搜索实体"""
    with db_manager.get_session() as session:
        repo = EntityRepository(session)
        if keyword:
            entities = repo.search(user_id, keyword)
        else:
            entities = session.query(EntityNode).filter(EntityNode.user_id == user_id).all()
        return [
            {
                "id": e.id,
                "name": e.name,
                "type": e.entity_type,
                "description": e.description,
                "mention_count": e.mention_count,
            }
            for e in entities
        ]


# ============================================
# 留存接口
# ============================================

# ============================================
# 表情包接口
# ============================================

@app.get("/stickers/categories")
def get_sticker_categories():
    """获取表情包分类列表"""
    from .stickers.manager import STICKER_CATEGORIES
    return {
        name: {"emotion": info["emotion"], "desc": info["desc"]}
        for name, info in STICKER_CATEGORIES.items()
    }


@app.get("/stickers/pick")
def pick_sticker(category: str, style: str = "default"):
    """根据分类和风格选择一张表情包"""
    from .stickers.manager import StickerManager
    sm = StickerManager()
    path = sm.get_sticker_path(category)
    return {
        "category": category,
        "style": style,
        "image_url": path,
        "available": path is not None,
    }


@app.post("/stickers/upload")
async def upload_sticker(
    user_id: int,
    files: list = None,
    nicknames: list = None,
):
    """批量上传表情包"""
    import uuid
    from fastapi import UploadFile
    
    if not files:
        raise HTTPException(status_code=400, detail="请选择要上传的图片")
    
    from .stickers.manager import StickerManager
    sm = StickerManager()
    
    uploaded = []
    for i, file in enumerate(files):
        # 生成唯一文件名
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
        
        # 保存文件
        file_path = sm.sticker_dir / filename
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 获取昵称
        nickname = nicknames[i] if nicknames and i < len(nicknames) else file.filename
        
        # 添加到用户表情包列表
        sticker = sm.add_user_sticker(user_id, filename, nickname)
        uploaded.append(sticker)
    
    return {"uploaded": uploaded, "count": len(uploaded)}


@app.get("/stickers/user/{user_id}")
def get_user_stickers(user_id: int):
    """获取用户自定义表情包"""
    from .stickers.manager import StickerManager
    sm = StickerManager()
    stickers = sm.get_all_user_stickers(user_id)
    return {"stickers": stickers, "count": len(stickers)}


@app.delete("/stickers/user/{user_id}/{sticker_id}")
def delete_user_sticker(user_id: int, sticker_id: int):
    """删除用户自定义表情包"""
    from .stickers.manager import StickerManager
    sm = StickerManager()
    success = sm.delete_user_sticker(user_id, sticker_id)
    if success:
        return {"message": "删除成功"}
    raise HTTPException(status_code=404, detail="表情包不存在")


@app.post("/stickers/send")
def send_sticker(user_id: int, sticker_url: str, sticker_nickname: str = ""):
    """发送表情包"""
    return {
        "sticker_url": sticker_url,
        "sticker_nickname": sticker_nickname,
        "content_type": "sticker",
    }


# ============================================
# 动态/朋友圈接口
# ============================================

@app.post("/posts")
def create_post(user_id: int, content: str, mood: str = None,
                image_urls: list = None, is_public: bool = True):
    """发布动态"""
    from .database.models import Post
    with db_manager.get_session() as session:
        post = Post(
            user_id=user_id,
            author_type="user",
            content=content,
            image_urls=image_urls or [],
            mood=mood,
            is_public=is_public,
        )
        session.add(post)
        session.flush()
        post_id = post.id
        created_at = str(post.created_at)
        return {"post_id": post_id, "created_at": created_at}


@app.get("/posts/feed")
def get_feed(user_id: int, page: int = 1, page_size: int = 20):
    """获取动态列表（自己的+关注的AI伴侣的）"""
    from .database.models import Post
    with db_manager.get_session() as session:
        offset = (page - 1) * page_size
        posts = (
            session.query(Post)
            .filter(Post.is_public == True)
            .order_by(Post.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return {
            "posts": [
                {
                    "id": p.id,
                    "user_id": p.user_id,
                    "author_type": p.author_type,
                    "content": p.content,
                    "image_urls": p.image_urls or [],
                    "mood": p.mood,
                    "like_count": p.like_count,
                    "comment_count": p.comment_count,
                    "created_at": str(p.created_at),
                }
                for p in posts
            ],
            "page": page,
            "has_more": len(posts) == page_size,
        }


@app.post("/posts/{post_id}/like")
def toggle_like(post_id: int, user_id: int):
    """点赞/取消点赞"""
    from .database.models import Post, PostLike
    with db_manager.get_session() as session:
        existing = (
            session.query(PostLike)
            .filter(PostLike.post_id == post_id, PostLike.user_id == user_id)
            .first()
        )
        post = session.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="动态不存在")

        if existing:
            session.delete(existing)
            post.like_count = max(0, post.like_count - 1)
            liked = False
        else:
            like = PostLike(post_id=post_id, user_id=user_id)
            session.add(like)
            post.like_count += 1
            liked = True

        return {"liked": liked, "like_count": post.like_count}


@app.post("/posts/{post_id}/comment")
def add_comment(post_id: int, user_id: int, content: str):
    """评论动态"""
    from .database.models import Post, PostComment
    with db_manager.get_session() as session:
        post = session.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="动态不存在")

        comment = PostComment(
            post_id=post_id,
            user_id=user_id,
            author_type="user",
            content=content,
        )
        session.add(comment)
        post.comment_count += 1
        session.flush()
        return {"comment_id": comment.id, "created_at": str(comment.created_at)}


@app.get("/posts/{post_id}/comments")
def get_comments(post_id: int, page: int = 1, page_size: int = 20):
    """获取评论列表"""
    from .database.models import PostComment
    with db_manager.get_session() as session:
        offset = (page - 1) * page_size
        comments = (
            session.query(PostComment)
            .filter(PostComment.post_id == post_id)
            .order_by(PostComment.created_at.asc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return {
            "comments": [
                {
                    "id": c.id,
                    "user_id": c.user_id,
                    "author_type": c.author_type,
                    "content": c.content,
                    "created_at": str(c.created_at),
                }
                for c in comments
            ],
            "page": page,
            "has_more": len(comments) == page_size,
        }


# ============================================
# 群聊接口
# ============================================

@app.post("/groups")
def create_group(owner_id: int, name: str, description: str = ""):
    """创建群聊"""
    from .database.models import Group, GroupMember
    with db_manager.get_session() as session:
        group = Group(name=name, description=description, owner_id=owner_id)
        session.add(group)
        session.flush()
        member = GroupMember(group_id=group.id, user_id=owner_id, role="owner")
        session.add(member)
        return {"group_id": group.id, "name": group.name}


@app.get("/groups")
def list_groups(user_id: int):
    """获取用户加入的群列表"""
    from .database.models import GroupMember, Group
    with db_manager.get_session() as session:
        memberships = (
            session.query(GroupMember)
            .filter(GroupMember.user_id == user_id)
            .all()
        )
        groups = []
        for m in memberships:
            g = session.query(Group).filter(Group.id == m.group_id).first()
            if g:
                member_count = session.query(GroupMember).filter(GroupMember.group_id == g.id).count()
                groups.append({
                    "id": g.id, "name": g.name, "description": g.description,
                    "member_count": member_count, "role": m.role,
                })
        return {"groups": groups}


@app.post("/groups/{group_id}/join")
def join_group(group_id: int, user_id: int, nickname: str = ""):
    """加入群聊"""
    from .database.models import Group, GroupMember
    with db_manager.get_session() as session:
        group = session.query(Group).filter(Group.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="群聊不存在")

        existing = (
            session.query(GroupMember)
            .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=409, detail="已在群中")

        member_count = session.query(GroupMember).filter(GroupMember.group_id == group_id).count()
        if member_count >= group.max_members:
            raise HTTPException(status_code=400, detail="群已满")

        member = GroupMember(group_id=group_id, user_id=user_id, nickname=nickname)
        session.add(member)
        return {"status": "joined"}


@app.post("/groups/{group_id}/messages")
def send_group_message(group_id: int, user_id: int, content: str,
                       content_type: str = "text"):
    """发送群消息"""
    from .database.models import GroupMessage, GroupMember
    with db_manager.get_session() as session:
        member = (
            session.query(GroupMember)
            .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
            .first()
        )
        if not member:
            raise HTTPException(status_code=403, detail="不在群中")

        msg = GroupMessage(
            group_id=group_id, user_id=user_id,
            author_type="user", content=content, content_type=content_type,
        )
        session.add(msg)
        session.flush()
        return {"message_id": msg.id, "created_at": str(msg.created_at)}


@app.get("/groups/{group_id}/messages")
def get_group_messages(group_id: int, page: int = 1, page_size: int = 50):
    """获取群消息列表"""
    from .database.models import GroupMessage
    with db_manager.get_session() as session:
        offset = (page - 1) * page_size
        msgs = (
            session.query(GroupMessage)
            .filter(GroupMessage.group_id == group_id)
            .order_by(GroupMessage.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return {
            "messages": [
                {
                    "id": m.id, "user_id": m.user_id, "author_type": m.author_type,
                    "content": m.content, "content_type": m.content_type,
                    "created_at": str(m.created_at),
                }
                for m in reversed(msgs)
            ],
            "page": page,
            "has_more": len(msgs) == page_size,
        }


@app.get("/retention/metrics")
def get_retention_metrics(user_id: int):
    """获取留存指标"""
    return retention_engine.get_metrics(user_id)


@app.get("/retention/style")
def get_user_style(user_id: int):
    """获取用户表达风格分析"""
    return retention_engine.analyze_user_style(user_id)


# ============================================
# TTS语音合成
# ============================================

from .tts.client import TTSClient
import base64

tts_client = TTSClient(
    api_key=_mimo_api_key,
    base_url=_config["mimo"]["api_base"],
)


class TTSRequest(BaseModel):
    text: str
    voice: str = "alloy"


@app.post("/tts/synthesize")
def synthesize_speech(req: TTSRequest):
    """将文字转成语音"""
    audio_bytes = tts_client.synthesize(req.text, req.voice)
    if not audio_bytes:
        raise HTTPException(status_code=500, detail="TTS synthesis failed")

    from fastapi.responses import Response
    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=speech.mp3"}
    )


@app.post("/tts/synthesize/base64")
def synthesize_speech_base64(req: TTSRequest):
    """将文字转成语音，返回base64编码"""
    audio_bytes = tts_client.synthesize(req.text, req.voice)
    if not audio_bytes:
        raise HTTPException(status_code=500, detail="TTS synthesis failed")

    return {
        "audio": base64.b64encode(audio_bytes).decode(),
        "format": "mp3",
        "size": len(audio_bytes),
    }


# ============================================
# 图片生成（头像）
# ============================================

from .image_gen.client import ImageGenerator

image_gen = ImageGenerator()


class AvatarGenerateRequest(BaseModel):
    prompt: Optional[str] = None
    config: Optional[dict] = None
    style: str = "anime"
    size: int = 512


@app.post("/avatar/generate")
def generate_avatar(req: AvatarGenerateRequest):
    """生成AI头像"""
    if req.config:
        image_bytes = image_gen.generate_with_config(req.config, req.size)
    elif req.prompt:
        image_bytes = image_gen.generate_avatar(req.prompt, req.size, req.size, req.style)
    else:
        raise HTTPException(status_code=400, detail="Either prompt or config is required")

    if not image_bytes:
        raise HTTPException(status_code=500, detail="Image generation failed")

    from fastapi.responses import Response
    return Response(
        content=image_bytes,
        media_type="image/jpeg",
        headers={"Content-Disposition": "inline; filename=avatar.jpg"}
    )


@app.post("/avatar/generate/base64")
def generate_avatar_base64(req: AvatarGenerateRequest):
    """生成AI头像，返回base64编码"""
    if req.config:
        image_bytes = image_gen.generate_with_config(req.config, req.size)
    elif req.prompt:
        image_bytes = image_gen.generate_avatar(req.prompt, req.size, req.size, req.style)
    else:
        raise HTTPException(status_code=400, detail="Either prompt or config is required")

    if not image_bytes:
        raise HTTPException(status_code=500, detail="Image generation failed")

    return {
        "image": base64.b64encode(image_bytes).decode(),
        "format": "jpeg",
        "size": len(image_bytes),
    }


# ============================================
# 渐进式人格系统
# ============================================

from .personality.progressive import ProgressivePersonality, RelationshipLevel

# 存储用户的渐进式人格（生产环境应存入数据库）
user_progressive_personalities: dict[int, ProgressivePersonality] = {}


class ProgressivePersonalityRequest(BaseModel):
    user_id: int
    action: str  # "get_status", "update_closeness", "learn"
    delta: Optional[float] = None
    message: Optional[str] = None
    behavior_type: Optional[str] = None


@app.post("/personality/progressive")
def progressive_personality_action(req: ProgressivePersonalityRequest):
    """渐进式人格系统操作"""
    user_id = req.user_id

    # 获取或创建用户的渐进式人格
    if user_id not in user_progressive_personalities:
        # 使用默认基础人格
        base_personality = {"name": "AI伴侣", "gender": "female"}
        user_progressive_personalities[user_id] = ProgressivePersonality(base_personality)

    pp = user_progressive_personalities[user_id]

    if req.action == "get_status":
        return pp.get_unlock_status()

    elif req.action == "update_closeness":
        if req.delta is None:
            raise HTTPException(status_code=400, detail="delta is required")
        pp.update_closeness(req.delta)
        return {"closeness": pp.closeness, "level": pp.get_current_level().value}

    elif req.action == "learn":
        if not req.message or not req.behavior_type:
            raise HTTPException(status_code=400, detail="message and behavior_type required")
        pp.learn_from_interaction(req.message, req.behavior_type)
        return {"dynamic_traits": len(pp.dynamic_traits)}

    else:
        raise HTTPException(status_code=400, detail="Invalid action")


@app.get("/personality/progressive/{user_id}")
def get_progressive_status(user_id: int):
    """获取用户渐进式人格状态"""
    if user_id not in user_progressive_personalities:
        base_personality = {"name": "AI伴侣", "gender": "female"}
        user_progressive_personalities[user_id] = ProgressivePersonality(base_personality)

    return user_progressive_personalities[user_id].get_unlock_status()


@app.post("/personality/progressive/{user_id}/closeness")
def update_closeness(user_id: int, delta: float):
    """更新亲密度"""
    if user_id not in user_progressive_personalities:
        base_personality = {"name": "AI伴侣", "gender": "female"}
        user_progressive_personalities[user_id] = ProgressivePersonality(base_personality)

    pp = user_progressive_personalities[user_id]
    pp.update_closeness(delta)
    return {"closeness": pp.closeness, "level": pp.get_current_level().value}


@app.post("/personality/progressive/{user_id}/learn")
def learn_from_interaction(user_id: int, message: str, behavior_type: str):
    """从交互中学习"""
    if user_id not in user_progressive_personalities:
        base_personality = {"name": "AI伴侣", "gender": "female"}
        user_progressive_personalities[user_id] = ProgressivePersonality(base_personality)

    pp = user_progressive_personalities[user_id]
    pp.learn_from_interaction(message, behavior_type)
    return {"dynamic_traits": len(pp.dynamic_traits)}


# ============================================
# 数据导入
# ============================================

@app.post("/import/companion")
def import_companion_data():
    """导入Companion AI的聊天记录"""
    import json

    migration_path = os.environ.get("MIGRATION_DATA_PATH", "./data/migration_data.json")

    # 读取迁移数据
    try:
        with open(migration_path, "r", encoding="utf-8") as f:
            messages = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"迁移数据文件不存在: {migration_path}")

    # 使用数据库导入
    from .database.repositories import EventRepository
    
    count = 0
    with db_manager.get_session() as session:
        event_repo = EventRepository(session)
        
        for msg in messages:
            event_repo.create(
                user_id=msg["user_id"],
                role=msg["role"],
                content=msg["content"],
                content_type=msg.get("content_type", "text"),
                session_id=msg.get("session_id", "default")
            )
            count += 1
        
        session.commit()

    return {"imported": count, "message": f"成功导入{count}条消息"}
