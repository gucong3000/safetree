@echo off
SETLOCAL
chcp 65001 >nul 2>nul

(where env.exe && (
	goto :RUN
)) >nul 2>nul

rem add the unix commands at the end to not shadow windows commands like more
:: check if git is in registry...
for /F "tokens=1,2,*" %%i in ('reg query HKLM\SOFTWARE\GitForWindows /v InstallPath /reg:64 2^>nul ^| find "InstallPath"') do (
	set "Path=%Path%;%%k\mingw64;%%k\usr\bin;%%k\usr\share\vim\vim74"
	goto :RUN
)
for /F "tokens=1,2,*" %%i in ('reg query HKLM\SOFTWARE\GitForWindows /v InstallPath 2^>nul ^| find "InstallPath"') do (
	set "Path=%Path%;%%k\mingw32;%%k\usr\bin;%%k\usr\share\vim\vim74"
	goto :RUN
)

for /F %%a in (account.txt) do set "CI_TEACHER_ACCOUNT=%%a" && npm run -s start
exit /b

:RUN
env.exe ./run.sh
