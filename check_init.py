"""检查数据库模块"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 检查数据库模块内容
stdin, stdout, stderr = ssh.exec_command('cat /opt/aria/src/database/__init__.py')
print('__init__.py内容:', stdout.read().decode())

# 检查connection.py
stdin, stdout, stderr = ssh.exec_command('head -30 /opt/aria/src/database/connection.py')
print('connection.py前30行:', stdout.read().decode())

ssh.close()
