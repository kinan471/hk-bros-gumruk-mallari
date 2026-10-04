@echo off
chcp 65001 >nul
title HK BROS - Project Cleanup Tool
color 0A

echo.
echo ============================================================
echo           HK BROS GUMRUK MALLARI - CLEANUP TOOL
echo ============================================================
echo.

:: Check if running in correct directory
if not exist "package.json" (
    color 0C
    echo [ERROR] Please run this script from the project root directory!
    echo         (hk-bros-gumruk-mallari)
    echo.
    pause
    exit /b 1
)

echo [INFO] Current directory: %CD%
echo.

:: Ask for confirmation
echo ============================================================
echo  The following will be DELETED:
echo ============================================================
echo.
echo  [1] app\(admin)\              - Entire admin pages folder
echo  [2] components\admin\         - Admin components folder
echo  [3] .next\                    - Next.js build cache
echo  [4] node_modules\.cache\      - Node modules cache
echo.
echo ============================================================
echo.

set /p CONFIRM="Do you want to continue? (Y/N): "

if /i "%CONFIRM%" neq "Y" (
    color 0E
    echo.
    echo [CANCEL] Operation cancelled by user.
    echo.
    pause
    exit /b 0
)

echo.
echo [START] Starting cleanup process...
echo.

:: Counter for deleted items
set DELETED_COUNT=0

:: 1. Delete admin pages - use quotes and escape parentheses
echo ------------------------------------------------------------
echo [1/4] Removing admin pages...
if exist "app\(admin)" (
    rd /s /q "app\(admin)" 2>nul
    if errorlevel 1 (
        color 0C
        echo      [FAIL] Could not delete app\(admin)\
    ) else (
        color 0A
        echo      [OK]   Deleted app\(admin)\
        set /a DELETED_COUNT+=1
    )
) else (
    color 0E
    echo      [SKIP] app\(admin)\ not found
)
color 0A

:: 2. Delete admin components
echo ------------------------------------------------------------
echo [2/4] Removing admin components...
if exist "components\admin" (
    rd /s /q "components\admin" 2>nul
    if errorlevel 1 (
        color 0C
        echo      [FAIL] Could not delete components\admin\
    ) else (
        color 0A
        echo      [OK]   Deleted components\admin\
        set /a DELETED_COUNT+=1
    )
) else (
    color 0E
    echo      [SKIP] components\admin\ not found
)
color 0A

:: 3. Delete .next cache
echo ------------------------------------------------------------
echo [3/4] Removing Next.js cache...
if exist ".next" (
    rd /s /q ".next" 2>nul
    if errorlevel 1 (
        color 0C
        echo      [FAIL] Could not delete .next\
    ) else (
        color 0A
        echo      [OK]   Deleted .next\
        set /a DELETED_COUNT+=1
    )
) else (
    color 0E
    echo      [SKIP] .next\ not found
)
color 0A

:: 4. Delete node_modules cache
echo ------------------------------------------------------------
echo [4/4] Removing node_modules cache...
if exist "node_modules\.cache" (
    rd /s /q "node_modules\.cache" 2>nul
    if errorlevel 1 (
        color 0C
        echo      [FAIL] Could not delete node_modules\.cache\
    ) else (
        color 0A
        echo      [OK]   Deleted node_modules\.cache\
        set /a DELETED_COUNT+=1
    )
) else (
    color 0E
    echo      [SKIP] node_modules\.cache\ not found
)
color 0A

:: Summary
echo.
echo ============================================================
echo.
echo  [SUMMARY] Cleanup completed!
echo  [INFO]    %DELETED_COUNT% items deleted successfully.
echo.
echo ============================================================
echo.

:: Check remaining structure
echo [INFO] Remaining project structure:
echo.
echo  app\
if exist "app\(main)" echo   +-- (main)\              [OK]
if exist "app\(auth)" echo   +-- (auth)\              [OK]
if not exist "app\(admin)" echo   +-- (admin)\             [DELETED]
echo   +-- layout.tsx
echo   +-- page.tsx
echo   +-- globals.css
echo   +-- providers.tsx
echo.
echo  components\
if not exist "components\admin" echo   +-- admin\               [DELETED]
if exist "components\layout" echo   +-- layout\              [OK]
if exist "components\products" echo   +-- products\            [OK]
if exist "components\contact" echo   +-- contact\             [OK]
if exist "components\ui" echo   +-- ui\                  [OK]
echo.

color 0A
echo ============================================================
echo.
echo   [OK] Project cleaned successfully!
echo   [OK] Ready to rebuild admin dashboard from scratch.
echo.
echo ============================================================
echo.

:: Ask to run dev server
set /p RUN_DEV="Do you want to start the dev server now? (Y/N): "

if /i "%RUN_DEV%"=="Y" (
    echo.
    echo [INFO] Starting development server...
    echo.
    call npm run dev
) else (
    echo.
    echo [INFO] You can start the server manually with: npm run dev
    echo.
)

pause