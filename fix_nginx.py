"""配置nginx反向代理"""
import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('8.130.32.219', username='root', password='baiSHU159632', timeout=15)

def run(cmd, timeout=15):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='replace').strip()

# 1. 找nginx配置目录
print("=== nginx配置 ===")
out = run("ls /etc/nginx/conf.d/ 2>/dev/null || echo no_conf_d")
print(f"conf.d: {out}")

out = run("ls /www/server/panel/vhost/nginx/ 2>/dev/null || echo no_bt")
print(f"宝塔: {out}")

# 2. 创建aria配置文件
print("\n=== 创建配置 ===")
config_content = """server {
    listen 80;
    server_name aria.vin www.aria.vin;

    location / {
        proxy_pass http://127.0.0.1:4360;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
"""

sftp = ssh.open_sftp()
try:
    with sftp.open('/etc/nginx/conf.d/aria.conf', 'w') as f:
        f.write(config_content)
    print("配置文件写入成功")
except Exception as e:
    print(f"写入失败: {e}")
    # 尝试宝塔目录
    try:
        with sftp.open('/www/server/panel/vhost/nginx/aria.conf', 'w') as f:
            f.write(config_content)
        print("配置文件写入宝塔目录成功")
    except Exception as e2:
        print(f"宝塔目录也失败: {e2}")

sftp.close()

# 3. 测试nginx配置
print("\n=== 测试nginx ===")
out = run("nginx -t 2>&1")
print(f"nginx测试: {out}")

# 4. 重载nginx
out = run("nginx -s reload 2>&1")
print(f"nginx重载: {out}")

# 5. 测试本地访问
print("\n=== 测试本地 ===")
out = run("curl -s http://localhost:80/health 2>&1 | head -5")
print(f"80端口: {out}")

out = run("curl -s http://localhost:4360/health 2>&1")
print(f"4360端口: {out}")

ssh.close()
print("\n完成！")
