[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$rawInput = ""
if ([Console]::IsInputRedirected) {
    $rawInput = [Console]::In.ReadToEnd()
}

$injectSteps = @()

Push-Location "C:\Users\murat\IdeaProjects\new_world\MrDevCourses"
$repoStatus = git status --porcelain 2>$null
$repoUnpushed = git cherry -v 2>$null
Pop-Location

Push-Location "C:\Users\murat\IdeaProjects\new_world\Brain's protocol - second brain"
$brainStatus = git status --porcelain 2>$null
$brainUnpushed = git cherry -v 2>$null
Pop-Location


if ($repoStatus -or $repoUnpushed -or $brainStatus -or $brainUnpushed) {
    $reason = "[WARNING] Не забывай про Workflow: ТЕСТЫ → ЖУРНАЛ → GIT PUSH. У тебя есть незакоммиченные или неотправленные изменения. Ты можешь остановиться, чтобы задать вопрос пользователю, но НЕ ЗАБУДЬ сделать push перед финальным завершением задачи!"
    $injectSteps += @{ ephemeralMessage = $reason }
}

@{ injectSteps = $injectSteps } | ConvertTo-Json -Depth 10 -Compress | Write-Output
