"""迁移Companion AI数据到Aria"""
import sqlite3
import json
import sys
from datetime import datetime

# 数据库路径
COMPANION_DB = 'D:\\Aria\\companion_backup.db'

def migrate_data():
    """迁移聊天记录到Aria"""
    
    # 连接Companion AI数据库
    conn = sqlite3.connect(COMPANION_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 读取聊天记录
    cursor.execute("""
        SELECT content, role, created_at, session_id 
        FROM chat_messages 
        WHERE msg_type = 'text'
        ORDER BY created_at
    """)
    messages = cursor.fetchall()
    
    print(f'找到 {len(messages)} 条聊天记录')
    
    # 转换为Aria格式
    aria_messages = []
    for msg in messages:
        # 转换时间戳
        try:
            created_at = datetime.fromtimestamp(msg['created_at'])
        except:
            created_at = datetime.now()
        
        aria_msg = {
            'user_id': 1,  # 默认用户ID
            'role': msg['role'],
            'content': msg['content'],
            'content_type': 'text',
            'valid_start': created_at.isoformat(),
            'is_valid': 1,
            'session_id': msg['session_id'] or 'default'
        }
        aria_messages.append(aria_msg)
    
    # 保存为JSON文件
    output_file = 'D:\\Aria\\migration_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(aria_messages, f, ensure_ascii=False, indent=2)
    
    print(f'数据已转换并保存到: {output_file}')
    print(f'共 {len(aria_messages)} 条消息')
    
    # 显示前5条预览
    print('\n前5条消息预览:')
    for i, msg in enumerate(aria_messages[:5]):
        try:
            content = msg["content"][:50]
            print(f'{i+1}. [{msg["role"]}] {content}...')
        except:
            print(f'{i+1}. [{msg["role"]}] (内容包含特殊字符)')
    
    conn.close()
    return aria_messages

if __name__ == '__main__':
    messages = migrate_data()
