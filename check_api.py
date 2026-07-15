"""检查服务器MiMo API配置"""
import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('8.130.32.219', username='root', password='baiSHU159632', timeout=15)

def run(cmd, timeout=15):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='replace').strip(), stderr.read().decode('utf-8', errors='replace').strip()

# 检查.env
print("=== .env文件 ===")
out, _ = run("cat /opt/aria/.env")
print(out)

# 检查服务器能否访问MiMo API
print("\n=== MiMo API连通性测试 ===")
out, err = run("curl -s -o /dev/null -w '%{http_code}' https://token-plan-cn.xiaomimimo.com/v1/models -H 'Authorization: Bearer tp-czj4a4gymv87c5hxs3jxup1xaddn3vrzx0bv1yhqjrvicbw1'", timeout=15)
print(f"HTTP状态码: {out}")

# 检查服务器网络
print("\n=== 服务器网络 ===")
out, _ = run("curl -s ifconfig.me")
print(f"服务器公网IP: {out}")

# 测试本地MiMo API调用
print("\n=== 本地MiMo API测试 ===")
test_cmd = "/opt/miniconda/envs/aria/bin/python -c \"import httpx; r = httpx.post('https://token-plan-cn.xiaomimimo.com/v1/chat/completions', headers={'Authorization': 'Bearer tp-czj4a4gymv87c5hxs3jxup1xaddn3vrzx0bv1yhqjrvicbw1', 'Content-Type': 'application/json'}, json={'model': 'mimo-v2.5-pro', 'messages': [{'role': 'user', 'content': 'hello'}], 'max_tokens': 50}, timeout=30); print(r.status_code, r.text[:200])\""
out, err = run(test_cmd, timeout=30)
print(f"API调用结果: {out}")
if err:
    print(f"错误: {err}")

ssh.close()
