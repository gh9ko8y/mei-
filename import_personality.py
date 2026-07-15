"""导入人格数据到服务器"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 创建导入脚本
import_script = '''import sqlite3

DB_PATH = "/opt/aria/data/aria.db"
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute(
    "INSERT OR REPLACE INTO personality_config (user_id, name, temperament, enneagram, system_prompt) VALUES (?, ?, ?, ?, ?)",
    (1, "AI伴侣", "phlegmatic", "9w1", "你是温暖体贴的AI伴侣，性格平和温柔，善于倾听，避免冲突。你有同理心，喜欢帮助别人，追求和谐。你有完美主义倾向，做事认真负责。")
)

conn.commit()
conn.close()
print("人格数据导入完成")
'''

# 写入脚本
sftp = ssh.open_sftp()
with sftp.open('/tmp/import_personality.py', 'w') as f:
    f.write(import_script)
sftp.close()

# 执行脚本
stdin, stdout, stderr = ssh.exec_command('cd /opt/aria && /opt/miniconda/envs/aria/bin/python /tmp/import_personality.py')
print('人格导入:', stdout.read().decode())
print('错误:', stderr.read().decode()[:500])

ssh.close()
"