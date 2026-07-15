"""从正确目录启动服务"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 先停止旧服务
ssh.exec_command('pkill -f "uvicorn src.main"')
import time
time.sleep(2)

# 从正确目录启动
ssh.exec_command('cd /opt/aria && /opt/miniconda/envs/aria/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 4360 > /tmp/aria.log 2>&1 &')

print('服务启动中...')
time.sleep(8)

# 检查端口
stdin, stdout, stderr = ssh.exec_command('netstat -tlnp | grep 4360')
print('端口状态:', stdout.read().decode())

# 检查日志
stdin, stdout, stderr = ssh.exec_command('tail -20 /tmp/aria.log')
print('日志:', stdout.read().decode())

ssh.close()
