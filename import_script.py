import sqlite3

DB_PATH = "/opt/aria/data/aria.db"
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# 创建人格配置表
cursor.execute("""
CREATE TABLE IF NOT EXISTS personality_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT,
    mbti TEXT,
    zodiac TEXT,
    temperament TEXT,
    enneagram TEXT,
    system_prompt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# 插入管理员人格配置
cursor.execute(
    "INSERT OR REPLACE INTO personality_config (user_id, name, temperament, enneagram, system_prompt) VALUES (?, ?, ?, ?, ?)",
    (1, "AI伴侣", "phlegmatic", "9w1", "你是温暖体贴的AI伴侣，性格平和温柔，善于倾听，避免冲突。你有同理心，喜欢帮助别人，追求和谐。你有完美主义倾向，做事认真负责。")
)

conn.commit()
conn.close()
print("人格数据导入完成")
