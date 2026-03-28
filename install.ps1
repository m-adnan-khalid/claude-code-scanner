# Claude Code Scanner — Quick Install (Windows PowerShell)
# Usage: irm https://raw.githubusercontent.com/m-adnan-khalid/claude-code-scanner/master/install.ps1 | iex
# Or:    .\install.ps1

$ErrorActionPreference = "Stop"

$REPO = "m-adnan-khalid/claude-code-scanner"
$BRANCH = "master"

Write-Host "`nClaude Code Scanner — Installing...`n" -ForegroundColor Cyan

# Check if we're in a project directory
$projectFiles = @("package.json","go.mod","Cargo.toml","requirements.txt","Gemfile","pom.xml","pyproject.toml","*.csproj")
$hasProject = $projectFiles | Where-Object { Test-Path $_ }
if (-not $hasProject) {
    Write-Host "Warning: No project files detected. Are you in the right directory?" -ForegroundColor Yellow
    $reply = Read-Host "Continue anyway? (y/N)"
    if ($reply -ne "y" -and $reply -ne "Y") { exit 1 }
}

# Download and extract
$tmpDir = Join-Path $env:TEMP "claude-scanner-$(Get-Random)"
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
$zipUrl = "https://github.com/$REPO/archive/refs/heads/$BRANCH.zip"
$zipPath = Join-Path $tmpDir "scanner.zip"

Write-Host "Downloading from GitHub..."
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
Expand-Archive -Path $zipPath -DestinationPath $tmpDir -Force

$src = Join-Path $tmpDir "claude-code-scanner-$BRANCH" "template"

# Copy CLAUDE.md
if (Test-Path "CLAUDE.md") {
    Write-Host "! CLAUDE.md exists — backing up to CLAUDE.md.backup" -ForegroundColor Yellow
    Copy-Item "CLAUDE.md" "CLAUDE.md.backup"
}
Copy-Item (Join-Path $src "CLAUDE.md") "CLAUDE.md"
Write-Host "[OK] CLAUDE.md" -ForegroundColor Green

# Copy .claude/ directories
$dirs = @("rules","agents","skills","hooks","scripts","docs","templates","profiles","project")
foreach ($dir in $dirs) {
    $srcDir = Join-Path $src ".claude" $dir
    if (Test-Path $srcDir) {
        $destDir = Join-Path ".claude" $dir
        if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
        Copy-Item (Join-Path $srcDir "*") $destDir -Recurse -Force
        $count = (Get-ChildItem $destDir -File -Recurse).Count
        Write-Host "[OK] .claude/$dir/ ($count files)" -ForegroundColor Green
    }
}

# Copy settings
$settingsSrc = Join-Path $src ".claude" "settings.json"
$settingsDest = Join-Path ".claude" "settings.json"
if ((Test-Path $settingsSrc) -and (-not (Test-Path $settingsDest))) {
    Copy-Item $settingsSrc $settingsDest
    Write-Host "[OK] .claude/settings.json" -ForegroundColor Green
} elseif (Test-Path $settingsDest) {
    Write-Host "! .claude/settings.json exists — skipped" -ForegroundColor Yellow
}

# Create settings.local.json
$localSettings = Join-Path ".claude" "settings.local.json"
if (-not (Test-Path $localSettings)) {
    '{ "env": {} }' | Set-Content $localSettings
    Write-Host "[OK] .claude/settings.local.json (template)" -ForegroundColor Green
}

# Copy manifest.json for drift detection
$manifestSrc = Join-Path $src ".claude" "manifest.json"
$manifestDest = Join-Path ".claude" "manifest.json"
if ((Test-Path $manifestSrc) -and (-not (Test-Path $manifestDest))) {
    Copy-Item $manifestSrc $manifestDest
    Write-Host "[OK] .claude/manifest.json (drift tracking)" -ForegroundColor Green
}

# Create task/report dirs
New-Item -ItemType Directory -Path (Join-Path ".claude" "tasks") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path ".claude" "reports" "daily") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path ".claude" "reports" "executions") -Force | Out-Null
Write-Host "[OK] .claude/tasks/, .claude/reports/daily/, .claude/reports/executions/" -ForegroundColor Green

# Update .gitignore
$gitignoreEntries = @(
    ".claude/settings.local.json",
    ".claude/agent-memory-local/",
    ".claude/tasks/",
    ".claude/reports/"
)

$gitignorePath = ".gitignore"
$gitignoreContent = if (Test-Path $gitignorePath) { Get-Content $gitignorePath -Raw } else { "" }
$newEntries = $gitignoreEntries | Where-Object { $gitignoreContent -notmatch [regex]::Escape($_) }
if ($newEntries.Count -gt 0) {
    $addition = "`n# Claude Code local files`n" + ($newEntries -join "`n") + "`n"
    Add-Content $gitignorePath $addition
    Write-Host "[OK] .gitignore updated" -ForegroundColor Green
}

# Cleanup
Remove-Item $tmpDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`nSetup complete!`n" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1. claude"
Write-Host "  2. /scan-codebase              # Scan your tech stack" -ForegroundColor Cyan
Write-Host "  3. /generate-environment       # Generate customized environment" -ForegroundColor Cyan
Write-Host "  4. /validate-setup              # Verify everything works" -ForegroundColor Cyan
Write-Host ""
