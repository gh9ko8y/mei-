"""分析微信聊天记录"""
import json

with open('D:\\Aria\\linxi_messages.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('文件类型:', type(data))
if isinstance(data, list):
    print('数据条数:', len(data))
    if len(data) > 0:
        print('第一条:', json.dumps(data[0], ensure_ascii=False)[:500])
        print('最后一条:', json.dumps(data[-1], ensure_ascii=False)[:500])
elif isinstance(data, dict):
    print('数据键:', list(data.keys()))
