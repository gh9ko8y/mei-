"""表情包管理器：分类、选择、发送逻辑"""

import random
import json
from pathlib import Path
from typing import Optional, List
from datetime import datetime


# 表情包子类定义
STICKER_CATEGORIES = {
    # 开心类
    "撒花": {"emotion": "positive", "intensity": "high", "desc": "庆祝、好消息"},
    "比心": {"emotion": "positive", "intensity": "medium", "desc": "喜欢、感谢"},
    "偷笑": {"emotion": "positive", "intensity": "low", "desc": "好笑、开心"},
    # 难过类
    "委屈": {"emotion": "negative", "intensity": "low", "desc": "被批评、小委屈"},
    "哭泣": {"emotion": "negative", "intensity": "high", "desc": "真的伤心"},
    "抱抱": {"emotion": "negative", "intensity": "medium", "desc": "安慰对方"},
    # 生气类
    "哼": {"emotion": "angry", "intensity": "low", "desc": "小不满"},
    "翻白眼": {"emotion": "angry", "intensity": "medium", "desc": "对方说了傻话"},
    # 撒娇类
    "歪头": {"emotion": "cute", "intensity": "low", "desc": "求关注、装可爱"},
    "嘟嘴": {"emotion": "cute", "intensity": "medium", "desc": "小委屈、撒娇"},
    "蹭蹭": {"emotion": "cute", "intensity": "high", "desc": "亲近、依赖"},
    # 日常类
    "早安": {"emotion": "daily", "intensity": "low", "desc": "早上问候"},
    "晚安": {"emotion": "daily", "intensity": "low", "desc": "晚上道别"},
    "吃饭": {"emotion": "daily", "intensity": "low", "desc": "到饭点了"},
    # 调皮类
    "吐舌头": {"emotion": "playful", "intensity": "low", "desc": "开玩笑"},
    "偷看": {"emotion": "playful", "intensity": "low", "desc": "好奇、偷窥"},
}

# 用户输入到表情包子类的映射规则
INPUT_TO_CATEGORY = {
    # 时间相关
    "早": "早安",
    "早上好": "早安",
    "晚安": "晚安",
    "睡了": "晚安",
    "吃饭": "吃饭",
    "午饭": "吃饭",
    "晚饭": "吃饭",
    # 情绪相关
    "开心": "撒花",
    "高兴": "撒花",
    "太好了": "撒花",
    "生日": "撒花",
    "谢谢": "比心",
    "感谢": "比心",
    "爱你": "比心",
    "难过": "抱抱",
    "伤心": "抱抱",
    "委屈": "委屈",
    "哭了": "哭泣",
    "生气": "哼",
    "讨厌": "哼",
    "无聊": "歪头",
    "想你": "蹭蹭",
}


class StickerManager:
    """表情包管理器"""

    def __init__(self, sticker_dir: Optional[str] = None):
        self.sticker_dir = Path(sticker_dir) if sticker_dir else Path("/data/stickers")
        self._last_category = None
        # 确保目录存在
        self.sticker_dir.mkdir(parents=True, exist_ok=True)
        self.user_stickers_file = self.sticker_dir / "user_stickers.json"

    def should_send_sticker(
        self,
        ai_reply: str,
        user_input: str,
        emotion_label: str,
        consecutive_stickers: int = 0,
    ) -> bool:
        """判断是否应该发表情包"""

        # 规则1：连续发了2张就不发了
        if consecutive_stickers >= 2:
            return False

        # 规则2：用户在倾诉重要事情时不发
        serious_keywords = ["工作", "考试", "生病", "家人", "分手", "辞职", "压力"]
        if any(kw in user_input for kw in serious_keywords):
            return False

        # 规则3：情绪很低落时不发
        # 标签与 main._get_emotion_label 保持一致：开心/平静/难过/焦虑/中性
        if emotion_label in ["难过", "焦虑"]:
            return False

        # 规则4：短回复倾向发表情包
        if len(ai_reply) < 30:
            return random.random() < 0.6

        # 规则5：特定场景（早安/晚安/开心等）倾向发表情包
        trigger_words = ["早安", "晚安", "生日", "快乐", "开心", "哈哈", "爱你"]
        if any(tw in ai_reply or tw in user_input for tw in trigger_words):
            return random.random() < 0.7

        # 规则6：默认 30% 概率
        return random.random() < 0.3

    def select_category(self, ai_reply: str, user_input: str) -> str:
        """根据回复内容选择表情包子类"""
        # 优先从用户输入匹配
        for keyword, category in INPUT_TO_CATEGORY.items():
            if keyword in user_input:
                return category

        # 其次从AI回复匹配
        for keyword, category in INPUT_TO_CATEGORY.items():
            if keyword in ai_reply:
                return category

        # 根据回复情感推断
        positive_words = ["开心", "高兴", "太好了", "真棒", "喜欢"]
        negative_words = ["难过", "伤心", "抱歉", "担心"]
        cute_words = ["宝贝", "亲爱的", "嘻嘻", "嘿嘿"]

        if any(w in ai_reply for w in positive_words):
            return random.choice(["撒花", "比心", "偷笑"])
        if any(w in ai_reply for w in negative_words):
            return random.choice(["抱抱", "委屈"])
        if any(w in ai_reply for w in cute_words):
            return random.choice(["歪头", "嘟嘴", "蹭蹭"])

        # 默认
        return random.choice(["偷笑", "歪头", "比心"])

    def get_sticker_path(self, category: str) -> Optional[str]:
        """获取表情包图片路径"""
        if not self.sticker_dir:
            return None

        category_dir = self.sticker_dir / category
        if not category_dir.exists():
            return None

        stickers = list(category_dir.glob("*.png")) + list(category_dir.glob("*.gif"))
        if not stickers:
            return None

        return str(random.choice(stickers))

    def process_reply(self, ai_reply: str, user_input: str,
                      emotion_label: str, consecutive_stickers: int = 0) -> str:
        """处理AI回复，决定是否插入表情包标记

        返回格式：
        - 如果要发表情包：回复内容 + [STICKER: 子类名]
        - 如果不发：原回复内容
        """
        if not self.should_send_sticker(ai_reply, user_input, emotion_label, consecutive_stickers):
            return ai_reply

        category = self.select_category(ai_reply, user_input)

        # 避免连续发同类
        if category == self._last_category:
            alternatives = [c for c in STICKER_CATEGORIES
                           if STICKER_CATEGORIES[c]["emotion"] == STICKER_CATEGORIES[category]["emotion"]
                           and c != category]
            if alternatives:
                category = random.choice(alternatives)

        self._last_category = category
        return f"{ai_reply}\n[STICKER:{category}]"

    @staticmethod
    def get_sticker_prompt_instruction() -> str:
        """获取注入到系统提示中的表情包使用指导"""
        return """
表情包使用规则：
- 当你的情绪明显变化时，可以配一张表情包
- 撒娇、调皮的时候适合发表情包
- 认真分析问题时不发
- 用户在倾诉重要事情时不发
- 情绪很低落时不发，用文字更真诚
- 大约30%的回复配表情包，不要每次都发

当你想发表情包时，在回复末尾加一行：
[STICKER: 子类名]

可用的子类：
撒花（庆祝）、比心（喜欢）、偷笑（好笑）、
委屈（小委屈）、哭泣（伤心）、抱抱（安慰）、
哼（不满）、翻白眼（无语）、
歪头（可爱）、嘟嘴（撒娇）、蹭蹭（亲近）、
早安、晚安、吃饭、
吐舌头（开玩笑）、偷看（好奇）

例如：
太好了！恭喜你呀~
[STICKER:撒花]

注意：不要每次都发，只在自然的时候发。
"""

    # ============================================
    # 用户表情包管理
    # ============================================

    def load_user_stickers(self, user_id: int) -> List[dict]:
        """加载用户自定义表情包"""
        user_file = self.sticker_dir / f"user_{user_id}.json"
        if not user_file.exists():
            return []
        with open(user_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def save_user_stickers(self, user_id: int, stickers: List[dict]):
        """保存用户自定义表情包"""
        user_file = self.sticker_dir / f"user_{user_id}.json"
        with open(user_file, "w", encoding="utf-8") as f:
            json.dump(stickers, f, ensure_ascii=False, indent=2)

    def add_user_sticker(self, user_id: int, filename: str, nickname: str) -> dict:
        """添加用户自定义表情包"""
        stickers = self.load_user_stickers(user_id)
        new_sticker = {
            "id": len(stickers) + 1,
            "filename": filename,
            "nickname": nickname,
            "url": f"/sticker-files/{filename}",
            "created_at": datetime.now().isoformat(),
        }
        stickers.append(new_sticker)
        self.save_user_stickers(user_id, stickers)
        return new_sticker

    def delete_user_sticker(self, user_id: int, sticker_id: int) -> bool:
        """删除用户自定义表情包"""
        stickers = self.load_user_stickers(user_id)
        original_len = len(stickers)
        stickers = [s for s in stickers if s["id"] != sticker_id]
        if len(stickers) < original_len:
            self.save_user_stickers(user_id, stickers)
            return True
        return False

    def get_all_user_stickers(self, user_id: int) -> List[dict]:
        """获取用户所有自定义表情包"""
        return self.load_user_stickers(user_id)
