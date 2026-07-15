"""SQLAlchemy数据模型"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text,
    DateTime, ForeignKey, JSON, Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    aria_id = Column(String(50), unique=True, nullable=False)
    username = Column(String(50))
    nickname = Column(String(100))
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100))
    phone = Column(String(20))
    gender = Column(String(10))
    birthday = Column(String(20))
    bio = Column(Text)
    avatar = Column(Text)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    events = relationship("Event", back_populates="user")
    personality_configs = relationship("PersonalityConfig", back_populates="user")
    emotion_states = relationship("EmotionState", back_populates="user")


class PersonalityConfig(Base):
    """人格配置表"""
    __tablename__ = "personality_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)

    # MBTI
    mbti = Column(String(4))
    zodiac = Column(String(20))
    temperament = Column(String(20))
    attachment = Column(String(20))
    enneagram = Column(String(20))

    # 大五人格
    openness = Column(Float, default=0.5)
    conscientiousness = Column(Float, default=0.5)
    extraversion = Column(Float, default=0.5)
    agreeableness = Column(Float, default=0.5)
    neuroticism = Column(Float, default=0.5)

    # 其他
    thinking_style = Column(JSON)
    values = Column(JSON)
    system_prompt = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="personality_configs")
    logs = relationship("PersonalityLog", back_populates="config")


class PersonalityLog(Base):
    """人格变更日志"""
    __tablename__ = "personality_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    config_id = Column(Integer, ForeignKey("personality_configs.id"), nullable=False)
    field_changed = Column(String(50), nullable=False)
    old_value = Column(String(200))
    new_value = Column(String(200))
    reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    config = relationship("PersonalityConfig", back_populates="logs")


class Event(Base):
    """事件表（Ledger）- 双时态"""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user / assistant / system
    content = Column(Text, nullable=False)
    content_type = Column(String(20), default="text")
    embedding = Column(Text)  # JSON序列化的向量

    # 双时态
    valid_start = Column(DateTime, nullable=False)
    valid_end = Column(DateTime)
    txn_time = Column(DateTime, default=datetime.utcnow)

    is_valid = Column(Boolean, default=True)
    importance = Column(Float, default=0.5)
    metadata_json = Column(JSON)
    session_id = Column(String(100))

    # 关系
    user = relationship("User", back_populates="events")

    __table_args__ = (
        Index("idx_events_user_valid", "user_id", "is_valid", "valid_start"),
        Index("idx_events_session", "user_id", "session_id"),
    )


class EmotionState(Base):
    """情绪状态表"""
    __tablename__ = "emotion_states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"))
    valence = Column(Float, nullable=False)
    arousal = Column(Float, nullable=False)
    dominance = Column(Float, default=0.5)
    user_valence = Column(Float)
    user_arousal = Column(Float)
    trigger_type = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="emotion_states")

    __table_args__ = (
        Index("idx_emotion_user", "user_id", "created_at"),
    )


class SemanticEdge(Base):
    """语义图谱边"""
    __tablename__ = "semantic_edges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    similarity = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_semantic_source", "source_id"),
    )


class CausalEdge(Base):
    """因果图谱边"""
    __tablename__ = "causal_edges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cause_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    effect_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    confidence = Column(Float, nullable=False)
    reasoning = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_causal_cause", "cause_id"),
        Index("idx_causal_effect", "effect_id"),
    )


class EntityNode(Base):
    """实体节点"""
    __tablename__ = "entity_nodes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    entity_type = Column(String(50))
    description = Column(Text)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    mention_count = Column(Integer, default=1)

    __table_args__ = (
        Index("idx_entity_user", "user_id"),
    )


class EntityMention(Base):
    """实体提及"""
    __tablename__ = "entity_mentions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    entity_id = Column(Integer, ForeignKey("entity_nodes.id"), nullable=False)
    mention_text = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)


class Sticker(Base):
    """表情包表"""
    __tablename__ = "stickers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(50), nullable=False)  # 撒花/比心/歪头等
    name = Column(String(100), nullable=False)
    image_url = Column(String(500), nullable=False)
    source = Column(String(50), default="preset")  # preset / user_uploaded / user_learned
    style = Column(String(50), default="default")  # 可爱风/搞怪风/治愈风/高冷风
    use_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Group(Base):
    """群聊表"""
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    avatar_url = Column(String(500))
    max_members = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)


class GroupMember(Base):
    """群成员表"""
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), default="member")  # owner / admin / member
    nickname = Column(String(100))
    joined_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_group_member", "group_id", "user_id", unique=True),
    )


class GroupMessage(Base):
    """群消息表"""
    __tablename__ = "group_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_type = Column(String(20), default="user")  # user / ai
    content = Column(Text, nullable=False)
    content_type = Column(String(20), default="text")  # text / image / sticker
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_group_msg", "group_id", "created_at"),
    )


class Post(Base):
    """动态/朋友圈表"""
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_type = Column(String(20), default="user")  # user / ai
    content = Column(Text, nullable=False)
    image_urls = Column(JSON)  # ["url1", "url2"]
    mood = Column(String(20))  # 开心/难过/无聊/兴奋等
    location = Column(String(200))
    is_public = Column(Boolean, default=True)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_posts_user", "user_id", "created_at"),
    )


class PostLike(Base):
    """动态点赞表"""
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_post_like_unique", "post_id", "user_id", unique=True),
    )


class PostComment(Base):
    """动态评论表"""
    __tablename__ = "post_comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_type = Column(String(20), default="user")  # user / ai
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_post_comment", "post_id", "created_at"),
    )


class EmotionEdge(Base):
    """情绪图谱边"""
    __tablename__ = "emotion_edges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_state_id = Column(Integer, ForeignKey("emotion_states.id"), nullable=False)
    target_state_id = Column(Integer, ForeignKey("emotion_states.id"), nullable=False)
    edge_type = Column(String(20), nullable=False)  # trigger / recovery / contagion / decay
    weight = Column(Float, default=1.0)
    duration_seconds = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_emotion_edge_source", "source_state_id"),
    )
