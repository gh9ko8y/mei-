"""检查数据库"""
import sqlite3

conn = sqlite3.connect('D:\\Aria\\data\\aria.db')
cursor = conn.cursor()

# 检查表
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('表:', cursor.fetchall())

# 检查管理员
cursor.execute('SELECT * FROM users WHERE aria_id = ?', ('001',))
user = cursor.fetchone()
print('管理员:', user)

# 检查人格配置
cursor.execute('SELECT * FROM personality_config WHERE user_id = ?', (1,))
config = cursor.fetchone()
print('人格配置:', config)

conn.close()
