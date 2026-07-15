"""邮箱验证码服务 - 支持QQ邮箱/163邮箱"""
import random
import string
import time
import smtplib
import threading
from email.mime.text import MIMEText
from typing import Optional
import os

# 验证码存储（线程安全 + 大小限制）
verification_codes: dict[str, tuple[str, float]] = {}
_verification_lock = threading.Lock()
CODE_EXPIRE_SECONDS = 300  # 5分钟过期
MAX_VERIFICATION_CODES = 10000  # 防 DoS：超过此数量时清理过期项

# SMTP配置
SMTP_CONFIG = {
    "qq": {"server": "smtp.qq.com", "port": 465},
    "163": {"server": "smtp.163.com", "port": 465},
    "gmail": {"server": "smtp.gmail.com", "port": 465},
}


def get_email_config():
    """获取邮箱配置（从环境变量）"""
    return {
        "provider": os.environ.get("EMAIL_PROVIDER", "qq"),
        "user": os.environ.get("EMAIL_USER", ""),
        "password": os.environ.get("EMAIL_PASSWORD", ""),
    }


def _cleanup_expired_codes():
    """清理过期验证码。无锁，由调用方持锁。"""
    now = time.time()
    expired = [k for k, (_, t) in verification_codes.items()
               if now - t > CODE_EXPIRE_SECONDS]
    for k in expired:
        del verification_codes[k]


def generate_code(email: str) -> str:
    """生成6位数字验证码"""
    import secrets
    code = ''.join(secrets.choice(string.digits) for _ in range(6))
    with _verification_lock:
        if len(verification_codes) >= MAX_VERIFICATION_CODES:
            _cleanup_expired_codes()
        verification_codes[email] = (code, time.time())
    return code


def verify_code(email: str, code: str) -> bool:
    """验证验证码"""
    with _verification_lock:
        if email not in verification_codes:
            return False

        stored_code, created_at = verification_codes[email]

        if time.time() - created_at > CODE_EXPIRE_SECONDS:
            del verification_codes[email]
            return False

        if stored_code == code:
            del verification_codes[email]
            return True

        return False


def send_email(to_email: str, subject: str, content: str) -> bool:
    """发送邮件"""
    config = get_email_config()

    if not config["user"] or not config["password"]:
        raise RuntimeError("Email SMTP not configured. Set EMAIL_USER and EMAIL_PASSWORD environment variables.")

    try:
        smtp_config = SMTP_CONFIG.get(config["provider"], SMTP_CONFIG["qq"])

        msg = MIMEText(content, 'plain', 'utf-8')
        msg['Subject'] = subject
        msg['From'] = config["user"]
        msg['To'] = to_email

        with smtplib.SMTP_SSL(smtp_config["server"], smtp_config["port"]) as server:
            server.login(config["user"], config["password"])
            server.sendmail(config["user"], to_email, msg.as_string())

        print(f"邮件已发送到 {to_email}")
        return True
    except Exception as e:
        print(f"邮件发送失败: {e}")
        return False


def send_verification_email(email: str) -> str:
    """发送验证码"""
    code = generate_code(email)
    
    subject = "Aria·念 - 验证码"
    content = f"您的验证码是: {code}\n\n验证码5分钟内有效，请勿泄露给他人。"
    
    send_email(email, subject, content)
    
    return code
