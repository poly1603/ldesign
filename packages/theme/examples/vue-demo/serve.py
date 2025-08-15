#!/usr/bin/env python3
"""
简单的 HTTP 服务器，用于测试 Vue Demo 项目
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# 设置端口
PORT = 3000

# 获取当前目录
current_dir = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=current_dir, **kwargs)
    
    def end_headers(self):
        # 添加 CORS 头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def guess_type(self, path):
        # 为 .js 文件设置正确的 MIME 类型
        mimetype, encoding = super().guess_type(path)
        if path.endswith('.js'):
            return 'application/javascript', encoding
        return mimetype, encoding

def main():
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🎨 LDesign Theme Vue Demo")
            print(f"🚀 服务器启动在 http://localhost:{PORT}")
            print(f"📁 服务目录: {current_dir}")
            print(f"⏹️  按 Ctrl+C 停止服务器")
            print("-" * 50)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {PORT} 已被占用，请尝试其他端口")
        else:
            print(f"❌ 启动服务器时出错: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
