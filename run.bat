@echo off
echo Starting MirrorMed Backend...
start cmd /k "cd backend && venv\Scripts\python.exe main.py"

echo Starting MirrorMed Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting up in separate windows.
echo Backend API will be at: http://127.0.0.1:8000
echo Frontend UI will be at: http://localhost:3000
