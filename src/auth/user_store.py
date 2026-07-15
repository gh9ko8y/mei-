"""用户存储：内存实现（Phase 1）"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from .service import hash_password, verify_password


@dataclass
class User:
    id: int
    aria_id: str  # Aria号，用于登录
    username: str  # 用户名/昵称
    password_hash: str
    nickname: str = ""
    is_admin: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)


class UserStore:
    """用户存储（内存实现）"""

    def __init__(self):
        self._users: dict[int, User] = {}
        self._by_aria_id: dict[str, int] = {}  # Aria号 -> user_id
        self._next_id = 1

    def register(self, aria_id: str, username: str, password: str,
                 nickname: str = "", is_admin: bool = False) -> Optional[User]:
        """注册新用户"""
        if aria_id in self._by_aria_id:
            return None  # Aria号已存在

        user = User(
            id=self._next_id,
            aria_id=aria_id,
            username=username,
            password_hash=hash_password(password),
            nickname=nickname or username,
            is_admin=is_admin,
        )
        self._next_id += 1
        self._users[user.id] = user
        self._by_aria_id[aria_id] = user.id
        return user

    def login(self, aria_id: str, password: str) -> Optional[User]:
        """登录验证 - 使用Aria号"""
        user_id = self._by_aria_id.get(aria_id)
        if not user_id:
            return None
        user = self._users.get(user_id)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        """获取用户"""
        return self._users.get(user_id)

    def exists(self, aria_id: str) -> bool:
        """检查Aria号是否存在"""
        return aria_id in self._by_aria_id

    def get_by_aria_id(self, aria_id: str) -> Optional[User]:
        """通过Aria号获取用户"""
        user_id = self._by_aria_id.get(aria_id)
        return self._users.get(user_id) if user_id else None
