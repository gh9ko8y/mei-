"""图谱仓库层：封装图谱边的CRUD操作"""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from .models import SemanticEdge, CausalEdge, EntityNode, EntityMention, EmotionEdge


class SemanticEdgeRepository:
    """语义边仓库"""

    def __init__(self, session: Session):
        self.session = session

    def create(self, source_id: int, target_id: int, similarity: float) -> SemanticEdge:
        edge = SemanticEdge(source_id=source_id, target_id=target_id, similarity=similarity)
        self.session.add(edge)
        self.session.flush()
        return edge

    def get_similar(self, event_id: int, threshold: float = 0.7) -> list[SemanticEdge]:
        return (
            self.session.query(SemanticEdge)
            .filter(
                or_(SemanticEdge.source_id == event_id, SemanticEdge.target_id == event_id),
                SemanticEdge.similarity >= threshold,
            )
            .all()
        )


class CausalEdgeRepository:
    """因果边仓库"""

    def __init__(self, session: Session):
        self.session = session

    def create(self, cause_id: int, effect_id: int, confidence: float,
               reasoning: str = "") -> CausalEdge:
        edge = CausalEdge(cause_id=cause_id, effect_id=effect_id,
                          confidence=confidence, reasoning=reasoning)
        self.session.add(edge)
        self.session.flush()
        return edge

    def get_causes(self, event_id: int) -> list[CausalEdge]:
        return self.session.query(CausalEdge).filter(CausalEdge.effect_id == event_id).all()

    def get_effects(self, event_id: int) -> list[CausalEdge]:
        return self.session.query(CausalEdge).filter(CausalEdge.cause_id == event_id).all()

    def get_causal_chain(self, event_id: int, direction: str = "backward",
                         max_depth: int = 5) -> list[int]:
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


class EntityRepository:
    """实体仓库"""

    def __init__(self, session: Session):
        self.session = session

    def create_or_update(self, user_id: int, name: str,
                         entity_type: str = "", description: str = "") -> EntityNode:
        existing = self.session.query(EntityNode).filter(
            EntityNode.user_id == user_id, EntityNode.name == name
        ).first()

        if existing:
            existing.mention_count += 1
            existing.last_seen = datetime.utcnow()
            self.session.flush()
            return existing

        entity = EntityNode(
            user_id=user_id, name=name,
            entity_type=entity_type, description=description,
        )
        self.session.add(entity)
        self.session.flush()
        return entity

    def add_mention(self, event_id: int, entity_id: int,
                    mention_text: str = "") -> EntityMention:
        mention = EntityMention(event_id=event_id, entity_id=entity_id,
                                mention_text=mention_text)
        self.session.add(mention)
        self.session.flush()
        return mention

    def search(self, user_id: int, keyword: str) -> list[EntityNode]:
        return (
            self.session.query(EntityNode)
            .filter(EntityNode.user_id == user_id, EntityNode.name.ilike(f"%{keyword}%"))
            .all()
        )

    def get_entity_events(self, entity_id: int) -> list[EntityMention]:
        return self.session.query(EntityMention).filter(EntityMention.entity_id == entity_id).all()

    def get_event_entities(self, event_id: int) -> list[EntityMention]:
        return self.session.query(EntityMention).filter(EntityMention.event_id == event_id).all()


class EmotionEdgeRepository:
    """情绪边仓库"""

    def __init__(self, session: Session):
        self.session = session

    def create(self, source_state_id: int, target_state_id: int,
               edge_type: str, weight: float = 1.0,
               duration_seconds: int = None) -> EmotionEdge:
        edge = EmotionEdge(
            source_state_id=source_state_id,
            target_state_id=target_state_id,
            edge_type=edge_type,
            weight=weight,
            duration_seconds=duration_seconds,
        )
        self.session.add(edge)
        self.session.flush()
        return edge

    def get_triggers(self, state_id: int) -> list[EmotionEdge]:
        return self.session.query(EmotionEdge).filter(
            EmotionEdge.target_state_id == state_id,
            EmotionEdge.edge_type == "trigger",
        ).all()

    def get_recovery(self, state_id: int) -> list[EmotionEdge]:
        return self.session.query(EmotionEdge).filter(
            EmotionEdge.source_state_id == state_id,
            EmotionEdge.edge_type == "recovery",
        ).all()

    def get_stats(self) -> dict:
        return {
            "semantic_edges": self.session.query(SemanticEdge).count(),
            "causal_edges": self.session.query(CausalEdge).count(),
            "entities": self.session.query(EntityNode).count(),
            "entity_mentions": self.session.query(EntityMention).count(),
            "emotion_edges": self.session.query(EmotionEdge).count(),
        }
