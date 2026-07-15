"""微信聊天记录导入到Aria"""
import json
import sqlite3
from datetime import datetime

# 读取微信聊天记录
with open('D:\\Aria\\linxi_messages.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

print(f'读取到 {len(messages)} 条微信消息')

# 转换为Aria格式并保存到数据库
db_path = 'D:\\Aria\\data\\aria.db'  # 本地测试用
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 创建用户（如果不存在）
cursor.execute("INSERT OR IGNORE INTO users (username, nickname, created_at) VALUES (?, ?, ?)",
               ('admin', '管理员', datetime.now().isoformat()))
user_id = cursor.lastrowid or 1

# 导入消息
count = 0
for msg in messages:
    # 解析时间
    try:
        date_str = msg.get('date', '')
        time_str = msg.get('time', '00:00:00')
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")
    except:
        dt = datetime.now()
    
    # 判断消息来源（简单的启发式）
    text = msg.get('text', '')
    if text.startswith('林晞') or text.startswith('[林晞]'):
        role = 'assistant'
        content = text.replace('林晞', '').replace('[林晞]', '').strip()
    else:
        role = 'user'
        content = text
    
    cursor.execute("""
        INSERT INTO events (user_id, role, content, content_type, valid_start, txn_time, is_valid, session_id)
        VALUES (?, ?, ?, 'text', ?, ?, 1, 'wechat_history')
    """, (user_id, role, content, dt.isoformat(), datetime.now().isoformat()))
    count += 1

conn.commit()
conn.close()

print(f'成功导入 {count} 条微信消息到数据库')
