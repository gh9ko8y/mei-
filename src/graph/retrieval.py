"""图谱检索层：意图驱动的图谱遍历"""

from enum import Enum
from typing import Optional
from .store import GraphStore
from ..memory.store import MemoryStore
from ..memory.models import Event


class QueryIntent(Enum):
    """查询意图类型"""
    WHY = "why"          # 为什么（因果图谱）
    WHEN = "when"        # 什么时候（时间图谱）
    ENTITY = "entity"    # 关于谁/什么（实体图谱）
    EMOTION = "emotion"  # 情绪相关（情绪图谱）
    GENERAL = "general"  # 日常闲聊（语义图谱）


# 意图关键词映射
INTENT_KEYWORDS = {
    QueryIntent.WHY: ["为什么", "原因", "因为", "导致", "为什么", "why", "reason"],
    QueryIntent.WHEN: ["什么时候", "哪天", "几号", "之前", "之后", "when", "time"],
    QueryIntent.ENTITY: ["关于", "谁", "什么人", "什么东西", "about", "who"],
    QueryIntent.EMOTION: ["心情", "难过", "开心", "生气", "情绪", "feel", "mood"],
}


class GraphRetrieval:
    """图谱检索引擎"""

    def __init__(self, graph_store: GraphStore, memory_store: MemoryStore):
        self.graph = graph_store
        self.memory = memory_store

    def classify_intent(self, query: str) -> QueryIntent:
        """判断查询意图"""
        query_lower = query.lower()

        for intent, keywords in INTENT_KEYWORDS.items():
            for kw in keywords:
                if kw in query_lower:
                    return intent

        return QueryIntent.GENERAL

    def retrieve(self, user_id: int, query: str,
                 limit: int = 5) -> list[dict]:
        """根据意图检索相关记忆"""
        intent = self.classify_intent(query)

        if intent == QueryIntent.WHY:
            return self._retrieve_causal(user_id, query, limit)
        elif intent == QueryIntent.WHEN:
            return self._retrieve_temporal(user_id, query, limit)
        elif intent == QueryIntent.ENTITY:
            return self._retrieve_entity(user_id, query, limit)
        elif intent == QueryIntent.EMOTION:
            return self._retrieve_emotion(user_id, query, limit)
        else:
            return self._retrieve_general(user_id, query, limit)

    def _strip_intent_keywords(self, query: str, intent: QueryIntent) -> str:
        """去掉意图关键词，保留核心查询"""
        keywords = INTENT_KEYWORDS.get(intent, [])
        result = query
        for kw in keywords:
            result = result.replace(kw, "").strip()
        return result if result else query

    def _retrieve_causal(self, user_id: int, query: str,
                         limit: int) -> list[dict]:
        """因果检索：沿因果链遍历"""
        # 去掉意图关键词，用核心内容检索
        core_query = self._strip_intent_keywords(query, QueryIntent.WHY)
        anchors = self.memory.search_by_keyword(user_id, core_query, limit=3)
        if not anchors:
            return []

        results = []
        for anchor in anchors:
            # 向前追溯原因
            causes = self.graph.get_causes(anchor.id)
            for edge in causes:
                cause_event = self.memory.get_event(edge.cause_id)
                if cause_event:
                    results.append({
                        "event": cause_event.to_dict(),
                        "relation": "原因",
                        "confidence": edge.confidence,
                        "reasoning": edge.reasoning,
                    })

            # 向后追溯结果
            effects = self.graph.get_effects(anchor.id)
            for edge in effects:
                effect_event = self.memory.get_event(edge.effect_id)
                if effect_event:
                    results.append({
                        "event": effect_event.to_dict(),
                        "relation": "结果",
                        "confidence": edge.confidence,
                        "reasoning": edge.reasoning,
                    })

        return results[:limit]

    def _retrieve_temporal(self, user_id: int, query: str,
                           limit: int) -> list[dict]:
        """时间检索：按时间线查询"""
        # 用双时态查询
        events = self.memory.get_user_events(user_id, valid_only=True, limit=limit)
        return [{"event": e.to_dict(), "relation": "时间线"} for e in events]

    def _retrieve_entity(self, user_id: int, query: str,
                         limit: int) -> list[dict]:
        """实体检索：沿实体邻域遍历"""
        core_query = self._strip_intent_keywords(query, QueryIntent.ENTITY)
        entities = self.graph.search_entities(user_id, core_query)
        if not entities:
            # 回退到关键词检索
            events = self.memory.search_by_keyword(user_id, query, limit=limit)
            return [{"event": e.to_dict(), "relation": "关键词匹配"} for e in events]

        results = []
        for entity in entities[:3]:
            mentions = self.graph.get_entity_events(entity.id)
            for mention in mentions:
                event = self.memory.get_event(mention.event_id)
                if event:
                    results.append({
                        "event": event.to_dict(),
                        "relation": f"涉及实体: {entity.name}",
                        "entity_type": entity.entity_type,
                    })

        return results[:limit]

    def _retrieve_emotion(self, user_id: int, query: str,
                          limit: int) -> list[dict]:
        """情绪检索：沿情绪图谱遍历"""
        # 获取用户当前情绪
        current_emotion = self.memory.get_latest_emotion(user_id)
        if not current_emotion:
            return self._retrieve_general(user_id, query, limit)

        # 获取情绪触发事件
        triggers = self.graph.get_emotion_triggers(current_emotion.id)
        results = []
        for trigger in triggers:
            # trigger.source_state_id 是 emotion_state.id，要先找到对应的
            # EmotionState，再通过其 event_id 反查 Event
            source_state = self.memory.get_emotion_by_id(trigger.source_state_id)
            if not source_state or not source_state.event_id:
                continue
            event = self.memory.get_event(source_state.event_id)
            if event:
                results.append({
                    "event": event.to_dict(),
                    "relation": "情绪触发",
                    "edge_type": trigger.emotion_edge_type.value,
                })

        # 如果没有情绪图谱数据，回退到关键词检索
        if not results:
            events = self.memory.search_by_keyword(user_id, query, limit=limit)
            results = [{"event": e.to_dict(), "relation": "关键词匹配"} for e in events]

        return results[:limit]

    def _retrieve_general(self, user_id: int, query: str,
                          limit: int) -> list[dict]:
        """通用检索：关键词+语义相似度"""
        events = self.memory.search_by_keyword(user_id, query, limit=limit)
        return [{"event": e.to_dict(), "relation": "相关"} for e in events]
