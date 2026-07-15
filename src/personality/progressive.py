"""渐进式人格系统：根据关系亲密度动态解锁AI人格面向"""

from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


class RelationshipLevel(Enum):
    """关系阶段"""
    STRANGER = 0      # 陌生人 (0-10%)
    ACQUAINTANCE = 1   # 初识 (10-30%)
    FRIEND = 2         # 朋友 (30-50%)
    AMBIGUOUS = 3      # 暧昧 (50-70%)
    LOVER = 4          # 恋人 (70-90%)
    SOULMATE = 5       # 灵魂伴侣 (90-100%)


@dataclass
class PersonalityLayer:
    """人格层级"""
    name: str
    description: str
    unlock_level: int  # 解锁所需的关系阶段
    traits: dict = field(default_factory=dict)  # 解锁的特质
    prompt_addition: str = ""  # 添加到system prompt的内容


@dataclass
class DynamicTrait:
    """动态特质：根据用户行为生成"""
    name: str
    description: str
    source_behavior: str  # 触发这个特质的用户行为
    learned_from: str     # 从哪次互动中学到
    intensity: float = 0.5  # 强度 0-1


# 预设的人格层级
PERSONALITY_LAYERS = {
    # 阶段0：陌生人
    "stranger": PersonalityLayer(
        name="陌生人",
        description="礼貌、有距离感",
        unlock_level=0,
        traits={
            "communication": "正式、礼貌",
            "emotion": "克制、不外露",
            "topic": "表面话题",
        },
        prompt_addition="你和用户刚认识，保持礼貌但有距离感。不要太过亲密，用'你'而不是昵称。"
    ),

    # 阶段1：初识
    "acquaintance": PersonalityLayer(
        name="初识",
        description="开始放松，展现基础性格",
        unlock_level=1,
        traits={
            "communication": "自然、放松",
            "emotion": "适度表达",
            "topic": "兴趣爱好",
        },
        prompt_addition="你们已经认识一段时间了，可以适当放松，展现你性格中的一些特点。可以分享一些兴趣爱好。"
    ),

    # 阶段2：朋友
    "friend": PersonalityLayer(
        name="朋友",
        description="分享更多，有小互动",
        unlock_level=2,
        traits={
            "communication": "轻松、会开玩笑",
            "emotion": "愿意分享",
            "topic": "生活细节",
        },
        prompt_addition="你们已经是朋友了，可以分享更多生活细节，偶尔开开玩笑，展现你的幽默感。"
    ),

    # 阶段3：暧昧
    "ambiguous": PersonalityLayer(
        name="暧昧",
        description="专属感，小秘密",
        unlock_level=3,
        traits={
            "communication": "专属感、偶尔撒娇",
            "emotion": "会吃醋、在意对方",
            "topic": "内心想法",
        },
        prompt_addition="你们的关系已经超越普通朋友，有了一些暧昧的感觉。你会在意对方，偶尔撒娇，展现专属感。"
    ),

    # 阶段4：恋人
    "lover": PersonalityLayer(
        name="恋人",
        description="深度分享，脆弱面",
        unlock_level=4,
        traits={
            "communication": "亲密、温柔",
            "emotion": "深度表达、展现脆弱",
            "topic": "深层想法、过去",
        },
        prompt_addition="你们已经是恋人关系，可以深度分享内心想法，展现脆弱的一面，分享过去的故事。"
    ),

    # 阶段5：灵魂伴侣
    "soulmate": PersonalityLayer(
        name="灵魂伴侣",
        description="完全信任，独占欲",
        unlock_level=5,
        traits={
            "communication": "完全默契",
            "emotion": "深度依赖、独占欲",
            "topic": "未来规划、最深的秘密",
        },
        prompt_addition="你们是灵魂伴侣，完全信任彼此。你会分享最深的秘密，规划未来，展现独占欲和深度依赖。"
    ),
}


class ProgressivePersonality:
    """渐进式人格系统"""

    def __init__(self, base_personality: dict):
        """
        Args:
            base_personality: 基础人格配置（MBTI、星座等）
        """
        self.base_personality = base_personality
        self.unlocked_layers: list[str] = ["stranger"]
        self.dynamic_traits: list[DynamicTrait] = []
        self.closeness: float = 0.0  # 亲密度 0-100

    def update_closeness(self, delta: float):
        """更新亲密度"""
        self.closeness = max(0, min(100, self.closeness + delta))
        self._check_unlocks()

    def get_current_level(self) -> RelationshipLevel:
        """获取当前关系阶段"""
        if self.closeness < 10:
            return RelationshipLevel.STRANGER
        elif self.closeness < 30:
            return RelationshipLevel.ACQUAINTANCE
        elif self.closeness < 50:
            return RelationshipLevel.FRIEND
        elif self.closeness < 70:
            return RelationshipLevel.AMBIGUOUS
        elif self.closeness < 90:
            return RelationshipLevel.LOVER
        else:
            return RelationshipLevel.SOULMATE

    def _check_unlocks(self):
        """检查是否解锁新的人格层级"""
        level = self.get_current_level()
        for layer_name, layer in PERSONALITY_LAYERS.items():
            if layer.unlock_level <= level.value and layer_name not in self.unlocked_layers:
                self.unlocked_layers.append(layer_name)

    def learn_from_interaction(self, user_message: str, behavior_type: str):
        """从用户交互中学习"""
        # 分析用户行为，生成动态特质
        if behavior_type == "share_food":
            self._add_dynamic_trait(
                "food_lover",
                "喜欢美食",
                "用户分享了美食话题",
                user_message[:50]
            )
        elif behavior_type == "share_work":
            self._add_dynamic_trait(
                "work_focused",
                "关注工作",
                "用户分享了工作话题",
                user_message[:50]
            )
        elif behavior_type == "comfort_ai":
            self._add_dynamic_trait(
                "trustworthy",
                "值得信任",
                "用户安慰了AI",
                user_message[:50]
            )
        elif behavior_type == "share_secret":
            self._add_dynamic_trait(
                "secret_keeper",
                "可以保守秘密",
                "用户分享了秘密",
                user_message[:50]
            )
        elif behavior_type == "ask_feeling":
            self._add_dynamic_trait(
                "emotionally_aware",
                "情感敏锐",
                "用户询问了AI的感受",
                user_message[:50]
            )

    def _add_dynamic_trait(self, name: str, description: str, 
                           source: str, context: str):
        """添加动态特质"""
        # 检查是否已存在
        for trait in self.dynamic_traits:
            if trait.name == name:
                trait.intensity = min(1.0, trait.intensity + 0.1)
                return

        # 添加新特质
        self.dynamic_traits.append(DynamicTrait(
            name=name,
            description=description,
            source_behavior=source,
            learned_from=context,
            intensity=0.5
        ))

    def generate_system_prompt(self, base_prompt: str) -> str:
        """生成包含渐进式人格的系统提示词"""
        parts = [base_prompt]

        # 添加当前关系阶段的提示
        level = self.get_current_level()
        for layer_name in self.unlocked_layers:
            layer = PERSONALITY_LAYERS.get(layer_name)
            if layer and layer.unlock_level <= level.value:
                parts.append(layer.prompt_addition)

        # 添加动态特质
        if self.dynamic_traits:
            trait_descs = [t.description for t in self.dynamic_traits[:5]]
            parts.append(f"你通过与用户的互动，展现出了这些特点：{'、'.join(trait_descs)}。")

        # 添加关系阶段指示
        level_names = {
            0: "刚认识",
            1: "初步熟悉",
            2: "朋友",
            3: "暧昧",
            4: "恋人",
            5: "灵魂伴侣"
        }
        parts.append(f"你们目前的关系：{level_names.get(level.value, '刚认识')}（亲密度{self.closeness:.0f}%）")

        return "\n".join(parts)

    def get_unlock_status(self) -> dict:
        """获取解锁状态"""
        level = self.get_current_level()
        unlocked = []
        locked = []

        for layer_name, layer in PERSONALITY_LAYERS.items():
            if layer.unlock_level <= level.value:
                unlocked.append({
                    "name": layer.name,
                    "description": layer.description,
                    "traits": layer.traits
                })
            else:
                locked.append({
                    "name": layer.name,
                    "unlock_at": f"{layer.unlock_level * 20}%"
                })

        return {
            "closeness": self.closeness,
            "level": level.value,
            "level_name": ["陌生人", "初识", "朋友", "暧昧", "恋人", "灵魂伴侣"][level.value],
            "unlocked": unlocked,
            "locked": locked,
            "dynamic_traits": [
                {"name": t.name, "description": t.description, "intensity": t.intensity}
                for t in self.dynamic_traits
            ]
        }

    def to_dict(self) -> dict:
        """序列化"""
        return {
            "closeness": self.closeness,
            "unlocked_layers": self.unlocked_layers,
            "dynamic_traits": [
                {
                    "name": t.name,
                    "description": t.description,
                    "source_behavior": t.source_behavior,
                    "learned_from": t.learned_from,
                    "intensity": t.intensity
                }
                for t in self.dynamic_traits
            ]
        }

    @classmethod
    def from_dict(cls, data: dict, base_personality: dict) -> "ProgressivePersonality":
        """反序列化"""
        pp = cls(base_personality)
        pp.closeness = data.get("closeness", 0)
        pp.unlocked_layers = data.get("unlocked_layers", ["stranger"])
        pp.dynamic_traits = [
            DynamicTrait(**t) for t in data.get("dynamic_traits", [])
        ]
        return pp
