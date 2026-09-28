# Install the DeepSeek Whale pet into Codex.
$ErrorActionPreference = "Stop"

$dest = Join-Path $env:USERPROFILE ".codex\pets\deepseek"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item -Path (Join-Path $PSScriptRoot "pets\deepseek\*") -Destination $dest -Force

Write-Host "Installed to $dest"
Write-Host "Now open Codex -> Settings -> Pets and pick 'DeepSeek Whale'."
