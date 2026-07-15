"""人格特质数据定义：MBTI、星座、气质类型等"""

# ============================================
# MBTI 16种类型
# ============================================
MBTI_TYPES = {
    "INTJ": {"name": "建筑师", "desc": "独立思考者，善于战略规划", "energy": "I", "perceive": "N", "decide": "T", "lifestyle": "J"},
    "INTP": {"name": "逻辑学家", "desc": "热爱探索理论和抽象概念", "energy": "I", "perceive": "N", "decide": "T", "lifestyle": "P"},
    "ENTJ": {"name": "指挥官", "desc": "天生的领导者，果断有远见", "energy": "E", "perceive": "N", "decide": "T", "lifestyle": "J"},
    "ENTP": {"name": "辩论家", "desc": "思维敏捷，喜欢挑战和辩论", "energy": "E", "perceive": "N", "decide": "T", "lifestyle": "P"},
    "INFJ": {"name": "提倡者", "desc": "理想主义者，追求意义和深度", "energy": "I", "perceive": "N", "decide": "F", "lifestyle": "J"},
    "INFP": {"name": "调停者", "desc": "富有同情心，追求内心和谐", "energy": "I", "perceive": "N", "decide": "F", "lifestyle": "P"},
    "ENFJ": {"name": "主人公", "desc": "温暖有魅力，善于激励他人", "energy": "E", "perceive": "N", "decide": "F", "lifestyle": "J"},
    "ENFP": {"name": "竞选者", "desc": "热情洋溢，富有创造力", "energy": "E", "perceive": "N", "decide": "F", "lifestyle": "P"},
    "ISTJ": {"name": "物流师", "desc": "务实可靠，注重细节和规则", "energy": "I", "perceive": "S", "decide": "T", "lifestyle": "J"},
    "ISFJ": {"name": "守护者", "desc": "温暖忠诚，乐于助人", "energy": "I", "perceive": "S", "decide": "F", "lifestyle": "J"},
    "ESTJ": {"name": "总经理", "desc": "组织能力强，注重效率和秩序", "energy": "E", "perceive": "S", "decide": "T", "lifestyle": "J"},
    "ESFJ": {"name": "执政官", "desc": "热心体贴，重视和谐和传统", "energy": "E", "perceive": "S", "decide": "F", "lifestyle": "J"},
    "ISTP": {"name": "鉴赏家", "desc": "灵活务实，喜欢动手解决问题", "energy": "I", "perceive": "S", "decide": "T", "lifestyle": "P"},
    "ISFP": {"name": "探险家", "desc": "温和敏感，享受当下的美", "energy": "I", "perceive": "S", "decide": "F", "lifestyle": "P"},
    "ESTP": {"name": "企业家", "desc": "精力充沛，喜欢冒险和刺激", "energy": "E", "perceive": "S", "decide": "T", "lifestyle": "P"},
    "ESFP": {"name": "表演者", "desc": "热情开朗，喜欢成为焦点", "energy": "E", "perceive": "S", "decide": "F", "lifestyle": "P"},
}

# MBTI对对话风格的影响
MBTI_COMMUNICATION = {
    "E": {"style": "先表达再思考", "pace": "快", "length": "短"},
    "I": {"style": "先思考再表达", "pace": "慢", "length": "长"},
    "S": {"style": "关注具体细节", "pace": "稳", "length": "中"},
    "N": {"style": "关注抽象概念", "pace": "快", "length": "长"},
    "T": {"style": "逻辑分析优先", "pace": "稳", "length": "中"},
    "F": {"style": "情感共情优先", "pace": "慢", "length": "长"},
    "J": {"style": "有条理有计划", "pace": "稳", "length": "中"},
    "P": {"style": "灵活随性", "pace": "快", "length": "短"},
}

# ============================================
# 星座 12种
# ============================================
ZODIAC_SIGNS = {
    "白羊座": {"date": "3.21-4.19", "element": "火", "trait": "热情冲动，直来直去"},
    "金牛座": {"date": "4.20-5.20", "element": "土", "trait": "稳重踏实，享受生活"},
    "双子座": {"date": "5.21-6.21", "element": "风", "trait": "聪明灵活，好奇心强"},
    "巨蟹座": {"date": "6.22-7.22", "element": "水", "trait": "温柔敏感，重视家庭"},
    "狮子座": {"date": "7.23-8.22", "element": "火", "trait": "自信大方，喜欢被关注"},
    "处女座": {"date": "8.23-9.22", "element": "土", "trait": "细致认真，追求完美"},
    "天秤座": {"date": "9.23-10.23", "element": "风", "trait": "优雅和谐，善于社交"},
    "天蝎座": {"date": "10.24-11.22", "element": "水", "trait": "神秘深沉，情感强烈"},
    "射手座": {"date": "11.23-12.21", "element": "火", "trait": "乐观自由，热爱冒险"},
    "摩羯座": {"date": "12.22-1.19", "element": "土", "trait": "务实稳重，目标明确"},
    "水瓶座": {"date": "1.20-2.18", "element": "风", "trait": "独立创新，思想前卫"},
    "双鱼座": {"date": "2.19-3.20", "element": "水", "trait": "浪漫敏感，富有想象力"},
}

# 星座对情感表达的影响
ZODIAC_EMOTION = {
    "火": {"expression": "直接热烈", "pace": "快", "intensity": "高"},
    "土": {"expression": "内敛稳重", "pace": "慢", "intensity": "低"},
    "风": {"expression": "轻松活泼", "pace": "快", "intensity": "中"},
    "水": {"expression": "细腻敏感", "pace": "慢", "intensity": "高"},
}

# ============================================
# 气质类型 4种
# ============================================
TEMPERAMENT_TYPES = {
    "胆汁质": {"trait": "精力旺盛，情绪激烈", "pace": "快", "intensity": "高"},
    "多血质": {"trait": "活泼好动，情绪多变", "pace": "快", "intensity": "中"},
    "粘液质": {"trait": "沉着冷静，情绪稳定", "pace": "慢", "intensity": "低"},
    "抑郁质": {"trait": "敏感细腻，情绪深沉", "pace": "慢", "intensity": "高"},
}

# ============================================
# 依恋类型 4种
# ============================================
ATTACHMENT_TYPES = {
    "安全型": {"trait": "既能亲密又尊重独立", "communication": "善于表达需求"},
    "焦虑型": {"trait": "渴望亲密，害怕被抛弃", "communication": "需要频繁确认"},
    "回避型": {"trait": "重视独立，回避亲密", "communication": "需要空间"},
    "混乱型": {"trait": "既渴望又害怕亲密", "communication": "情绪波动大"},
}

# ============================================
# 九型人格 9种
# ============================================
ENNEAGRAM_TYPES = {
    "1完美型": {"core": "追求完美，避免错误", "fear": "害怕缺陷"},
    "2助人型": {"core": "渴望被需要，乐于助人", "fear": "害怕不被爱"},
    "3成就型": {"core": "追求成功，注重形象", "fear": "害怕失败"},
    "4自我型": {"core": "追求独特，情感丰富", "fear": "害怕平凡"},
    "5观察型": {"core": "追求知识，喜欢独处", "fear": "害怕无能"},
    "6忠诚型": {"core": "追求安全，忠诚可靠", "fear": "害怕不确定"},
    "7活跃型": {"core": "追求快乐，逃避痛苦", "fear": "害怕被束缚"},
    "8领袖型": {"core": "追求力量，保护弱者", "fear": "害怕被控制"},
    "9和平型": {"core": "追求和谐，避免冲突", "fear": "害怕分离"},
}

# ============================================
# 大五人格 5维度
# ============================================
BIG_FIVE_DIMENSIONS = {
    "开放性": {"low": "务实保守", "high": "好奇创新"},
    "尽责性": {"low": "随性灵活", "high": "自律有条理"},
    "外向性": {"low": "内向安静", "high": "外向活跃"},
    "宜人性": {"low": "直接坦率", "high": "温和体贴"},
    "神经质": {"low": "情绪稳定", "high": "情绪波动"},
}
