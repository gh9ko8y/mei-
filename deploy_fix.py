"""修复服务器部署"""
import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

SERVER = "8.130.32.219"
USER = "root"
PASSWORD = "baiSHU159632"
REMOTE_DIR = "/opt/aria"
PYTHON = "/opt/miniconda/envs/aria/bin/python"
PIP = "/opt/miniconda/envs/aria/bin/pip"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)
print("连接成功")

def run(cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

# 1. 安装依赖
print("\n=== 安装依赖 ===")
out, err = run(f"{PIP} install fastapi uvicorn httpx pydantic 2>&1 | tail -5")
print(out or err)

# 2. 验证FastAPI
print("\n=== 验证FastAPI ===")
out, err = run(f'{PYTHON} -c "import fastapi; print(fastapi.__version__)"')
print(f"FastAPI: {out or err}")

# 3. 修复.env文件
print("\n=== 创建.env ===")
env_content = "MIMO_API_KEY=tp-czj4a4gymv87c5hxs3jxup1xaddn3vrzx0bv1yhqjrvicbw1\\nMIMO_API_BASE=https://token-plan-cn.xiaomimimo.com\\n"
run(f'echo -e "{env_content}" > {REMOTE_DIR}/.env')
out, _ = run(f"cat {REMOTE_DIR}/.env")
print(f".env内容: {out[:100]}...")

# 4. 测试导入
print("\n=== 测试项目导入 ===")
test_cmd = f'cd {REMOTE_DIR} && {PYTHON} -c "import sys; sys.path.insert(0, \\\".\\\"); from src.personality import PersonalityCore; print(\\\"人格模块导入成功\\\")"'
out, err = run(test_cmd)
print(f"导入测试: {out or err}")

# 5. 启动服务
print("\n=== 启动服务 ===")
# 先杀掉旧进程
run("pkill -f uvicorn 2>/dev/null")
import time
time.sleep(1)

# 用screen启动服务（不会阻塞）
run(f"screen -dmS aria bash -c 'cd {REMOTE_DIR} && {PYTHON} -m uvicorn src.main:app --host 0.0.0.0 --port 8000 2>&1 | tee aria.log'")
time.sleep(3)

# 6. 健康检查
print("\n=== 健康检查 ===")
out, err = run("curl -s http://localhost:8000/health", timeout=30)
print(f"健康检查: {out}")

# 7. 检查日志
print("\n=== 服务日志 ===")
out, err = run(f"tail -10 {REMOTE_DIR}/aria.log")
print(out)

ssh.close()
print("\n部署完成！")
