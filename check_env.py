"""检查环境变量"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 检查环境变量
stdin, stdout, stderr = ssh.exec_command('env | grep EMAIL')
print('EMAIL环境变量:', stdout.read().decode())

# 检查.env文件
stdin, stdout, stderr = ssh.exec_command('cat /opt/aria/.env 2>/dev/null || echo .env文件不存在')
print('.env文件:', stdout.read().decode())

ssh.close()
