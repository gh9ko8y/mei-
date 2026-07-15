"""图片生成客户端：使用Pollinations.ai生成头像"""

from typing import Optional
import httpx
import urllib.parse


class ImageGenerator:
    """图片生成客户端"""

    def __init__(self, base_url: str = "https://image.pollinations.ai/prompt"):
        self.base_url = base_url
        self.client = httpx.Client(timeout=120.0, follow_redirects=True)

    def generate_avatar(
        self,
        prompt: str,
        width: int = 512,
        height: int = 512,
        style: str = "anime"
    ) -> Optional[bytes]:
        """生成头像图片

        Args:
            prompt: 描述提示词
            width: 图片宽度
            height: 图片高度
            style: 风格 (anime, realistic, cartoon)

        Returns:
            JPEG图片字节，失败返回None
        """
        # 构建完整的提示词
        style_prefix = {
            "anime": "anime style, cute, kawaii,",
            "realistic": "realistic, photorealistic,",
            "cartoon": "cartoon style, cute,",
        }
        full_prompt = f"{style_prefix.get(style, '')} {prompt}, portrait, high quality, detailed"

        # URL编码
        encoded_prompt = urllib.parse.quote(full_prompt)

        url = f"{self.base_url}/{encoded_prompt}?width={width}&height={height}&nologo=true"

        try:
            resp = self.client.get(url)
            resp.raise_for_status()
            if "image" in resp.headers.get("content-type", ""):
                return resp.content
            return None
        except Exception as e:
            print(f"Image generation error: {e}")
            return None

    def generate_with_config(self, config: dict, size: int = 512) -> Optional[bytes]:
        """根据AvatarConfig生成头像

        Args:
            config: 头像配置字典
            size: 图片大小

        Returns:
            JPEG图片字节
        """
        # 根据配置构建提示词
        face_map = {"round": "round face", "oval": "oval face", "square": "square face", "heart": "heart-shaped face", "long": "long face"}
        hair_map = {
            "long-straight": "long straight hair",
            "long-wavy": "long wavy hair",
            "long-curly": "long curly hair",
            "medium-straight": "medium length straight hair",
            "medium-wavy": "medium length wavy hair",
            "short-straight": "short straight hair",
        }
        eye_map = {"round": "big round eyes", "almond": "almond eyes", "cat": "cat eyes"}

        prompt_parts = [
            "cute anime girl",
            face_map.get(config.get("faceShape", "oval"), "oval face"),
            hair_map.get(config.get("hairStyle", "long-straight"), "long hair"),
            f"{config.get('hairColor', '#FF69B4')} hair",
            eye_map.get(config.get("eyeShape", "round"), "big eyes"),
            f"{config.get('eyeColor', 'brown')} eyes",
            "gentle smile",
            "beautiful",
        ]

        prompt = ", ".join(prompt_parts)
        return self.generate_avatar(prompt, size, size)

    def close(self):
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
