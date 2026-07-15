"""启动服务器"""
import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('8.130.32.219', username='root', password='baiSHU159632', timeout=15)
print("连接成功")

REMOTE_DIR = '/opt/aria'
PYTHON = '/opt/miniconda/envs/aria/bin/python'

def run(cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

# 杀掉旧进程
print("停止旧服务...")
run("pkill -f uvicorn 2>/dev/null")
time.sleep(1)

# 创建启动脚本
print("创建启动脚本...")
start_script = f"""#!/bin/bash
cd {REMOTE_DIR}
{PYTHON} -m uvicorn src.main:app --host 0.0.0.0 --port 8000 > aria.log 2>&1
"""
sftp = ssh.open_sftp()
with sftp.open('/tmp/start_aria.sh', 'w') as f:
    f.write(start_script)
sftp.close()
run("chmod +x /tmp/start_aria.sh")

# 启动（不等待输出）
print("启动服务...")
ssh.exec_command("nohup /tmp/start_aria.sh &")
time.sleep(4)

# 健康检查
print("健康检查...")
out, err = run("curl -s http://localhost:8000/health", timeout=15)
print(f"结果: {out}")

# 日志
print("\n服务日志:")
out, _ = run(f"tail -15 {REMOTE_DIR}/aria.log")
print(out)

ssh.close()
print("\n完成！访问: http://8.130.32.219:8000")
