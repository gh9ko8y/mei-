"""TTS客户端：使用MiMo TTS将文字转成语音"""

import base64
from typing import Optional
import httpx


class TTSClient:
    """MiMo TTS客户端"""

    def __init__(self, api_key: str, base_url: str,
                 model: str = "mimo-v2.5-tts"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.client = httpx.Client(timeout=60.0)

    def synthesize(self, text: str, voice: str = "alloy") -> Optional[bytes]:
        """将文字转成语音

        Args:
            text: 要转换的文字
            voice: 音色 (alloy, echo, fable, onyx, nova, shimmer)

        Returns:
            MP3音频字节，失败返回None
        """
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": "请用语音回复"},
                {"role": "assistant", "content": text}
            ],
            "response_format": {"type": "audio"}
        }

        try:
            resp = self.client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            audio_data = data["choices"][0]["message"]["audio"]["data"]
            return base64.b64decode(audio_data)
        except Exception as e:
            print(f"TTS error: {e}")
            return None

    def close(self):
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
