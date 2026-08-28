[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$rawInput = ""
if ([Console]::IsInputRedirected) {
    $rawInput = [Console]::In.ReadToEnd()
}

# Проверяем git статус проекта MrDevCourses
Push-Location "C:\Users\murat\IdeaProjects\new_world\MrDevCourses"
$projectStatus = git status --porcelain 2>$null
Pop-Location

# Проверяем git статус Second Brain
Push-Location "C:\Users\murat\IdeaProjects\new_world\Brain's protocol - second brain"
$brainStatus = git status --porcelain 2>$null
Pop-Location

if ($projectStatus -or $brainStatus) {
    $out = @{
        decision = "continue"
        reason = "[WORKFLOW BARRIER] Обнаружены незакоммиченные изменения в проекте или Second Brain! Правило: ТЕСТЫ ПРОШЛИ -> ЗАПИСЬ В ЖУРНАЛ -> GIT COMMIT/PUSH. Пожалуйста, сохраните изменения в журнале Second Brain и сделайте commit & push."
    }
    $out | ConvertTo-Json -Compress | Write-Output
} else {
    $out = @{
        decision = "stop"
    }
    $out | ConvertTo-Json -Compress | Write-Output
}
exit 0
