"""批量上传前端文件"""
import paramiko
import os
from pathlib import Path

SERVER = '8.130.32.219'
USER = 'root'
PASSWORD = 'baiSHU159632'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=15)

# 清空旧文件
ssh.exec_command('rm -rf /var/www/aria-web/*')

# 上传CSS文件
local_css = r'D:\Aria\aria-web\out\_next\static\chunks\3qwok-oohamno.css'
remote_css = '/var/www/aria-web/_next/static/chunks/3qwok-oohamno.css'

sftp = ssh.open_sftp()
sftp.mkdir('/var/www/aria-web/_next')
sftp.mkdir('/var/www/aria-web/_next/static')
sftp.mkdir('/var/www/aria-web/_next/static/chunks')
sftp.put(local_css, remote_css)
sftp.close()

print('CSS文件已上传')

# 上传其他必要文件
local_out = Path(r'D:\Aria\aria-web\out')
remote_base = '/var/www/aria-web'

# 上传HTML文件
for html_file in ['index.html', 'login.html', 'settings.html', '404.html']:
    local_path = local_out / html_file
    if local_path.exists():
        sftp = ssh.open_sftp()
        sftp.put(str(local_path), f'{remote_base}/{html_file}')
        sftp.close()
        print(f'上传: {html_file}')

# 上传JS文件
for js_file in (local_out / '_next' / 'static' / 'chunks').glob('*.js'):
    sftp = ssh.open_sftp()
    sftp.put(str(js_file), f'{remote_base}/_next/static/chunks/{js_file.name}')
    sftp.close()

print('所有文件已上传')

# 验证
stdin, stdout, stderr = ssh.exec_command('ls /var/www/aria-web/_next/static/chunks/')
print('chunks目录:', stdout.read().decode()[:500])

ssh.close()
