"""数据库连接管理"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager


class DatabaseManager:
    """数据库连接管理器"""

    def __init__(self, database_url: str = None, is_admin: bool = False):
        if is_admin:
            # 管理员专用数据库
            self.database_url = database_url or os.environ.get(
                "ADMIN_DATABASE_URL",
                "sqlite:///admin.db"
            )
        else:
            # 普通用户数据库
            self.database_url = database_url or os.environ.get(
                "DATABASE_URL",
                "sqlite:///aria.db"
            )
        
        self.engine = create_engine(
            self.database_url,
            echo=False,
            pool_pre_ping=True,
        )
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine,
        )

    def create_tables(self):
        """创建所有表"""
        from .models import Base
        Base.metadata.create_all(bind=self.engine)

    @contextmanager
    def get_session(self) -> Session:
        """获取数据库会话（上下文管理器）"""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_session_factory(self):
        """获取会话工厂"""
        return self.SessionLocal
