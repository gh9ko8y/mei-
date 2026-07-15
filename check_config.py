"""检查配置文件"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 检查配置文件
stdin, stdout, stderr = ssh.exec_command('cat /opt/aria/config/default.json')
print('配置文件:', stdout.read().decode())

ssh.close()
