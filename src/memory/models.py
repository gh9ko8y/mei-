"""记忆系统数据模型"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import json


@dataclass
class Event:
    """对话事件（Ledger条目）"""
    id: Optional[int] = None
    user_id: int = 0
    role: str = "user"  # user / assistant / system
    content: str = ""
    content_type: str = "text"  # text / voice / image
    embedding: Optional[list] = None  # 向量表示
    valid_start: Optional[datetime] = None
    valid_end: Optional[datetime] = None
    txn_time: Optional[datetime] = None
    is_valid: bool = True
    importance: float = 0.5
    metadata: dict = field(default_factory=dict)
    session_id: str = ""

    def __post_init__(self):
        if self.valid_start is None:
            self.valid_start = datetime.now()
        if self.txn_time is None:
            self.txn_time = datetime.now()

    def is_currently_valid(self) -> bool:
        """检查当前是否有效"""
        if not self.is_valid:
            return False
        now = datetime.now()
        if self.valid_start and now < self.valid_start:
            return False
        if self.valid_end and now > self.valid_end:
            return False
        return True

    def invalidate(self, reason: str = ""):
        """标记为无效（软删除）"""
        self.is_valid = False
        self.valid_end = datetime.now()
        if reason:
            self.metadata["invalidation_reason"] = reason

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "role": self.role,
            "content": self.content,
            "content_type": self.content_type,
            "valid_start": self.valid_start.isoformat() if self.valid_start else None,
            "valid_end": self.valid_end.isoformat() if self.valid_end else None,
            "txn_time": self.txn_time.isoformat() if self.txn_time else None,
            "is_valid": self.is_valid,
            "importance": self.importance,
            "metadata": self.metadata,
            "session_id": self.session_id,
        }


@dataclass
class EmotionState:
    """情绪状态"""
    id: Optional[int] = None
    user_id: int = 0
    event_id: Optional[int] = None
    valence: float = 0.5     # 效价 0.0(负) - 1.0(正)
    arousal: float = 0.5     # 唤醒度 0.0(平静) - 1.0(激动)
    dominance: float = 0.5   # 主导度 0.0(被动) - 1.0(主动)
    user_valence: Optional[float] = None
    user_arousal: Optional[float] = None
    trigger_type: str = "user_input"  # user_input / proactive / recovery
    created_at: Optional[datetime] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

    def update(self, new_valence: float, new_arousal: float, decay: float = 0.7):
        """更新情绪状态（带惯性）"""
        self.valence = decay * self.valence + (1 - decay) * new_valence
        self.arousal = decay * self.arousal + (1 - decay) * new_arousal

    def apply_contagion(self, partner_valence: float, partner_arousal: float,
                        closeness: float = 0.5):
        """应用情绪传染"""
        contagion_strength = closeness * partner_arousal
        self.valence += contagion_strength * (partner_valence - self.valence)
        self.arousal += contagion_strength * (partner_arousal - self.arousal)

    def get_emotion_label(self) -> str:
        """获取情绪标签"""
        if self.valence > 0.6:
            if self.arousal > 0.6:
                return "开心/兴奋"
            return "平静/满足"
        elif self.valence < 0.4:
            if self.arousal > 0.6:
                return "焦虑/愤怒"
            return "低落/难过"
        else:
            if self.arousal > 0.6:
                return "紧张/专注"
            return "中性"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "valence": self.valence,
            "arousal": self.arousal,
            "dominance": self.dominance,
            "user_valence": self.user_valence,
            "user_arousal": self.user_arousal,
            "trigger_type": self.trigger_type,
            "emotion_label": self.get_emotion_label(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
