"""图谱存储层：管理五维图谱的边和节点"""

from datetime import datetime
from typing import Optional
from .models import (
    SemanticEdge, CausalEdge, EntityNode, EntityMention,
    EmotionEdge, EmotionEdgeType,
)


class GraphStore:
    """图谱存储引擎

    Phase 1: 内存存储（用于开发调试）
    Phase 6+: 迁移到Graphiti
    """

    def __init__(self):
        self._semantic_edges: list[SemanticEdge] = []
        self._causal_edges: list[CausalEdge] = []
        self._entities: list[EntityNode] = []
        self._entity_mentions: list[EntityMention] = []
        self._emotion_edges: list[EmotionEdge] = []
        self._next_id = 1

    # ============================================
    # 语义图谱
    # ============================================

    def add_semantic_edge(self, source_id: int, target_id: int,
                          similarity: float) -> SemanticEdge:
        """添加语义边（内容相似的事件）"""
        edge = SemanticEdge(
            id=self._next_id,
            source_id=source_id,
            target_id=target_id,
            similarity=similarity,
        )
        self._next_id += 1
        self._semantic_edges.append(edge)
        return edge

    def get_similar_events(self, event_id: int,
                           threshold: float = 0.7) -> list[SemanticEdge]:
        """获取与某事件语义相似的事件"""
        return [
            e for e in self._semantic_edges
            if (e.source_id == event_id or e.target_id == event_id)
            and e.similarity >= threshold
        ]

    # ============================================
    # 因果图谱
    # ============================================

    def add_causal_edge(self, cause_id: int, effect_id: int,
                        confidence: float, reasoning: str = "") -> CausalEdge:
        """添加因果边"""
        edge = CausalEdge(
            id=self._next_id,
            cause_id=cause_id,
            effect_id=effect_id,
            confidence=confidence,
            reasoning=reasoning,
        )
        self._next_id += 1
        self._causal_edges.append(edge)
        return edge

    def get_causes(self, event_id: int) -> list[CausalEdge]:
        """获取某事件的原因"""
        return [e for e in self._causal_edges if e.effect_id == event_id]

    def get_effects(self, event_id: int) -> list[CausalEdge]:
        """获取某事件的结果"""
        return [e for e in self._causal_edges if e.cause_id == event_id]

    def get_causal_chain(self, event_id: int, direction: str = "backward",
                         max_depth: int = 5) -> list[int]:
        """获取因果链"""
        chain = []
        visited = set()
        current = event_id

        for _ in range(max_depth):
            if current in visited:
                break
            visited.add(current)
            chain.append(current)

            if direction == "backward":
                edges = self.get_causes(current)
                if not edges:
                    break
                current = max(edges, key=lambda e: e.confidence).cause_id
            else:
                edges = self.get_effects(current)
                if not edges:
                    break
                current = max(edges, key=lambda e: e.confidence).effect_id

        return chain

    # ============================================
    # 实体图谱
    # ============================================

    def add_entity(self, user_id: int, name: str,
                   entity_type: str = "", description: str = "") -> EntityNode:
        """添加实体"""
        # 检查是否已存在
        existing = self._find_entity(user_id, name)
        if existing:
            existing.mention_count += 1
            existing.last_seen = datetime.now()
            return existing

        entity = EntityNode(
            id=self._next_id,
            user_id=user_id,
            name=name,
            entity_type=entity_type,
            description=description,
        )
        self._next_id += 1
        self._entities.append(entity)
        return entity

    def add_entity_mention(self, event_id: int, entity_id: int,
                           mention_text: str = "") -> EntityMention:
        """添加实体提及"""
        mention = EntityMention(
            id=self._next_id,
            event_id=event_id,
            entity_id=entity_id,
            mention_text=mention_text,
        )
        self._next_id += 1
        self._entity_mentions.append(mention)
        return mention

    def get_entity_events(self, entity_id: int) -> list[EntityMention]:
        """获取某实体的所有相关事件"""
        return [m for m in self._entity_mentions if m.entity_id == entity_id]

    def get_event_entities(self, event_id: int) -> list[EntityMention]:
        """获取某事件涉及的所有实体"""
        return [m for m in self._entity_mentions if m.event_id == event_id]

    def search_entities(self, user_id: int, keyword: str) -> list[EntityNode]:
        """搜索实体"""
        keyword_lower = keyword.lower()
        return [
            e for e in self._entities
            if e.user_id == user_id
            and keyword_lower in e.name.lower()
        ]

    def _find_entity(self, user_id: int, name: str) -> Optional[EntityNode]:
        """查找已有实体"""
        for e in self._entities:
            if e.user_id == user_id and e.name == name:
                return e
        return None

    # ============================================
    # 情绪图谱
    # ============================================

    def add_emotion_edge(self, source_state_id: int, target_state_id: int,
                         edge_type: EmotionEdgeType,
                         weight: float = 1.0,
                         duration_seconds: Optional[int] = None) -> EmotionEdge:
        """添加情绪边"""
        edge = EmotionEdge(
            id=self._next_id,
            source_state_id=source_state_id,
            target_state_id=target_state_id,
            emotion_edge_type=edge_type,
            weight=weight,
            duration_seconds=duration_seconds,
        )
        self._next_id += 1
        self._emotion_edges.append(edge)
        return edge

    def get_emotion_triggers(self, state_id: int) -> list[EmotionEdge]:
        """获取触发某情绪状态的事件"""
        return [
            e for e in self._emotion_edges
            if e.target_state_id == state_id
            and e.emotion_edge_type == EmotionEdgeType.TRIGGER
        ]

    def get_emotion_recovery(self, state_id: int) -> list[EmotionEdge]:
        """获取情绪恢复路径"""
        return [
            e for e in self._emotion_edges
            if e.source_state_id == state_id
            and e.emotion_edge_type == EmotionEdgeType.RECOVERY
        ]

    # ============================================
    # 统计
    # ============================================

    def get_stats(self, user_id: Optional[int] = None) -> dict:
        """获取图谱统计"""
        return {
            "semantic_edges": len(self._semantic_edges),
            "causal_edges": len(self._causal_edges),
            "entities": len(self._entities),
            "entity_mentions": len(self._entity_mentions),
            "emotion_edges": len(self._emotion_edges),
        }
