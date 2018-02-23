@echo off
chcp 65001 >nul 2>nul
for /F %%a in (account.txt) do set "CI_TEACHER_ACCOUNT=%%a" && npm run -s start
