"""检查服务器状态"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 检查目录结构
stdin, stdout, stderr = ssh.exec_command('ls /opt/aria/src/')
print('src目录:', stdout.read().decode())

# 检查main.py的导入
stdin, stdout, stderr = ssh.exec_command('head -30 /opt/aria/src/main.py')
print('main.py前30行:', stdout.read().decode())

ssh.close()
