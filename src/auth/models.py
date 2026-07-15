"""认证数据模型"""

from pydantic import BaseModel, field_validator
from typing import Optional


class RegisterRequest(BaseModel):
    """注册请求"""
    username: str
    password: str
    email: str
    code: str
    nickname: Optional[str] = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v):
        if not v or not v.strip():
            raise ValueError("用户名不能为空")
        if len(v) < 3 or len(v) > 50:
            raise ValueError("用户名长度3-50字符")
        if not v.isalnum() and "_" not in v:
            raise ValueError("用户名只能包含字母、数字和下划线")
        return v.strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not v or len(v) < 6:
            raise ValueError("密码至少6位")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if not v or "@" not in v:
            raise ValueError("请输入有效的邮箱地址")
        return v.lower().strip()


class LoginRequest(BaseModel):
    """登录请求"""
    aria_id: str  # Aria号，用于登录
    password: str


class TokenResponse(BaseModel):
    """Token响应"""
    access_token: str
    token_type: str = "bearer"
    user_id: int
    aria_id: Optional[str] = None
    nickname: Optional[str] = None
