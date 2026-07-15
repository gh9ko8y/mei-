"""删除旧聊天记录"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 删除所有聊天记录
cmd = '''
cd /opt/aria && /opt/miniconda/envs/aria/bin/python -c "
from sqlalchemy import text
from src.database.connection import DatabaseManager
db = DatabaseManager()
with db.get_session() as session:
    session.execute(text('DELETE FROM events'))
    session.commit()
    print('deleted')
"
'''
stdin, stdout, stderr = ssh.exec_command(cmd)
print(stdout.read().decode())
print(stderr.read().decode())

ssh.close()
