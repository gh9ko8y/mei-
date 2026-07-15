"""重新上传数据库模块"""
import paramiko
import os

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 清空远程数据库目录
ssh.exec_command('rm -rf /opt/aria/src/database/*')

# 上传所有Python文件
local_db = 'D:\\Aria\\src\\database'
remote_db = '/opt/aria/src/database'

# 确保远程目录存在
ssh.exec_command(f'mkdir -p {remote_db}')

# 上传文件
for f in os.listdir(local_db):
    if f.endswith('.py'):
        local_path = os.path.join(local_db, f)
        remote_path = f'{remote_db}/{f}'
        
        sftp = ssh.open_sftp()
        sftp.put(local_path, remote_path)
        sftp.close()
        
        print(f'上传: {f}')

# 验证上传
stdin, stdout, stderr = ssh.exec_command(f'ls -la {remote_db}')
print('上传结果:', stdout.read().decode())

# 重启服务
ssh.exec_command('pkill -f "uvicorn src.main"')
import time
time.sleep(2)
ssh.exec_command('cd /opt/aria && /opt/miniconda/envs/aria/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 4360 > /tmp/aria.log 2>&1 &')

print('服务重启中...')
time.sleep(8)

# 检查状态
stdin, stdout, stderr = ssh.exec_command('netstat -tlnp | grep 4360')
print('端口状态:', stdout.read().decode())

ssh.close()
