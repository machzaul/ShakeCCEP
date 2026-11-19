@echo off
TITLE Coca-Cola Shake Shake - Development Mode
color 0A

cd /d "%~dp0\.."

echo Starting Python BLE WebSocket bridge...
start cmd.exe /k "python python\ble_receiver.py"

echo Starting Next.js Dev Server...
cmd.exe /c "pnpm dev"

