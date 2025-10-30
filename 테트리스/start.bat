@echo off
REM 테트리스 게임 서버 시작 스크립트 (Windows용)

echo.
echo ====================================
echo 테트리스 게임 서버 시작 중...
echo ====================================
echo.

REM Node.js가 설치되어 있는지 확인
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 오류: Node.js가 설치되어 있지 않습니다.
    echo.
    echo Node.js를 설치하려면 https://nodejs.org/ 를 방문하세요.
    echo.
    pause
    exit /b 1
)

REM 서버 시작
node server.js

REM 서버가 종료되면 메시지 출력
echo.
echo 서버가 종료되었습니다.
echo.
pause
