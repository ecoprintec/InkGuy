@echo off

REM Assign the value random password to the password variable
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION
set alfanum=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
set rustdesk_pw=
for /L %%b in (1, 1, 12) do (
    set /A rnd_num=!RANDOM! %% 62
    for %%c in (!rnd_num!) do (
        set rustdesk_pw=!rustdesk_pw!!alfanum:~%%c,1!
    )
)

REM Get your config string from your Web portal and Fill Below
set rustdesk_cfg="Qfi0TWlFnRVhza2dlSaBVZol0YllVSUBjcShFc3ElePZlU3xUZj5GUopHbOdEViojI5V2aiwiI4ETMxIjO5kjLwgjLwgTMugTNx8yL6AHd0hmI6ISawFmIsIyNxETMyoTO54CM44CM4EjL4UTMiojI5FGblJnIsIiNxETMyoTO54CM44CM4EjL4UTMiojI0N3boJye"

REM ############################### Please Do Not Edit Below This Line #########################################

if not exist C:\Temp\ md C:\Temp\
cd C:\Temp\

curl -L "https://github.com/rustdesk/rustdesk/releases/download/1.4.5/rustdesk-1.4.5-x86_64.exe" -o rustdesk.exe

rustdesk.exe --silent-install
timeout /t 20

cd "C:\Program Files\RustDesk\"
rustdesk.exe --install-service
timeout /t 20

for /f "delims=" %%i in ('rustdesk.exe --get-id ^| more') do set rustdesk_id=%%i

rustdesk.exe --config %rustdesk_cfg%

rustdesk.exe --password %rustdesk_pw%

echo ...............................................
REM Show the value of the ID Variable
echo RustDesk ID: %rustdesk_id%

REM Show the value of the Password Variable
echo Password: %rustdesk_pw%
echo ...............................................