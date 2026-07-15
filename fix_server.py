"""修复服务器端口"""
import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('8.130.32.219', username='root', password='baiSHU159632', timeout=15)

def run(cmd, timeout=15):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='replace').strip()

REMOTE_DIR = '/opt/aria'
PYTHON = '/opt/miniconda/envs/aria/bin/python'

# 1. 修复启动脚本为4360端口
print("=== 修复启动脚本 ===")
sftp = ssh.open_spatible = ssh.open_sftp()
with sftp.open('/tmp/start_aria.sh', 'w') as f:
    f.write(f'#!/bin/bash\ncd {REMOTE_DIR}\n{PYTHON} -m uvicorn src.main:app --host 0.0.0.0 --port 4360 2>&1 | tee aria.log\n')
sftp.close()
run('chmod +x /tmp/start_aria.sh')
print("启动脚本已修复为4360端口")

# 2. 停旧进程
print("\n=== 停旧进程 ===")
run("pkill -f 'uvicorn.*4360' 2>/dev/null")
time.sleep(1)

# 3. 启动新服务
print("=== 启动服务 ===")
ssh.exec_command('nohup /tmp/start_aria.sh &')
time.sleep(5)

# 4. 测试
print("\n=== 测试 ===")
out = run("curl -s http://localhost:4360/health", timeout=10)
print(f"4360端口: {out}")

out = run("curl -s http://localhost:80/health", timeout=10)
print(f"80端口: {out[:100]}")

# 5. 检查进程
out = run("ps aux | grep uvicorn | grep -v grep")
print(f"进程: {out}")

ssh.close()
print("\n完成！")
