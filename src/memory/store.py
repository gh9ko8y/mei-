"""记忆存储层：管理事件存储、检索和双时态查询"""

from datetime import datetime
from typing import Optional
from .models import Event, EmotionState


class MemoryStore:
    """记忆存储引擎

    Phase 1: 内存存储（用于开发调试）
    Phase 2: 切换到PostgreSQL + pgvector
    """

    def __init__(self):
        self._events: list[Event] = []
        self._emotions: list[EmotionState] = []
        self._next_event_id = 1
        self._next_emotion_id = 1

    # ============================================
    # 事件存储
    # ============================================

    def store_event(self, event: Event) -> Event:
        """存储事件"""
        event.id = self._next_event_id
        self._next_event_id += 1
        self._events.append(event)
        return event

    def get_event(self, event_id: int) -> Optional[Event]:
        """获取事件"""
        for e in self._events:
            if e.id == event_id:
                return e
        return None

    def get_user_events(self, user_id: int, valid_only: bool = True,
                        limit: int = 100) -> list[Event]:
        """获取用户的所有事件"""
        events = [e for e in self._events if e.user_id == user_id]
        if valid_only:
            events = [e for e in events if e.is_currently_valid()]
        events.sort(key=lambda e: e.valid_start or datetime.min, reverse=True)
        return events[:limit]

    def get_session_events(self, session_id: str) -> list[Event]:
        """获取某次会话的所有事件"""
        events = [e for e in self._events if e.session_id == session_id]
        events.sort(key=lambda e: e.valid_start or datetime.min)
        return events

    def invalidate_event(self, event_id: int, reason: str = ""):
        """软删除事件"""
        event = self.get_event(event_id)
        if event:
            event.invalidate(reason)

    # ============================================
    # 双时态查询
    # ============================================

    def query_by_valid_time(self, user_id: int,
                            start: Optional[datetime] = None,
                            end: Optional[datetime] = None) -> list[Event]:
        """按有效时间查询：返回有效区间 [vs, ve] 与查询区间 [start, end] 有交集的事件。
        缺失的边界视为"无限延伸"。"""
        events = []
        for e in self._events:
            if e.user_id != user_id or not e.valid_start:
                continue
            vs, ve = e.valid_start, e.valid_end
            if end is not None and vs > end:
                continue
            if start is not None and ve is not None and ve < start:
                continue
            events.append(e)
        return events

    def query_by_txn_time(self, user_id: int,
                          start: Optional[datetime] = None,
                          end: Optional[datetime] = None) -> list[Event]:
        """按事务时间查询（系统什么时候知道的）"""
        events = [e for e in self._events if e.user_id == user_id]
        if start:
            events = [e for e in events if e.txn_time and e.txn_time >= start]
        if end:
            events = [e for e in events if e.txn_time and e.txn_time <= end]
        return events

    def get_latest_valid_info(self, user_id: int, keyword: str) -> Optional[Event]:
        """获取关于某关键词的最新有效信息"""
        events = [e for e in self._events
                  if e.user_id == user_id
                  and e.is_currently_valid()
                  and keyword.lower() in e.content.lower()]
        if not events:
            return None
        events.sort(key=lambda e: e.valid_start or datetime.min, reverse=True)
        return events[0]

    # ============================================
    # 情绪状态
    # ============================================

    def store_emotion(self, emotion: EmotionState) -> EmotionState:
        """存储情绪状态"""
        emotion.id = self._next_emotion_id
        self._next_emotion_id += 1
        self._emotions.append(emotion)
        return emotion

    def get_latest_emotion(self, user_id: int) -> Optional[EmotionState]:
        """获取最新情绪状态"""
        emotions = [e for e in self._emotions if e.user_id == user_id]
        if not emotions:
            return None
        emotions.sort(key=lambda e: e.created_at or datetime.min, reverse=True)
        return emotions[0]

    def get_emotion_by_id(self, emotion_id: int) -> Optional[EmotionState]:
        """根据 id 获取情绪状态"""
        for e in self._emotions:
            if e.id == emotion_id:
                return e
        return None

    def get_emotion_history(self, user_id: int,
                            limit: int = 30) -> list[EmotionState]:
        """获取情绪历史"""
        emotions = [e for e in self._emotions if e.user_id == user_id]
        emotions.sort(key=lambda e: e.created_at or datetime.min, reverse=True)
        return emotions[:limit]

    # ============================================
    # 语义检索（Phase 1简化版）
    # ============================================

    def search_by_keyword(self, user_id: int, query: str,
                          limit: int = 5) -> list[Event]:
        """关键词检索（支持中英文部分匹配）"""
        import re

        # 提取关键词：中文按字拆分，英文按词提取
        query_clean = re.sub(r'[^\w\u4e00-\u9fff\s]', '', query.lower())
        # 英文词
        en_words = re.findall(r'[a-z]{2,}', query_clean)
        # 中文字符（过滤常见虚词）
        cn_stop = set("的了是在我你他她它吗呢吧啊呀哦嗯有和就也都还不")
        cn_chars = [c for c in re.findall(r'[\u4e00-\u9fff]', query_clean) if c not in cn_stop]
        words = en_words + cn_chars

        if not words:
            return []

        scored_events = []
        for e in self._events:
            if e.user_id != user_id or not e.is_currently_valid():
                continue
            content_lower = e.content.lower()
            # 计算匹配的关键词数量
            matched = sum(1 for w in words if w in content_lower)
            if matched > 0:
                score = (matched / len(words)) * e.importance
                scored_events.append((score, e))

        scored_events.sort(key=lambda x: x[0], reverse=True)
        return [e for _, e in scored_events[:limit]]

    # ============================================
    # 统计
    # ============================================

    def get_stats(self, user_id: int) -> dict:
        """获取记忆统计"""
        events = [e for e in self._events if e.user_id == user_id]
        valid_events = [e for e in events if e.is_currently_valid()]
        return {
            "total_events": len(events),
            "valid_events": len(valid_events),
            "invalidated": len(events) - len(valid_events),
            "emotions_recorded": len([e for e in self._emotions if e.user_id == user_id]),
        }
