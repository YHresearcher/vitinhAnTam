@echo off
title VI TINH AN TAM - LOCALHOST:3000
color 0A

echo ===================================================================
echo             VI TINH AN TAM - KHO MAY TINH VA BAN QUYEN KEY
echo ===================================================================
echo.

echo [*] Thu muc: c:\Users\pntha\.gemini\antigravity-ide\scratch\New folder\vitinhAnTam
cd /d "c:\Users\pntha\.gemini\antigravity-ide\scratch\New folder\vitinhAnTam"

echo [*] Kiem tra va giai phong cong 3000...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo [*] Dang mo trinh duyet truy cap: http://localhost:3000 ...
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000"

echo [*] Dang chay Next.js Dev Server (call npm run dev)...
echo.
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [!] Server da dung.
)
pause
