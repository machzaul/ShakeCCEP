@echo off
TITLE Coca-Cola Shake Shake - Stop Services
color 0F

echo Stopping Coca-Cola Shake Shake background processes...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo Done! All services stopped.
pause

