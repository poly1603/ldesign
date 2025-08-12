#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse

PORT = 3001

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def guess_type(self, path):
        mimetype = super().guess_type(path)
        if path.endswith('.mjs'):
            return 'text/javascript'
        return mimetype

def main():
    # 切换到当前目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 开发服务器启动成功！")
        print(f"📱 本地访问: http://localhost:{PORT}")
        print(f"🌐 演示页面: http://localhost:{PORT}/demo.html")
        print(f"\n按 Ctrl+C 停止服务器")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n正在关闭服务器...")
            httpd.shutdown()
            print("服务器已关闭")

if __name__ == "__main__":
    main()
