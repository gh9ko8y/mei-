"""混合检索：关键词 + 向量 + RRF融合排序"""

from typing import Optional
from ..memory.store import MemoryStore
from ..memory.models import Event
from ..embedding.client import EmbeddingClient


class HybridRetrieval:
    """混合检索引擎

    结合关键词检索和向量检索，用RRF（Reciprocal Rank Fusion）融合排序。
    """

    def __init__(self, memory_store: MemoryStore,
                 embedding_client: Optional[EmbeddingClient] = None,
                 rrf_k: int = 60):
        self.memory = memory_store
        self.embedding = embedding_client
        self.rrf_k = rrf_k  # RRF常数，控制排名融合的平滑度

    def search(self, user_id: int, query: str,
               limit: int = 5, valid_only: bool = True) -> list[dict]:
        """混合检索：关键词+向量+RRF融合"""
        # 关键词检索
        keyword_results = self.memory.search_by_keyword(
            user_id, query, limit=limit * 2
        )

        # 向量检索（如果embedding客户端可用）
        vector_results = []
        if self.embedding:
            vector_results = self._vector_search(
                user_id, query, limit=limit * 2
            )

        # RRF融合排序
        if vector_results:
            fused = self._rrf_fusion(keyword_results, vector_results)
        else:
            # 没有向量检索时，直接用关键词结果
            fused = [{"event": e, "score": 1.0 / (i + 1)}
                     for i, e in enumerate(keyword_results)]

        # 返回Top-N
        fused.sort(key=lambda x: x["score"], reverse=True)
        return fused[:limit]

    def _vector_search(self, user_id: int, query: str,
                       limit: int) -> list[Event]:
        """向量检索"""
        query_vector = self.embedding.embed(query)
        if not query_vector:
            return []

        events = self.memory.get_user_events(user_id, valid_only=True, limit=1000)

        scored = []
        for event in events:
            if event.embedding:
                sim = self.embedding.similarity(query_vector, event.embedding)
                scored.append((sim, event))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [e for _, e in scored[:limit]]

    def _rrf_fusion(self, keyword_results: list[Event],
                    vector_results: list[Event]) -> list[dict]:
        """RRF（Reciprocal Rank Fusion）融合排序

        RRF公式：score(d) = Σ 1/(k + rank_i(d))
        其中k是常数（默认60），rank_i是文档d在第i个排名中的位置
        """
        scores: dict[int, float] = {}
        event_map: dict[int, Event] = {}

        # 关键词检索排名
        for rank, event in enumerate(keyword_results):
            event_id = event.id
            scores[event_id] = scores.get(event_id, 0) + 1.0 / (self.rrf_k + rank)
            event_map[event_id] = event

        # 向量检索排名
        for rank, event in enumerate(vector_results):
            event_id = event.id
            scores[event_id] = scores.get(event_id, 0) + 1.0 / (self.rrf_k + rank)
            event_map[event_id] = event

        # 构建结果
        results = []
        for event_id, score in scores.items():
            results.append({
                "event": event_map[event_id],
                "score": score,
            })

        return results
