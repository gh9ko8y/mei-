"""检查邮件发送日志"""
import paramiko

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 检查日志
stdin, stdout, stderr = ssh.exec_command('tail -20 /tmp/aria.log')
print(stdout.read().decode())

ssh.close()
