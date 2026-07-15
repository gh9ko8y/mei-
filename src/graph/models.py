"""五维图谱数据模型"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from enum import Enum


class EdgeType(Enum):
    """图谱边类型"""
    SEMANTIC = "semantic"
    CAUSAL = "causal"
    ENTITY = "entity"
    EMOTION = "emotion"
    TEMPORAL = "temporal"


class EmotionEdgeType(Enum):
    """情绪边类型"""
    TRIGGER = "trigger"      # 事件触发情绪
    RECOVERY = "recovery"    # 情绪恢复
    CONTAGION = "contagion"  # 情绪传染
    DECAY = "decay"          # 情绪衰减


@dataclass
class GraphEdge:
    """图谱边基类"""
    id: Optional[int] = None
    edge_type: EdgeType = EdgeType.SEMANTIC
    created_at: Optional[datetime] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()


@dataclass
class SemanticEdge(GraphEdge):
    """语义图谱边：连接内容相似的事件"""
    source_id: int = 0
    target_id: int = 0
    similarity: float = 0.0

    def __post_init__(self):
        super().__post_init__()
        self.edge_type = EdgeType.SEMANTIC


@dataclass
class CausalEdge(GraphEdge):
    """因果图谱边：表示逻辑蕴含关系"""
    cause_id: int = 0
    effect_id: int = 0
    confidence: float = 0.0
    reasoning: str = ""

    def __post_init__(self):
        super().__post_init__()
        self.edge_type = EdgeType.CAUSAL


@dataclass
class EntityNode:
    """实体节点"""
    id: Optional[int] = None
    user_id: int = 0
    name: str = ""
    entity_type: str = ""  # person / place / object / event
    description: str = ""
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    mention_count: int = 1

    def __post_init__(self):
        if self.first_seen is None:
            self.first_seen = datetime.now()
        if self.last_seen is None:
            self.last_seen = datetime.now()


@dataclass
class EntityMention:
    """实体提及：连接事件和实体"""
    id: Optional[int] = None
    event_id: int = 0
    entity_id: int = 0
    mention_text: str = ""
    created_at: Optional[datetime] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()


@dataclass
class EmotionEdge(GraphEdge):
    """情绪图谱边：情绪之间的关系"""
    source_state_id: int = 0
    target_state_id: int = 0
    emotion_edge_type: EmotionEdgeType = EmotionEdgeType.TRIGGER
    weight: float = 1.0
    duration_seconds: Optional[int] = None

    def __post_init__(self):
        super().__post_init__()
        self.edge_type = EdgeType.EMOTION
