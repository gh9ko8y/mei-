"""Aria每日调研 - 双击运行"""
import subprocess
import sys
import os

os.chdir(r"D:\Aria")
print("正在启动调研脚本...")
subprocess.run([sys.executable, r"D:\Aria\daily_research.py"])
input("\n按回车键关闭...")
