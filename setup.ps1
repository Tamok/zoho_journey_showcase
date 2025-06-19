# Zoho Campaigns Journey Showcase - Quick Setup Script
# This script processes the PM email templates and launches the website

Write-Host "Zoho Campaigns Journey Showcase - Setup" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found Python: $pythonVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Python not found. Please install Python 3.7+ and try again." -ForegroundColor Red
    exit 1
}

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir

Write-Host "Working directory: $rootDir" -ForegroundColor Cyan

# Check if journeys/pm directory exists
$pmDir = Join-Path $rootDir "journeys\pm"
if (!(Test-Path $pmDir)) {
    Write-Host "Error: PM journey directory not found at $pmDir" -ForegroundColor Red
    Write-Host "Please ensure the PM templates are in the correct location." -ForegroundColor Yellow
    exit 1
}

# Count template files
$templateFiles = Get-ChildItem -Path $pmDir -Filter "template (*.zip"
Write-Host "Found $($templateFiles.Count) template files in PM directory" -ForegroundColor Cyan

# Change to scripts directory
$scriptsDir = Join-Path $rootDir "scripts"
Set-Location $scriptsDir

Write-Host "`nProcessing PM email templates..." -ForegroundColor Yellow

# Run the Python processing script
try {
    python process_templates.py pm
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Template processing completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Template processing failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`nError running Python script: $_" -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location $rootDir

# Check if website files exist
$websiteIndex = Join-Path $rootDir "website\index.html"
if (!(Test-Path $websiteIndex)) {
    Write-Host "Error: Website files not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Setup completed successfully!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Open 'website\index.html' in your web browser" -ForegroundColor White
Write-Host "2. Select 'Project Management' from the program dropdown" -ForegroundColor White
Write-Host "3. Click 'Auto Play' to start the journey simulation" -ForegroundColor White
Write-Host "4. Interact with emails to see different journey branches" -ForegroundColor White

Write-Host "`nKeyboard shortcuts:" -ForegroundColor Yellow
Write-Host "• Spacebar: Toggle auto-play" -ForegroundColor White
Write-Host "• R: Reset journey" -ForegroundColor White
Write-Host "• O: Mark email as opened" -ForegroundColor White
Write-Host "• C: Mark email as clicked" -ForegroundColor White

# Ask if user wants to open the website automatically
$openWebsite = Read-Host "`nWould you like to open the website now? (y/N)"
if ($openWebsite -eq "y" -or $openWebsite -eq "Y") {
    try {
        Start-Process $websiteIndex
        Write-Host "Opening website in default browser..." -ForegroundColor Cyan
    } catch {
        Write-Host "Could not open website automatically. Please open 'website\index.html' manually." -ForegroundColor Yellow
    }
}

Write-Host "`nFor future programs:" -ForegroundColor Yellow
Write-Host "1. Create a new folder in 'journeys\[program-name]'" -ForegroundColor White
Write-Host "2. Add template (1).zip through template (9).zip files" -ForegroundColor White
Write-Host "3. Run: python scripts\process_templates.py [program-name]" -ForegroundColor White
Write-Host "4. Update journey-data.js with your program configuration" -ForegroundColor White

Write-Host "`nRefer to README.md for detailed documentation." -ForegroundColor Cyan
