"""查看Aria数据库结构"""
import sqlite3

# 尝试查找Aria数据库
import os
db_paths = [
    'D:\\Aria\\aria.db',
    'D:\\Aria\\data\\aria.db',
    'D:\\Aria\\src\\database\\aria.db',
]

for path in db_paths:
    if os.path.exists(path):
        print(f'找到数据库: {path}')
        conn = sqlite3.connect(path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print('表:', [t[0] for t in tables])
        conn.close()
        break
else:
    print('未找到Aria数据库')
    print('当前目录:', os.listdir('D:\\Aria'))
