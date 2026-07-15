import sqlite3
import json
from datetime import datetime

DB_PATH = "/opt/aria/data/aria.db"
CHAT_PATH = "/opt/aria/data/linxi_messages.json"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# 创建聊天历史表
cursor.execute("""
CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text',
    session_id TEXT DEFAULT 'wechat_history',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# 读取微信聊天记录
with open(CHAT_PATH, 'r', encoding='utf-8') as f:
    messages = json.load(f)

print(f'读取到 {len(messages)} 条消息')

# 导入消息
count = 0
for msg in messages:
    text = msg.get('text', '')
    if not text:
        continue
    
    # 根据内容判断角色（简单规则：包含"林晞"的是AI）
    if '林晞' in text or text.startswith('['):
        role = 'assistant'
    else:
        role = 'user'
    
    cursor.execute(
        'INSERT INTO chat_history (user_id, role, content, content_type, session_id) VALUES (?, ?, ?, ?, ?)',
        (1, role, text, 'text', 'wechat_history')
    )
    count += 1

conn.commit()
conn.close()
print(f'成功导入 {count} 条聊天记录')
