@echo off
title ElevenLabs Voice Studio
echo ========================================================
echo         ElevenLabs AI Voice Studio - Starting...
echo ========================================================
echo.
echo Launching local server and audio proxy at http://localhost:8000
echo.

start "" "http://localhost:8000"
python server.py

pause
