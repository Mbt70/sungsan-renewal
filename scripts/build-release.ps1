param(
    [string]$Version = $env:GNUBOARD_VERSION
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$releaseDir = Join-Path $root "release"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipPath = Join-Path $releaseDir "sungsan-site-$stamp.zip"

npm run build:css
& (Join-Path $PSScriptRoot "bootstrap-gnuboard.ps1") -Version $Version

New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

$exclude = @("data", "install", "shop")
$items = Get-ChildItem -LiteralPath (Join-Path $root "www") | Where-Object {
    $exclude -notcontains $_.Name
}

Compress-Archive -Path $items.FullName -DestinationPath $zipPath
Write-Host "Release artifact created: $zipPath"

