"""留存引擎：记忆引擎 + 成长引擎 + 惊喜引擎"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
from ..memory.store import MemoryStore
from ..memory.models import Event, EmotionState


@dataclass
class RetentionMetrics:
    """留存指标"""
    total_conversations: int = 0
    consecutive_days: int = 0
    longest_streak: int = 0
    avg_turns_per_day: float = 0.0
    relationship_depth: float = 0.0
    last_active: Optional[datetime] = None


class RetentionEngine:
    """留存引擎

    三个子引擎：
    1. 记忆引擎：AI主动提起过去的对话
    2. 成长引擎：AI的表达随互动贴近用户风格
    3. 惊喜引擎：AI偶尔说出超出预期的话
    """

    def __init__(self, memory_store: MemoryStore):
        self.memory = memory_store
        self._user_metrics: dict[int, RetentionMetrics] = {}

    # ============================================
    # 记忆引擎
    # ============================================

    def check_memory_trigger(self, user_id: int,
                             current_input: str) -> Optional[dict]:
        """检查是否有记忆触发点。规则互斥，命中任一条即返回。"""
        # 规则1：用户提到了某个话题，检查历史
        relevant = self.memory.search_by_keyword(user_id, current_input, limit=5)
        if relevant:
            for event in relevant:
                if event.role == "user" and event.id:
                    days_ago = (datetime.now() - event.valid_start).days if event.valid_start else 0
                    if days_ago > 3:
                        return {
                            "type": "topic_recall",
                            "message": f"你上次也说过类似的事，当时是在{days_ago}天前",
                            "event": event.to_dict(),
                        }

        # 规则2：情绪模式检测
        emotions = self.memory.get_emotion_history(user_id, limit=30)
        if len(emotions) >= 5:
            recent_neg = sum(1 for e in emotions[:5] if e.valence < 0.4)
            if recent_neg >= 3:
                return {
                    "type": "mood_pattern",
                    "message": "你最近几天好像心情都不太好，发生什么事了吗？",
                }

        # 规则3：特殊日子检测（直接取最早一条，不再做无意义的 limit=1 探测）
        first_event = self.memory.get_user_events(user_id, valid_only=True, limit=1)
        if first_event:
            days_together = (datetime.now() - first_event[-1].valid_start).days if first_event[-1].valid_start else 0
            if days_together in [7, 14, 30, 50, 100, 200, 365]:
                return {
                    "type": "anniversary",
                    "message": f"今天是我们认识第{days_together}天！",
                }

        return None

    # ============================================
    # 成长引擎
    # ============================================

    def analyze_user_style(self, user_id: int) -> dict:
        """分析用户的表达风格"""
        events = self.memory.get_user_events(user_id, valid_only=True, limit=100)
        user_events = [e for e in events if e.role == "user"]

        if not user_events:
            return {"avg_length": 50, "emoji_usage": 0, "formality": 0.5}

        # 平均回复长度
        avg_length = sum(len(e.content) for e in user_events) / len(user_events)

        # 表情使用频率
        emoji_count = sum(1 for e in user_events if any(
            c in e.content for c in "😀😂😍🤔😢😡👍❤️😊🥺"
        ))
        emoji_ratio = emoji_count / len(user_events) if user_events else 0

        # 正式程度（基于用词）
        formal_words = ["您好", "请问", "谢谢", "非常"]
        casual_words = ["哈哈", "嗯嗯", "好的", "行", "OK"]
        formal_count = sum(1 for e in user_events
                          if any(w in e.content for w in formal_words))
        casual_count = sum(1 for e in user_events
                          if any(w in e.content for w in casual_words))
        total = formal_count + casual_count
        formality = formal_count / total if total > 0 else 0.5

        return {
            "avg_length": avg_length,
            "emoji_usage": emoji_ratio,
            "formality": formality,
            "total_messages": len(user_events),
        }

    def get_style_adaptation_prompt(self, user_id: int) -> str:
        """生成风格适应提示"""
        style = self.analyze_user_style(user_id)

        parts = []
        if style["avg_length"] < 30:
            parts.append("用户喜欢简短回复，你也用简短的方式回应")
        elif style["avg_length"] > 100:
            parts.append("用户喜欢详细表达，你也可以多说一些")

        if style["emoji_usage"] > 0.3:
            parts.append("用户喜欢用表情，你也可以适当用")
        elif style["emoji_usage"] < 0.05:
            parts.append("用户很少用表情，你也少用")

        if style["formality"] > 0.7:
            parts.append("用户的表达比较正式，你也保持一定正式感")
        elif style["formality"] < 0.3:
            parts.append("用户的表达比较随意，你也可以放松一些")

        return "；".join(parts) if parts else ""

    # ============================================
    # 惊喜引擎
    # ============================================

    def check_surprise_trigger(self, user_id: int) -> Optional[dict]:
        """检查是否有惊喜触发点"""
        # 规则1：用户随口提过的事（低重要性但被记住）
        events = self.memory.get_user_events(user_id, valid_only=True, limit=200)
        low_importance = [e for e in events
                          if e.importance < 0.3
                          and e.role == "user"
                          and e.valid_start
                          and (datetime.now() - e.valid_start).days > 7]

        if low_importance:
            event = low_importance[-1]
            return {
                "type": "random_recall",
                "message": f"突然想起你之前说过'{event.content[:20]}...'，最近怎么样了？",
                "event": event.to_dict(),
            }

        return None

    # ============================================
    # 留存指标
    # ============================================

    def update_metrics(self, user_id: int, session_turns: int = 1):
        """更新留存指标"""
        if user_id not in self._user_metrics:
            self._user_metrics[user_id] = RetentionMetrics()

        metrics = self._user_metrics[user_id]
        now = datetime.now()

        # 更新对话次数
        metrics.total_conversations += 1

        # 更新连续天数
        if metrics.last_active:
            days_since = (now - metrics.last_active).days
            if days_since == 1:
                metrics.consecutive_days += 1
            elif days_since > 1:
                metrics.consecutive_days = 1
        else:
            metrics.consecutive_days = 1

        metrics.longest_streak = max(metrics.longest_streak, metrics.consecutive_days)
        metrics.last_active = now

        # 计算关系深度
        metrics.relationship_depth = self._calculate_depth(user_id)

    def _calculate_depth(self, user_id: int) -> float:
        """计算关系深度（0-100）"""
        events = self.memory.get_user_events(user_id, valid_only=True, limit=1000)
        if not events:
            return 0.0

        # 对话轮数贡献（最多30分）
        turn_score = min(30, len(events) * 0.3)

        # 连续天数贡献（最多25分）
        metrics = self._user_metrics.get(user_id)
        streak_score = min(25, (metrics.consecutive_days if metrics else 0) * 2.5)

        # 情感深度贡献（最多25分）
        emotions = self.memory.get_emotion_history(user_id, limit=100)
        emotion_variance = 0
        if len(emotions) > 1:
            vals = [e.valence for e in emotions]
            emotion_variance = max(vals) - min(vals)
        emotion_score = min(25, emotion_variance * 50)

        # 信息丰富度贡献（最多20分）
        unique_content = len(set(e.content[:20] for e in events if e.role == "user"))
        info_score = min(20, unique_content * 0.5)

        return min(100, turn_score + streak_score + emotion_score + info_score)

    def get_metrics(self, user_id: int) -> dict:
        """获取留存指标"""
        if user_id not in self._user_metrics:
            self._user_metrics[user_id] = RetentionMetrics()

        metrics = self._user_metrics[user_id]
        return {
            "total_conversations": metrics.total_conversations,
            "consecutive_days": metrics.consecutive_days,
            "longest_streak": metrics.longest_streak,
            "relationship_depth": metrics.relationship_depth,
        }

    # ============================================
    # 综合Prompt生成
    # ============================================

    def build_retention_prompt(self, user_id: int,
                               current_input: str) -> Optional[str]:
        """构建留存相关的Prompt注入"""
        parts = []

        # 记忆引擎触发
        memory_trigger = self.check_memory_trigger(user_id, current_input)
        if memory_trigger:
            parts.append(f"[记忆提示] {memory_trigger['message']}")

        # 惊喜引擎触发（概率10%）
        import random
        if random.random() < 0.1:
            surprise = self.check_surprise_trigger(user_id)
            if surprise:
                parts.append(f"[惊喜提示] {surprise['message']}")

        # 风格适应
        style_prompt = self.get_style_adaptation_prompt(user_id)
        if style_prompt:
            parts.append(f"[风格提示] {style_prompt}")

        return "\n".join(parts) if parts else None
