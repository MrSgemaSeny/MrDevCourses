# ==============================================================================
# setup-ai-guards.ps1 - AI Prompt Guard Installer for PowerShell
# ==============================================================================
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

Write-Host "[AI GUARD SETUP] Initializing AI Guard installation..." -ForegroundColor Cyan

# 1. Determine PowerShell profile path
$profilePath = $PROFILE.CurrentUserCurrentHost
if (-not $profilePath) {
    $profilePath = $PROFILE
}

Write-Host "[AI GUARD SETUP] Target profile path: $profilePath" -ForegroundColor Gray

# 2. Ensure profile directory and file exist
$profileDir = Split-Path -Parent $profilePath
if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    Write-Host "[AI GUARD SETUP] Created profile directory: $profileDir" -ForegroundColor Green
}

if (-not (Test-Path $profilePath)) {
    New-Item -ItemType File -Path $profilePath -Force | Out-Null
    Write-Host "[AI GUARD SETUP] Created empty profile file: $profilePath" -ForegroundColor Green
}

# 3. Read existing profile content
$currentContent = [System.IO.File]::ReadAllText($profilePath, [System.Text.Encoding]::UTF8)

# 4. Prepare injection payload
$startMarker = "# >>> AI GUARDS HOOK >>>"
$endMarker   = "# <<< AI GUARDS HOOK <<<"

$hookPayload = @"
$startMarker
# Injects guardrail directives into stderr on every prompt execution to prevent AI context drift.
function global:prompt {
    [Console]::Error.WriteLine("[AI GUARD] CRITICAL DIRECTIVES: NO EMOJIS | USE API TOOLS (view_file, grep_search, replace_file_content) NOT CLI (cat, grep, ls) | READ .agents/AGENTS.MD ON UNCERTAINTY")
    "PS $($executionContext.SessionState.Path.CurrentLocation)$('>' * ($nestedPromptLevel + 1)) "
}
$endMarker
"@

# 5. Inject or update hook without corrupting existing profile settings
if ($currentContent -match [regex]::Escape($startMarker) -and $currentContent -match [regex]::Escape($endMarker)) {
    $pattern = "(?s)" + [regex]::Escape($startMarker) + ".*?" + [regex]::Escape($endMarker)
    $newContent = [regex]::Replace($currentContent, $pattern, $hookPayload)
    Write-Host "[AI GUARD SETUP] Updating existing AI Guards block in profile..." -ForegroundColor Yellow
} else {
    $newContent = $currentContent.TrimEnd() + "`r`n`r`n" + $hookPayload + "`r`n"
    Write-Host "[AI GUARD SETUP] Appending AI Guards block to profile..." -ForegroundColor Green
}

# 6. Save modified profile
[System.IO.File]::WriteAllText($profilePath, $newContent, [System.Text.Encoding]::UTF8)

# 7. Apply immediately to the active session
Invoke-Expression $hookPayload

Write-Host "[AI GUARD SETUP] AI Guards successfully installed and activated." -ForegroundColor Green
Write-Host "[AI GUARD SETUP] Verification: run any command to see the injection in the prompt loop." -ForegroundColor Cyan
