:: Usage: npx tsx carousel.perf.ts --v1="path\to\ddcarousel\src\ddcarousel.js"
@echo off
setlocal

if "%~1"=="" (

    exit /b 1
)

set "V1_PATH=%~1"

for %%S in (20 50 100 200 500) do (
    set "PERF_SLIDES=%%S"
    call npx tsx carousel.perf.ts --v1="%V1_PATH%"

    if errorlevel 1 (
        echo Benchmark failed with %%S slides!
        exit /b 1
    )
)

echo.
echo All benchmark runs completed successfully!
pause
