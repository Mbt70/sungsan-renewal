param(
    [string]$Target = "www"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$targetPath = Join-Path $root $Target
$sourcePath = Join-Path $root "src"

if (-not (Test-Path $targetPath)) {
    throw "Target path does not exist: $targetPath. Run scripts/bootstrap-gnuboard.ps1 first."
}

$copyPairs = @(
    @{ From = "theme"; To = "theme" },
    @{ From = "skin"; To = "skin" },
    @{ From = "extend"; To = "extend" },
    @{ From = "pages"; To = "sungsan" }
)

foreach ($pair in $copyPairs) {
    $from = Join-Path $sourcePath $pair.From
    $to = Join-Path $targetPath $pair.To

    if (Test-Path $from) {
        New-Item -ItemType Directory -Force -Path $to | Out-Null
        Copy-Item -Path (Join-Path $from "*") -Destination $to -Recurse -Force
    }
}

Write-Host "Overlay copied to $targetPath"

