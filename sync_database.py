"""同步数据库模块到服务器"""
import paramiko
import os

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 上传database目录
local_db = 'D:\\Aria\\src\\database'
remote_db = '/opt/aria/src/database'

# 创建远程目录
ssh.exec_command(f'mkdir -p {remote_db}')

# 上传所有Python文件
for root, dirs, files in os.walk(local_db):
    for f in files:
        if f.endswith('.py'):
            local_path = os.path.join(root, f)
            remote_path = os.path.join(remote_db, os.path.relpath(local_path, local_db))
            
            # 创建远程子目录
            remote_dir = os.path.dirname(remote_path)
            ssh.exec_command(f'mkdir -p {remote_dir}')
            
            # 上传文件
            sftp = ssh.open_sftp()
            sftp.put(local_path, remote_path)
            sftp.close()
            
            print(f'上传: {f}')

print('数据库模块上传完成')

# 重启服务
ssh.exec_command('pkill -f "uvicorn src.main"')
import time
time.sleep(2)
ssh.exec_command('cd /opt/aria && /opt/miniconda/envs/aria/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 4360 > /tmp/aria.log 2>&1 &')

print('服务重启中...')
time.sleep(5)

# 检查服务状态
stdin, stdout, stderr = ssh.exec_command('netstat -tlnp | grep 4360')
print('端口状态:', stdout.read().decode())

ssh.close()
