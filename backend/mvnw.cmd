@echo off
setlocal enabledelayedexpansion
set MAVEN_VERSION=3.9.5
set SCRIPT_DIR=%~dp0
set WRAPPER_DIR=%SCRIPT_DIR%.mvn\wrapper
set MAVEN_DIR=%WRAPPER_DIR%\apache-maven-%MAVEN_VERSION%

if not exist "%MAVEN_DIR%\bin\mvn.cmd" (
  echo Downloading Apache Maven %MAVEN_VERSION% to %WRAPPER_DIR%...
  powershell -NoProfile -Command "New-Item -ItemType Directory -Force -Path '%WRAPPER_DIR%' | Out-Null; $url='https://archive.apache.org/dist/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip'; $out='%WRAPPER_DIR%\\maven.zip'; Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing; Expand-Archive -LiteralPath $out -DestinationPath '%WRAPPER_DIR%'; Remove-Item $out"
)

"%MAVEN_DIR%\bin\mvn.cmd" %*
