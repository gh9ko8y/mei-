"""安装依赖并重启服务"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 安装依赖
print('安装依赖...')
ssh.exec_command('/opt/miniconda/envs/aria/bin/pip install sqlalchemy httpx pydantic python-jose passlib python-multipart > /tmp/pip_install.log 2>&1')

import time
time.sleep(30)

# 检查安装结果
stdin, stdout, stderr = ssh.exec_command('tail -10 /tmp/pip_install.log')
print('安装日志:', stdout.read().decode())

# 重启服务
ssh.exec_command('pkill -f "uvicorn src.main"')
time.sleep(2)
ssh.exec_command('cd /opt/aria && /opt/miniconda/envs/aria/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 4360 > /tmp/aria.log 2>&1 &')

print('服务重启中...')
time.sleep(8)

# 检查状态
stdin, stdout, stderr = ssh.exec_command('netstat -tlnp | grep 4360')
print('端口状态:', stdout.read().decode())

# 检查日志
stdin, stdout, stderr = ssh.exec_command('tail -5 /tmp/aria.log')
print('日志:', stdout.read().decode())

ssh.close()
