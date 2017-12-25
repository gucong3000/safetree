@echo off
chcp 65001
cls
for /F %%a in (account.txt) do set "CI_TEACHER_ACCOUNT=%%a" && node_modules\electron\dist\electron .
