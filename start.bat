@echo off
title Smart Bus Route Management System
echo ========================================================
echo   Launching Smart Bus Route Management Web Application
echo ========================================================
echo.
cd /d "%~dp0"
python serve.py
pause
