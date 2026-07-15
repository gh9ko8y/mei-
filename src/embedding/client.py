"""Embedding客户端：将文字转成向量"""

import hashlib
import math
from typing import Optional


class EmbeddingClient:
    """Embedding向量化客户端

    使用改进的hash-based embedding，适合Phase 1开发
    Phase 2可切换到真实embedding API
    """

    def __init__(self, dimension: int = 384, cache_ttl: int = 3600):
        self.dimension = dimension
        self._cache: dict[str, tuple[list[float], float]] = {}
        self._cache_ttl = cache_ttl

    def embed(self, text: str) -> list[float]:
        """将文字转成向量"""
        import time

        # 检查缓存（带过期）
        cache_key = self._cache_key(text)
        if cache_key in self._cache:
            vector, timestamp = self._cache[cache_key]
            if time.time() - timestamp < self._cache_ttl:
                return vector
            else:
                del self._cache[cache_key]

        # 使用改进的hash-based embedding
        vector = self._hash_embed(text)

        # 缓存结果（带时间戳）
        self._cache[cache_key] = (vector, time.time())

        return vector

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """批量向量化"""
        return [self.embed(text) for text in texts]

    def similarity(self, vec1: list[float], vec2: list[float]) -> float:
        """计算两个向量的余弦相似度"""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot_product / (norm1 * norm2)

    def _hash_embed(self, text: str) -> list[float]:
        """基于多哈希的embedding，比单MD5更稳定"""
        import struct

        # 使用多种哈希算法生成不同特征
        hashes = []
        for algo in [hashlib.md5, hashlib.sha1, hashlib.sha256]:
            h = algo(text.encode('utf-8')).digest()
            # 每个哈希转成多个float
            for i in range(0, len(h) - 3, 4):
                val = struct.unpack('f', h[i:i+4])[0]
                # 归一化到 [-1, 1]
                val = max(-1.0, min(1.0, val / 1e38))
                hashes.append(val)

        # 扩展到目标维度
        result = []
        while len(result) < self.dimension:
            for v in hashes:
                if len(result) >= self.dimension:
                    break
                result.append(v)
            # 添加一些扰动避免完全重复
            hashes = [h * 0.999 + 0.001 for h in hashes]

        return result[:self.dimension]

    def _cache_key(self, text: str) -> str:
        """生成缓存键"""
        return hashlib.md5(text.encode()).hexdigest()

    def close(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
