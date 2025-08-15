@echo off
cd /d "%~dp0"
echo Starting HTTP server on port 8080...
python -m http.server 8080
pause
