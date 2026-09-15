# Ejecutar desde cualquier ubicacion. Borra los subagentes NO relevantes
# para el stack de SolarPulse (FastAPI + Next.js/React/TS).

$agentsPath = "D:\AiProject\SolarPulse\.opencode\agents"

$keep = @(
    "fastapi-developer.md",
    "python-pro.md",
    "nextjs-developer.md",
    "react-specialist.md",
    "typescript-pro.md",
    "code-reviewer.md",
    "test-writer.md",
    "git-workflow-manager.md",
    "technical-writer.md"
)

Get-ChildItem -Path $agentsPath -Filter *.md | ForEach-Object {
    if ($keep -notcontains $_.Name) {
        Write-Host "Borrando: $($_.Name)"
        Remove-Item $_.FullName -Force
    } else {
        Write-Host "Conservando: $($_.Name)"
    }
}

Write-Host "`nListo. Agentes restantes:"
Get-ChildItem -Path $agentsPath -Filter *.md | Select-Object -ExpandProperty Name
