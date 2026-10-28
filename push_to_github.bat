@echo off
title Push Project to GitHub - bharathwaj221108-jpg/project-1
echo ====================================================================
echo   Pushing Smart Bus Route Management System to GitHub
echo   Target: https://github.com/bharathwaj221108-jpg/project-1.git
echo ====================================================================
echo.
cd /d "%~dp0"
python push_to_github.py
pause
