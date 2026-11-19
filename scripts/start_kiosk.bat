@echo off
TITLE Coca-Cola Shake Shake - Kiosk Launcher
color 0C

echo =======================================================
echo     COCA-COLA SHAKE SHAKE - OFFLINE KIOSK LAUNCHER
echo =======================================================
echo.

cd /d "%~dp0\.."

:: 1. Launch Python BLE Receiver & Local WebSocket Bridge
echo [1/3] Starting Python BLE Receiver and WebSocket Bridge (port 8765)...
start /b "" python python\ble_receiver.py

:: 2. Launch Local Next.js Application Server
echo [2/3] Starting Next.js Production Server (port 3000)...
start /b "" cmd.exe /c "pnpm start"

:: Wait 4 seconds for services to initialize
timeout /t 4 /nobreak >nul

:: 3. Launch Chrome / Edge in Fullscreen Kiosk Mode
echo [3/3] Launching Fullscreen Kiosk Browser...
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
set CHROME_X86="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set EDGE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if exist %CHROME% (
    start "" %CHROME% --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 --no-first-run --autoplay-policy=no-user-gesture-required "http://localhost:3000"
) else if exist %CHROME_X86% (
    start "" %CHROME_X86% --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 --no-first-run --autoplay-policy=no-user-gesture-required "http://localhost:3000"
) else (
    start "" %EDGE% --kiosk --edge-kiosk-type=fullscreen --no-first-run --autoplay-policy=no-user-gesture-required "http://localhost:3000"
)

echo.
echo Activation is now running!
echo Press [O] on the keyboard to access Operator Diagnostic Console.

