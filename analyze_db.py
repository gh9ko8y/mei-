"""分析Companion AI数据库结构"""
import sqlite3

conn = sqlite3.connect('D:\\Aria\\companion_backup.db')
cursor = conn.cursor()

# 获取所有表
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('数据库表:', [t[0] for t in tables])

# 查看每个表的结构和数据量
for table in tables:
    table_name = table[0]
    cursor.execute(f'PRAGMA table_info({table_name})')
    columns = cursor.fetchall()
    cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
    count = cursor.fetchone()[0]
    print(f'\n{table_name} ({count}条记录):')
    for col in columns:
        print(f'  {col[1]} ({col[2]})')

conn.close()
