"""同步所有Python模块到服务器"""
import paramiko
import os

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 上传所有模块
local_src = 'D:\\Aria\\src'
remote_src = '/opt/aria/src'

# 需要上传的模块
modules = ['auth', 'database', 'embedding', 'emotion', 'graph', 'image_gen', 
           'memory', 'personality', 'retention', 'retrieval', 'stickers', 'tts']

for module in modules:
    local_dir = os.path.join(local_src, module)
    remote_dir = f'{remote_src}/{module}'
    
    if os.path.exists(local_dir):
        # 创建远程目录
        ssh.exec_command(f'mkdir -p {remote_dir}')
        
        # 上传所有Python文件
        for f in os.listdir(local_dir):
            if f.endswith('.py'):
                local_path = os.path.join(local_dir, f)
                remote_path = f'{remote_dir}/{f}'
                
                sftp = ssh.open_sftp()
                sftp.put(local_path, remote_path)
                sftp.close()
                
        print(f'上传模块: {module}')

# 上传main.py和mimo_client.py
for f in ['main.py', 'mimo_client.py', '__init__.py']:
    local_path = os.path.join(local_src, f)
    remote_path = f'{remote_src}/{f}'
    if os.path.exists(local_path):
        sftp = ssh.open_sftp()
        sftp.put(local_path, remote_path)
        sftp.close()
        print(f'上传: {f}')

print('所有模块上传完成')

# 重启服务
ssh.exec_command('pkill -f "uvicorn src.main"')
import time
time.sleep(2)
ssh.exec_command('cd /opt/aria && /opt/miniconda/envs/aria/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 4360 > /tmp/aria.log 2>&1 &')

print('服务重启中...')
time.sleep(10)

# 检查状态
stdin, stdout, stderr = ssh.exec_command('netstat -tlnp | grep 4360')
print('端口状态:', stdout.read().decode())

ssh.close()
