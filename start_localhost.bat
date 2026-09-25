@echo off
title VI TINH AN TAM - RUN LOCALHOST (PORT 3000)
color 0A

echo ===================================================================
echo             VI TINH AN TAM - HE THONG KHO VA BAN QUYEN KEY
echo ===================================================================
echo.
echo [*] Dang chuyen vao thu muc du an...
cd /d "%~dp0"
if not exist "package.json" cd /d "c:\Users\pntha\.gemini\antigravity-ide\scratch\New folder\vitinhAnTam"

echo [*] Dang mo trinh duyet truy cap: http://localhost:3000 ...
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

echo [*] Dang khoi dong Next.js Server (npm run dev)...
echo.
npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [!] Gap su co khi chay npm. Dang thu chay thong qua cmd...
    call npx next dev --webpack
)
pause