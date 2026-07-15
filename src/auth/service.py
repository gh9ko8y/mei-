"""认证服务：密码哈希 + JWT Token"""

import hashlib
import json
import os
import time
from pathlib import Path
from typing import Optional
import bcrypt

JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is required")
JWT_EXPIRE_HOURS = 7 * 24  # 7天


def hash_password(password: str) -> str:
    """密码哈希"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, stored_hash: str) -> bool:
    """验证密码"""
    return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))


def create_token(user_id: int, username: str) -> str:
    """创建JWT Token（简化版，不依赖PyJWT）"""
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": int(time.time()) + JWT_EXPIRE_HOURS * 3600,
    }
    # 简化版token：base64编码的payload + 签名
    import base64
    payload_str = base64.b64encode(json.dumps(payload).encode()).decode()
    signature = hashlib.sha256(f"{JWT_SECRET}:{payload_str}".encode()).hexdigest()[:16]
    return f"{payload_str}.{signature}"


def verify_token(token: str) -> Optional[dict]:
    """验证JWT Token"""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_str, signature = parts
        expected = hashlib.sha256(f"{JWT_SECRET}:{payload_str}".encode()).hexdigest()[:16]
        if signature != expected:
            return None
        import base64
        payload = json.loads(base64.b64decode(payload_str))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None
