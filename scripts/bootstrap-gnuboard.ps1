param(
    [string]$Version = $env:GNUBOARD_VERSION,
    [string]$Target = "www",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

if (-not $Version) {
    $Version = "v5.6.28"
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$buildDir = Join-Path $root ".build"
$targetPath = Join-Path $root $Target
$zipPath = Join-Path $buildDir "gnuboard5-$Version.zip"
$extractPath = Join-Path $buildDir "gnuboard5-$Version"
$downloadUrl = "https://github.com/gnuboard/gnuboard5/archive/refs/tags/$Version.zip"

New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

if ((Test-Path $targetPath) -and -not $Force) {
    Write-Host "$targetPath already exists. Use -Force to rebuild it."
    & (Join-Path $PSScriptRoot "overlay.ps1") -Target $Target
    exit 0
}

if (-not (Test-Path $zipPath)) {
    Write-Host "Downloading GnuBoard $Version..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath
}

if (Test-Path $extractPath) {
    Remove-Item -LiteralPath $extractPath -Recurse -Force
}

Expand-Archive -LiteralPath $zipPath -DestinationPath $extractPath

$inner = Get-ChildItem -LiteralPath $extractPath -Directory | Select-Object -First 1
if (-not $inner) {
    throw "Unable to find extracted GnuBoard source."
}

if (Test-Path $targetPath) {
    Remove-Item -LiteralPath $targetPath -Recurse -Force
}

Copy-Item -Path $inner.FullName -Destination $targetPath -Recurse
New-Item -ItemType Directory -Force -Path (Join-Path $targetPath "data") | Out-Null

& (Join-Path $PSScriptRoot "overlay.ps1") -Target $Target

Write-Host "GnuBoard $Version prepared at $targetPath"

