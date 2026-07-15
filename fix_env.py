"""修复环境变量"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 更新.env文件
env_content = '''MIMO_API_KEY=tp-czj4a4gymv87c5hxs3jxup1xaddn3vrzx0bv1yhqjrvicbw1
MIMO_API_BASE=https://token-plan-cn.xiaomimimo.com/v1
EMAIL_PROVIDER=qq
EMAIL_USER=209684152@qq.com
EMAIL_PASSWORD=vpvayeqwyvwfcaib
'''

sftp = ssh.open_sftp()
with sftp.open('/opt/aria/.env', 'w') as f:
    f.write(env_content)
sftp.close()

# 更新启动脚本
start_script = '''#!/bin/bash
source /opt/aria/.env
cd /opt/aria
/opt/miniconda/envs/aria/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 4360
'''

sftp = ssh.open_sftp()
with sftp.open('/opt/aria/start.sh', 'w') as f:
    f.write(start_script)
sftp.close()

ssh.exec_command('chmod +x /opt/aria/start.sh')

# 重启服务
ssh.exec_command('pkill -f uvicorn')
import time
time.sleep(2)
ssh.exec_command('nohup /opt/aria/start.sh > /tmp/aria.log 2>&1 &')

print('环境变量已更新，服务重启中...')
time.sleep(8)

# 检查状态
stdin, stdout, stderr = ssh.exec_command('netstat -tlnp | grep 4360')
print('端口状态:', stdout.read().decode())

ssh.close()
