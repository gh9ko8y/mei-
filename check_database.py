"""检查数据库模块"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 检查数据库目录
stdin, stdout, stderr = ssh.exec_command('ls /opt/aria/src/database/ 2>/dev/null || echo "目录不存在"')
print('database目录:', stdout.read().decode())

# 检查本地src目录
import os
local_src = 'D:\\Aria\\src'
print('本地src目录:', os.listdir(local_src))

ssh.close()
