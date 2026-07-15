"""部署Aria到远程服务器"""
import paramiko
import os
import zipfile
from pathlib import Path

# 服务器配置
SERVER = "8.130.32.219"
USER = "root"
PASSWORD = "baiSHU159632"
REMOTE_DIR = "/opt/aria"
LOCAL_DIR = r"D:\Aria"

def create_zip():
    """打包项目文件"""
    zip_path = os.path.join(LOCAL_DIR, "aria_deploy.zip")
    exclude = {'.env', '__pycache__', '*.pyc', '.git', 'test_*.py', 
               'daily_research.py', '启动调研.py', '*.docx', '*.md',
               'daily_reports', 'mimo-pet', 'MAGMA'}

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(LOCAL_DIR):
            # 跳过排除的目录
            dirs[:] = [d for d in dirs if d not in exclude and not d.startswith('.')]
            for f in files:
                if f.endswith(('.pyc', '.zip', '.docx', '.md')):
                    continue
                if f.startswith('test_') and f != 'test_api.py':
                    continue
                filepath = os.path.join(root, f)
                arcname = os.path.relpath(filepath, LOCAL_DIR)
                zf.write(filepath, arcname)

    print(f"打包完成: {zip_path}")
    return zip_path

import sys

def deploy():
    """部署到服务器"""
    sys.stdout.reconfigure(encoding='utf-8')

    # 1. 打包
    zip_path = create_zip()

    # 2. 连接服务器
    print(f"连接服务器 {SERVER}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)
    print("连接成功")

    # 3. 创建远程目录
    print(f"创建远程目录 {REMOTE_DIR}...")
    ssh.exec_command(f"mkdir -p {REMOTE_DIR}")

    # 4. 上传文件
    print("上传文件...")
    sftp = ssh.open_sftp()
    remote_zip = f"{REMOTE_DIR}/aria_deploy.zip"
    sftp.put(zip_path, remote_zip)
    print(f"上传完成: {remote_zip}")

    # 5. 解压
    print("解压文件...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {REMOTE_DIR} && unzip -o aria_deploy.zip")
    out = stdout.read().decode('utf-8', errors='replace')
    print(out[:500] if len(out) > 500 else out)

    # 6. 安装依赖
    print("安装依赖...")
    stdin, stdout, stderr = ssh.exec_command(
        f"cd {REMOTE_DIR} && pip3 install -r requirements.txt 2>&1 | tail -5"
    )
    out = stdout.read().decode('utf-8', errors='replace')
    print(out)

    # 7. 创建.env文件
    print("创建.env文件...")
    env_content = (
        "MIMO_API_KEY=tp-czj4a4gymv87c5hxs3jxup1xaddn3vrzx0bv1yhqjrvicbw1\n"
        "MIMO_API_BASE=https://token-plan-cn.xiaomimimo.com/v1\n"
        "JWT_SECRET=aria-jwt-secret-2026\n"
        "DATABASE_URL=postgresql://localhost:5432/aria\n"
    )
    sftp.close()

    # 写入.env
    ssh.exec_command(f"cat > {REMOTE_DIR}/.env << 'ENVEOF'\n{env_content}ENVEOF")

    # 8. 启动服务
    print("启动服务...")
    ssh.exec_command(
        f"cd {REMOTE_DIR} && nohup python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 > aria.log 2>&1 &"
    )

    # 9. 验证
    import time
    time.sleep(3)
    stdin, stdout, stderr = ssh.exec_command(f"curl -s http://localhost:8000/health")
    result = stdout.read().decode('utf-8', errors='replace')
    print(f"健康检查: {result}")

    ssh.close()
    print(f"\n部署完成！访问地址: http://{SERVER}:8000")

if __name__ == "__main__":
    deploy()
