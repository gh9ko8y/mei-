"""导入微信聊天记录到服务器"""
import paramiko
import json

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 创建data目录
ssh.exec_command('mkdir -p /opt/aria/data')

# 上传微信聊天记录
sftp = ssh.open_sftp()
sftp.put('D:\\Aria\\linxi_messages.json', '/opt/aria/data/linxi_messages.json')
sftp.close()

print('微信聊天记录已上传')

# 上传更新后的代码
sftp = ssh.open_sftp()
sftp.put('D:\\Aria\\src\\main.py', '/opt/aria/src/main.py')
sftp.put('D:\\Aria\\src\\auth\\email_verify.py', '/opt/aria/src/auth/email_verify.py')
sftp.put('D:\\Aria\\src\\auth\\models.py', '/opt/aria/src/auth/models.py')
sftp.close()

print('代码已上传')

# 重启服务
ssh.exec_command('pkill -f uvicorn')
import time
time.sleep(2)
ssh.exec_command('cd /opt/aria && /opt/miniconda/envs/aria/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 4360 > /tmp/aria.log 2>&1 &')

print('服务重启中...')
time.sleep(10)

# 检查状态
stdin, stdout, stderr = ssh.exec_command('netstat -tlnp | grep 4360')
print('端口状态:', stdout.read().decode())

ssh.close()
