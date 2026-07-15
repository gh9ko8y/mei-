"""初始化管理员人格数据"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'aria.db')

def init_admin_personality():
    """初始化管理员的人格配置"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 创建人格配置表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS personality_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT DEFAULT 'AI伴侣',
            gender TEXT DEFAULT 'female',
            mbti TEXT,
            zodiac TEXT,
            temperament TEXT,
            attachment TEXT,
            enneagram TEXT,
            values_json TEXT,
            system_prompt TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建聊天历史表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            content_type TEXT DEFAULT 'text',
            session_id TEXT DEFAULT 'default',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aria_id TEXT UNIQUE NOT NULL,
            username TEXT,
            nickname TEXT,
            password_hash TEXT NOT NULL,
            email TEXT,
            gender TEXT,
            birthday TEXT,
            bio TEXT,
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 插入管理员账号（如果不存在）
    import hashlib
    password_hash = hashlib.sha256('linxi2026'.encode()).hexdigest()
    
    cursor.execute('''
        INSERT OR IGNORE INTO users (aria_id, username, nickname, password_hash)
        VALUES (?, ?, ?, ?)
    ''', ('001', '百事非', '管理员', password_hash))
    
    # 插入管理员的人格配置（九型人格：和平型 + 助人型）
    cursor.execute('''
        INSERT OR REPLACE INTO personality_config 
        (user_id, name, gender, mbti, zodiac, temperament, attachment, enneagram, system_prompt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        1,  # user_id = 1 (管理员)
        'AI伴侣',
        'female',
        None,  # MBTI待设置
        None,  # 星座待设置
        'phlegmatic',  # 气质类型：抑郁质型
        None,  # 依恋类型待设置
        '9w1',  # 九型人格：和平型(9) + 完美型翼(1)
        '你是一个温暖体贴的AI伴侣，性格平和温柔，善于倾听，避免冲突。你有强烈的同理心，喜欢帮助别人，追求和谐。你有完美主义倾向，做事认真负责。'
    ))
    
    conn.commit()
    conn.close()
    print('管理员人格数据初始化完成')

if __name__ == '__main__':
    init_admin_personality()
