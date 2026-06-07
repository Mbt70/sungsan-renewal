param(
    [string]$Version = $env:GNUBOARD_VERSION
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$releaseDir = Join-Path $root "release"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipPath = Join-Path $releaseDir "sungsan-site-$stamp.zip"

function Get-RelativeReleasePath {
    param(
        [string]$Path,
        [string]$Base
    )

    $basePath = [System.IO.Path]::GetFullPath($Base).TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    ) + [System.IO.Path]::DirectorySeparatorChar
    $fullPath = [System.IO.Path]::GetFullPath($Path)

    if (-not $fullPath.StartsWith($basePath, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to package a file outside www: $fullPath"
    }

    $baseUri = New-Object System.Uri($basePath)
    $pathUri = New-Object System.Uri($fullPath)
    $relativeUri = $baseUri.MakeRelativeUri($pathUri).ToString()
    return [System.Uri]::UnescapeDataString($relativeUri).Replace("/", "\")
}

function Test-ReleaseFileAllowed {
    param(
        [string]$RelativePath
    )

    $normalizedPath = $RelativePath.Replace("/", "\")
    $topLevelDirectory = ($normalizedPath -split "\\")[0]

    if ($excludeDirectories -contains $topLevelDirectory) {
        return $false
    }

    foreach ($deniedPath in $releaseDenyPaths) {
        if ($normalizedPath.Equals($deniedPath, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $false
        }
    }

    return $true
}

npm run build:css
& (Join-Path $PSScriptRoot "bootstrap-gnuboard.ps1") -Version $Version

New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

$excludeDirectories = @("data", "install", "shop")
$releaseDenyPaths = @(
    "g4_import.php",
    "g4_import_run.php",
    "yc4_import.php",
    "yc4_import_run.php",
    "orderupgrade.php",
    "shop.config.php",
    "adm\phpinfo.php"
)

$wwwRoot = Join-Path $root "www"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipArchive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    $files = Get-ChildItem -LiteralPath $wwwRoot -Recurse -Force -File
    foreach ($file in $files) {
        $relativePath = Get-RelativeReleasePath -Path $file.FullName -Base $wwwRoot
        if (-not (Test-ReleaseFileAllowed -RelativePath $relativePath)) {
            continue
        }

        $zipEntryName = $relativePath.Replace("\", "/")
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $zipArchive,
            $file.FullName,
            $zipEntryName,
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
} finally {
    $zipArchive.Dispose()
}

$zipHash = Get-FileHash -LiteralPath $zipPath -Algorithm SHA256
$checksumPath = "$zipPath.sha256"
$checksumLine = "$($zipHash.Hash)  $(Split-Path -Leaf $zipPath)"
Set-Content -LiteralPath $checksumPath -Value $checksumLine -Encoding UTF8

Write-Host "Release artifact created: $zipPath"
Write-Host "Release checksum created: $checksumPath"
