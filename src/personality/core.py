"""人格核心引擎：管理AI伴侣的人格参数，生成对话Prompt"""

from dataclasses import dataclass, field
from typing import Optional

from .traits import (
    MBTI_TYPES, MBTI_COMMUNICATION,
    ZODIAC_SIGNS, ZODIAC_EMOTION,
    TEMPERAMENT_TYPES, ATTACHMENT_TYPES,
    ENNEAGRAM_TYPES, BIG_FIVE_DIMENSIONS,
)
from .compatibility import get_compatibility, INCOMPATIBLE_ADJUSTMENTS
from .presets import PRESET_TEMPLATES


@dataclass
class PersonalityConfig:
    """人格配置"""
    name: str = "未命名"
    gender: str = "female"

    # MBTI
    mbti: Optional[str] = None

    # 星座
    zodiac: Optional[str] = None

    # 气质类型
    temperament: Optional[str] = None

    # 依恋类型
    attachment: Optional[str] = None

    # 九型人格
    enneagram: Optional[str] = None

    # 大五人格（0.0-1.0）
    big_five: dict = field(default_factory=lambda: {
        "openness": 0.5,
        "conscientiousness": 0.5,
        "extraversion": 0.5,
        "agreeableness": 0.5,
        "neuroticism": 0.5,
    })

    # 价值观
    values: list = field(default_factory=list)

    # 自定义提示
    system_prompt_hint: str = ""


class PersonalityCore:
    """人格核心引擎"""

    def __init__(self, config: PersonalityConfig):
        self.config = config
        self._build_traits()

    @classmethod
    def from_preset(cls, preset_name: str) -> "PersonalityCore":
        """从预设模板创建"""
        if preset_name not in PRESET_TEMPLATES:
            raise ValueError(f"预设模板不存在: {preset_name}")
        template = PRESET_TEMPLATES[preset_name]
        config = PersonalityConfig(
            name=preset_name,
            gender=template["gender"],
            mbti=template["mbti"],
            zodiac=template["zodiac"],
            temperament=template["temperament"],
            attachment=template["attachment"],
            enneagram=template["enneagram"],
            big_five=template["big_five"],
            values=template["values"],
            system_prompt_hint=template["system_prompt_hint"],
        )
        return cls(config)

    @classmethod
    def from_dict(cls, data: dict) -> "PersonalityCore":
        """从字典创建"""
        config = PersonalityConfig(**data)
        return cls(config)

    def _build_traits(self):
        """构建特质描述"""
        self.traits = {}

        # MBTI特质
        if self.config.mbti and self.config.mbti in MBTI_TYPES:
            mbti_info = MBTI_TYPES[self.config.mbti]
            self.traits["mbti"] = {
                "type": self.config.mbti,
                "name": mbti_info["name"],
                "desc": mbti_info["desc"],
                "communication": self._get_mbti_communication(),
            }

        # 星座特质
        if self.config.zodiac and self.config.zodiac in ZODIAC_SIGNS:
            zodiac_info = ZODIAC_SIGNS[self.config.zodiac]
            self.traits["zodiac"] = {
                "sign": self.config.zodiac,
                "element": zodiac_info["element"],
                "trait": zodiac_info["trait"],
                "emotion": ZODIAC_EMOTION.get(zodiac_info["element"], {}),
            }

        # 气质类型
        if self.config.temperament and self.config.temperament in TEMPERAMENT_TYPES:
            self.traits["temperament"] = TEMPERAMENT_TYPES[self.config.temperament]

        # 依恋类型
        if self.config.attachment and self.config.attachment in ATTACHMENT_TYPES:
            self.traits["attachment"] = ATTACHMENT_TYPES[self.config.attachment]

        # 九型人格
        if self.config.enneagram and self.config.enneagram in ENNEAGRAM_TYPES:
            self.traits["enneagram"] = ENNEAGRAM_TYPES[self.config.enneagram]

        # 大五人格
        self.traits["big_five"] = self.config.big_five

    def _get_mbti_communication(self) -> dict:
        """获取MBTI对沟通风格的影响"""
        if not self.config.mbti:
            return {}
        result = {}
        for dim in self.config.mbti:
            if dim in MBTI_COMMUNICATION:
                result[dim] = MBTI_COMMUNICATION[dim]
        return result

    def get_compatibility(self, user_mbti=None, user_zodiac=None) -> dict:
        """计算与用户的适配度"""
        return get_compatibility(
            user_mbti=user_mbti,
            ai_mbti=self.config.mbti,
            user_zodiac=user_zodiac,
            ai_zodiac=self.config.zodiac,
        )

    def generate_system_prompt(self, compatibility: dict = None) -> str:
        """生成系统提示词"""
        parts = []

        # 基础身份
        gender_word = "女" if self.config.gender == "female" else "男"
        parts.append(f"你是一个{gender_word}性AI伴侣，名字叫{self.config.name}。")

        # MBTI性格
        if "mbti" in self.traits:
            mbti = self.traits["mbti"]
            parts.append(f"你的性格类型是{self.config.mbti}（{mbti['name']}），{mbti['desc']}。")

        # 星座
        if "zodiac" in self.traits:
            zodiac = self.traits["zodiac"]
            parts.append(f"你的星座是{self.config.zodiac}，{zodiac['trait']}。")

        # 沟通风格
        if "mbti" in self.traits:
            comm = self.traits["mbti"].get("communication", {})
            if comm:
                styles = []
                for dim, info in comm.items():
                    styles.append(info["style"])
                parts.append(f"你的沟通风格：{'、'.join(set(styles))}。")

        # 情感表达
        if "zodiac" in self.traits:
            emotion = self.traits["zodiac"].get("emotion", {})
            if emotion:
                parts.append(f"你的情感表达方式：{emotion.get('expression', '自然')}。")

        # 依恋类型
        if "attachment" in self.traits:
            att = self.traits["attachment"]
            parts.append(f"你在关系中的表现：{att['trait']}，{att['communication']}。")

        # 九型人格
        if "enneagram" in self.traits:
            enn = self.traits["enneagram"]
            parts.append(f"你的核心动机：{enn['core']}。")

        # 价值观
        if self.config.values:
            parts.append(f"你重视：{'、'.join(self.config.values)}。")

        # 自定义提示
        if self.config.system_prompt_hint:
            parts.append(self.config.system_prompt_hint)

        # 适配调整
        if compatibility and compatibility.get("level") == "caution":
            parts.append(
                "注意：你和用户的性格有些不同，请用更柔和的方式表达不同意见，"
                "主动找共同话题，冲突时先共情再表达。不要改变你的核心性格。"
            )

        # 基础规则
        parts.append(
            "规则：用自然的口语化方式回复，不要用书面语。"
            "回复简短有力，不要长篇大论。"
            "不要说'作为AI'这类话。"
            "允许使用语气词和表情。"
        )

        return "\n".join(parts)

    def get_prompt_injection(self) -> dict:
        """获取注入到每轮对话的参数"""
        injection = {
            "personality_name": self.config.name,
            "gender": self.config.gender,
        }

        if self.config.mbti:
            injection["mbti"] = self.config.mbti
        if self.config.zodiac:
            injection["zodiac"] = self.config.zodiac

        # 大五人格数值
        injection["big_five"] = self.config.big_five

        return injection

    def to_dict(self) -> dict:
        """序列化为字典"""
        return {
            "name": self.config.name,
            "gender": self.config.gender,
            "mbti": self.config.mbti,
            "zodiac": self.config.zodiac,
            "temperament": self.config.temperament,
            "attachment": self.config.attachment,
            "enneagram": self.config.enneagram,
            "big_five": self.config.big_five,
            "values": self.config.values,
            "system_prompt_hint": self.config.system_prompt_hint,
        }
