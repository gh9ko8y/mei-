"""数据库仓库层：封装CRUD操作"""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from .models import Event, EmotionState, PersonalityConfig, PersonalityLog


class EventRepository:
    """事件仓库"""

    def __init__(self, session: Session):
        self.session = session

    def create(self, user_id: int, role: str, content: str,
               content_type: str = "text", session_id: str = "",
               importance: float = 0.5, metadata: dict = None,
               valid_start: datetime = None) -> Event:
        """创建事件"""
        event = Event(
            user_id=user_id,
            role=role,
            content=content,
            content_type=content_type,
            session_id=session_id,
            importance=importance,
            metadata_json=metadata or {},
            valid_start=valid_start or datetime.utcnow(),
            txn_time=datetime.utcnow(),
        )
        self.session.add(event)
        self.session.flush()
        return event

    def get_by_id(self, event_id: int) -> Optional[Event]:
        """获取事件"""
        return self.session.query(Event).filter(Event.id == event_id).first()

    def get_user_events(self, user_id: int, valid_only: bool = True,
                        limit: int = 100) -> list[Event]:
        """获取用户事件"""
        query = self.session.query(Event).filter(Event.user_id == user_id)
        if valid_only:
            query = query.filter(Event.is_valid == True)
        return query.order_by(desc(Event.valid_start)).limit(limit).all()

    def get_session_events(self, session_id: str, user_id: int = None) -> list[Event]:
        """获取会话事件"""
        query = self.session.query(Event).filter(Event.session_id == session_id)
        if user_id is not None:
            query = query.filter(Event.user_id == user_id)
        return query.order_by(Event.valid_start, Event.id).all()

    def search_by_keyword(self, user_id: int, query_text: str,
                          limit: int = 5) -> list[Event]:
        """关键词搜索"""
        import re
        # 提取关键词
        cn_stop = set("的了是在我你他她它吗呢吧啊呀哦嗯有和就也都还不")
        cn_chars = [c for c in re.findall(r'[\u4e00-\u9fff]', query_text) if c not in cn_stop]
        en_words = re.findall(r'[a-z]{2,}', query_text.lower())
        keywords = en_words + cn_chars

        if not keywords:
            return []

        # 转义通配符
        def escape_like(s: str) -> str:
            return s.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')

        # 用OR连接关键词
        from sqlalchemy import or_, and_
        conditions = [Event.user_id == user_id, Event.is_valid == True]
        keyword_conditions = [Event.content.ilike(f"%{escape_like(kw)}%") for kw in keywords]
        conditions.append(or_(*keyword_conditions))
        
        return (
            self.session.query(Event)
            .filter(and_(*conditions))
            .order_by(desc(Event.importance))
            .limit(limit)
            .all()
        )

    def invalidate(self, event_id: int, reason: str = ""):
        """软删除事件"""
        event = self.get_by_id(event_id)
        if event:
            event.is_valid = False
            event.valid_end = datetime.utcnow()
            self.session.flush()

    def get_stats(self, user_id: int) -> dict:
        """获取统计"""
        total = self.session.query(Event).filter(Event.user_id == user_id).count()
        valid = self.session.query(Event).filter(
            Event.user_id == user_id, Event.is_valid == True
        ).count()
        return {
            "total_events": total,
            "valid_events": valid,
            "invalidated": total - valid,
        }


class EmotionRepository:
    """情绪仓库"""

    def __init__(self, session: Session):
        self.session = session

    def create(self, user_id: int, valence: float, arousal: float,
               dominance: float = 0.5, event_id: int = None,
               trigger_type: str = "user_input") -> EmotionState:
        """创建情绪状态"""
        emotion = EmotionState(
            user_id=user_id,
            event_id=event_id,
            valence=valence,
            arousal=arousal,
            dominance=dominance,
            trigger_type=trigger_type,
            created_at=datetime.utcnow(),
        )
        self.session.add(emotion)
        self.session.flush()
        return emotion

    def get_latest(self, user_id: int) -> Optional[EmotionState]:
        """获取最新情绪"""
        return (
            self.session.query(EmotionState)
            .filter(EmotionState.user_id == user_id)
            .order_by(desc(EmotionState.created_at))
            .first()
        )

    def get_history(self, user_id: int, limit: int = 30) -> list[EmotionState]:
        """获取情绪历史"""
        return (
            self.session.query(EmotionState)
            .filter(EmotionState.user_id == user_id)
            .order_by(desc(EmotionState.created_at))
            .limit(limit)
            .all()
        )


class PersonalityRepository:
    """人格仓库"""

    def __init__(self, session: Session):
        self.session = session

    def create(self, user_id: int, name: str, **kwargs) -> PersonalityConfig:
        """创建人格配置"""
        config = PersonalityConfig(
            user_id=user_id,
            name=name,
            **kwargs,
        )
        self.session.add(config)
        self.session.flush()
        return config

    def get_active(self, user_id: int) -> Optional[PersonalityConfig]:
        """获取当前激活的人格"""
        return (
            self.session.query(PersonalityConfig)
            .filter(
                PersonalityConfig.user_id == user_id,
                PersonalityConfig.is_active == True,
            )
            .first()
        )

    def update(self, config_id: int, **kwargs) -> Optional[PersonalityConfig]:
        """更新人格配置"""
        config = self.session.query(PersonalityConfig).filter(
            PersonalityConfig.id == config_id
        ).first()
        if not config:
            return None

        for key, value in kwargs.items():
            if hasattr(config, key):
                old_value = getattr(config, key)
                setattr(config, key, value)
                # 记录变更日志
                log = PersonalityLog(
                    config_id=config_id,
                    field_changed=key,
                    old_value=str(old_value),
                    new_value=str(value),
                )
                self.session.add(log)

        config.updated_at = datetime.utcnow()
        self.session.flush()
        return config
