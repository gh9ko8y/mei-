"""检查服务器前端文件"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 检查chunks目录
stdin, stdout, stderr = ssh.exec_command('ls /var/www/aria-web/_next/static/chunks/ 2>&1')
print('chunks目录内容:')
print(stdout.read().decode()[:1000])

# 检查是否有CSS文件
stdin, stdout, stderr = ssh.exec_command('ls /var/www/aria-web/_next/static/chunks/*.css 2>&1')
print('CSS文件:', stdout.read().decode())

ssh.close()
