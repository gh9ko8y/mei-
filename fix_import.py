"""修复导入问题"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 检查Python路径
stdin, stdout, stderr = ssh.exec_command('/opt/miniconda/envs/aria/bin/python -c "import sys; print(sys.path)"')
print('Python路径:', stdout.read().decode())

# 检查数据库模块
stdin, stdout, stderr = ssh.exec_command('/opt/miniconda/envs/aria/bin/python -c "from src.database import DatabaseManager; print(\\\"导入成功\\\")"')
print('导入测试:', stdout.read().decode())
print('错误:', stderr.read().decode())

ssh.close()
