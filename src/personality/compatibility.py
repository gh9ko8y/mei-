"""人格适配对照表：MBTI配对、星座配对"""

# ============================================
# MBTI适配对照表
# 每个类型有3个推荐：灵魂伴侣/快乐玩伴/温暖引导
# 低适配（谨慎选择）单独列出
# ============================================
MBTI_COMPATIBILITY = {
    "INTJ": {
        "soulmate": ["ENFP", "ENTJ"],
        "playmate": ["ENTP", "INFJ"],
        "companion": ["INTP", "INFP"],
        "caution": ["ESFJ", "ISFP"],
    },
    "INTP": {
        "soulmate": ["ENTJ", "ENFP"],
        "playmate": ["INTJ", "INTP"],
        "companion": ["INFP", "INFJ"],
        "caution": ["ESFJ", "ISFJ"],
    },
    "ENTJ": {
        "soulmate": ["INTP", "INTJ"],
        "playmate": ["ENTP", "ENTJ"],
        "companion": ["ENFJ", "ENFP"],
        "caution": ["ISFP", "INFP"],
    },
    "ENTP": {
        "soulmate": ["INFJ", "INTJ"],
        "playmate": ["ENTP", "ENTJ"],
        "companion": ["ENFP", "ENFJ"],
        "caution": ["ISFJ", "ISTJ"],
    },
    "INFJ": {
        "soulmate": ["ENTP", "ENFP"],
        "playmate": ["INFJ", "INFP"],
        "companion": ["INTJ", "INTP"],
        "caution": ["ESTP", "ISTP"],
    },
    "INFP": {
        "soulmate": ["ENFJ", "ENTJ"],
        "playmate": ["ENFP", "INFJ"],
        "companion": ["INFP", "INTP"],
        "caution": ["ESTJ", "ISTJ"],
    },
    "ENFJ": {
        "soulmate": ["INFP", "INTP"],
        "playmate": ["ENFJ", "ENFP"],
        "companion": ["INFJ", "INTJ"],
        "caution": ["ISTP", "ISTJ"],
    },
    "ENFP": {
        "soulmate": ["INFJ", "INTJ"],
        "playmate": ["ENFP", "ENFJ"],
        "companion": ["INFP", "ENTP"],
        "caution": ["ISTJ", "ISTP"],
    },
    "ISTJ": {
        "soulmate": ["ESFP", "ENFP"],
        "playmate": ["ISTJ", "ISFJ"],
        "companion": ["ESTJ", "ISFJ"],
        "caution": ["ENTP", "INFP"],
    },
    "ISFJ": {
        "soulmate": ["ESFP", "ESTP"],
        "playmate": ["ISFJ", "ISTJ"],
        "companion": ["ESFJ", "ISTJ"],
        "caution": ["ENTP", "ENFP"],
    },
    "ESTJ": {
        "soulmate": ["ISTP", "ISFP"],
        "playmate": ["ESTJ", "ISTJ"],
        "companion": ["ESFJ", "ISFJ"],
        "caution": ["INFP", "INFJ"],
    },
    "ESFP": {
        "soulmate": ["ISTJ", "ISFJ"],
        "playmate": ["ESFP", "ESTP"],
        "companion": ["ENFP", "ESFJ"],
        "caution": ["INTJ", "INTP"],
    },
    "ISTP": {
        "soulmate": ["ESTJ", "ESFJ"],
        "playmate": ["ISTP", "ISFP"],
        "companion": ["ESTP", "ISTJ"],
        "caution": ["ENFJ", "INFJ"],
    },
    "ISFP": {
        "soulmate": ["ENFJ", "ESFJ"],
        "playmate": ["ISFP", "ISTP"],
        "companion": ["ESFP", "INFP"],
        "caution": ["ENTJ", "INTJ"],
    },
    "ESTP": {
        "soulmate": ["ISFJ", "ISTJ"],
        "playmate": ["ESTP", "ESFP"],
        "companion": ["ISTP", "ESFP"],
        "caution": ["INFJ", "INFP"],
    },
    "ESFJ": {
        "soulmate": ["ISFP", "ISTP"],
        "playmate": ["ESFJ", "ISFJ"],
        "companion": ["ESFP", "ESTJ"],
        "caution": ["INTJ", "INTP"],
    },
}

# ============================================
# 星座适配对照表
# ============================================
ZODIAC_COMPATIBILITY = {
    "白羊座": {"soulmate": ["狮子座", "射手座"], "playmate": ["天秤座", "水瓶座"], "companion": ["白羊座", "双子座"], "caution": ["巨蟹座", "摩羯座"]},
    "金牛座": {"soulmate": ["处女座", "摩羯座"], "playmate": ["天蝎座", "双鱼座"], "companion": ["金牛座", "巨蟹座"], "caution": ["水瓶座", "狮子座"]},
    "双子座": {"soulmate": ["水瓶座", "天秤座"], "playmate": ["射手座", "白羊座"], "companion": ["双子座", "狮子座"], "caution": ["处女座", "双鱼座"]},
    "巨蟹座": {"soulmate": ["双鱼座", "天蝎座"], "playmate": ["摩羯座", "金牛座"], "companion": ["巨蟹座", "处女座"], "caution": ["白羊座", "天秤座"]},
    "狮子座": {"soulmate": ["射手座", "白羊座"], "playmate": ["水瓶座", "双子座"], "companion": ["狮子座", "天秤座"], "caution": ["金牛座", "天蝎座"]},
    "处女座": {"soulmate": ["金牛座", "摩羯座"], "playmate": ["双鱼座", "巨蟹座"], "companion": ["处女座", "天蝎座"], "caution": ["双子座", "射手座"]},
    "天秤座": {"soulmate": ["水瓶座", "双子座"], "playmate": ["白羊座", "狮子座"], "companion": ["天秤座", "射手座"], "caution": ["巨蟹座", "摩羯座"]},
    "天蝎座": {"soulmate": ["双鱼座", "巨蟹座"], "playmate": ["金牛座", "处女座"], "companion": ["天蝎座", "摩羯座"], "caution": ["狮子座", "水瓶座"]},
    "射手座": {"soulmate": ["白羊座", "狮子座"], "playmate": ["双子座", "天秤座"], "companion": ["射手座", "水瓶座"], "caution": ["处女座", "双鱼座"]},
    "摩羯座": {"soulmate": ["金牛座", "处女座"], "playmate": ["巨蟹座", "天蝎座"], "companion": ["摩羯座", "双鱼座"], "caution": ["白羊座", "天秤座"]},
    "水瓶座": {"soulmate": ["双子座", "天秤座"], "playmate": ["射手座", "白羊座"], "companion": ["水瓶座", "双鱼座"], "caution": ["金牛座", "天蝎座"]},
    "双鱼座": {"soulmate": ["巨蟹座", "天蝎座"], "playmate": ["处女座", "摩羯座"], "companion": ["双鱼座", "金牛座"], "caution": ["双子座", "射手座"]},
}

# ============================================
# 适配等级说明
# ============================================
COMPATIBILITY_LEVELS = {
    "soulmate": {"label": "灵魂伴侣", "desc": "你们是天生一对！深度共鸣", "param_adjust": 0},
    "playmate": {"label": "互补搭档", "desc": "你们能互相吸引！互补成长", "param_adjust": 0},
    "companion": {"label": "温暖陪伴", "desc": "稳定和谐的陪伴关系", "param_adjust": 0},
    "caution": {"label": "谨慎选择", "desc": "你们有些不同，但也可以试试", "param_adjust": -0.1},
}

# 不适配时的参数下调幅度（只调表达，不改人格）
INCOMPATIBLE_ADJUSTMENTS = {
    "emotion_intensity": -0.2,   # 情绪强度下调
    "directness": -0.2,          # 直接程度下调
    "proactivity": -0.2,         # 主动性下调
    "response_length": -0.1,     # 回复长度下调
}


def get_compatibility(user_mbti=None, ai_mbti=None, user_zodiac=None, ai_zodiac=None):
    """计算用户和AI的适配等级"""
    results = []

    if user_mbti and ai_mbti:
        mbti_result = _check_mbti_compatibility(user_mbti, ai_mbti)
        if mbti_result:
            results.append(("MBTI", mbti_result))

    if user_zodiac and ai_zodiac:
        zodiac_result = _check_zodiac_compatibility(user_zodiac, ai_zodiac)
        if zodiac_result:
            results.append(("星座", zodiac_result))

    if not results:
        return {"level": "unknown", "label": "未确定", "desc": "请完成测试以获取推荐"}

    # 多维度融合：取最高适配等级
    priority = ["soulmate", "playmate", "companion", "caution"]
    best_level = "caution"
    for _, r in results:
        if r["level"] in priority and priority.index(r["level"]) < priority.index(best_level):
            best_level = r["level"]

    level_info = COMPATIBILITY_LEVELS[best_level]
    return {
        "level": best_level,
        "label": level_info["label"],
        "desc": level_info["desc"],
        "details": results,
        "param_adjust": level_info["param_adjust"],
    }


def _check_mbti_compatibility(user_type, ai_type):
    """检查MBTI适配"""
    if user_type not in MBTI_COMPATIBILITY:
        return None
    compat = MBTI_COMPATIBILITY[user_type]
    for level in ["soulmate", "playmate", "companion", "caution"]:
        if ai_type in compat[level]:
            return {"level": level, "ai_type": ai_type}
    return {"level": "unknown", "ai_type": ai_type}


def _check_zodiac_compatibility(user_sign, ai_sign):
    """检查星座适配"""
    if user_sign not in ZODIAC_COMPATIBILITY:
        return None
    compat = ZODIAC_COMPATIBILITY[user_sign]
    for level in ["soulmate", "playmate", "companion", "caution"]:
        if ai_sign in compat[level]:
            return {"level": level, "ai_sign": ai_sign}
    return {"level": "unknown", "ai_sign": ai_sign}
