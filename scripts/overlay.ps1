param(
    [string]$Target = "www"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$targetPath = Join-Path $root $Target
$sourcePath = Join-Path $root "src"

function Copy-OverlayTree {
    param(
        [string]$From,
        [string]$To
    )

    New-Item -ItemType Directory -Force -Path $To | Out-Null

    foreach ($item in Get-ChildItem -LiteralPath $From -Force) {
        $destination = Join-Path $To $item.Name

        if ($item.PSIsContainer) {
            Copy-OverlayTree -From $item.FullName -To $destination
            continue
        }

        if (Test-Path -LiteralPath $destination) {
            $sourceHash = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256).Hash
            $destinationHash = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash

            if ($sourceHash -eq $destinationHash) {
                continue
            }

            Remove-Item -LiteralPath $destination -Force
        }

        Copy-Item -LiteralPath $item.FullName -Destination $destination -Force
    }
}

if (-not (Test-Path $targetPath)) {
    throw "Target path does not exist: $targetPath. Run scripts/bootstrap-gnuboard.ps1 first."
}

$copyPairs = @(
    @{ From = "theme"; To = "theme" },
    @{ From = "skin"; To = "skin" },
    @{ From = "skin\board"; To = "mobile\skin\board" },
    @{ From = "skin\member"; To = "mobile\skin\member" },
    @{ From = "skin\latest"; To = "mobile\skin\latest" },
    @{ From = "extend"; To = "extend" },
    @{ From = "pages"; To = "sungsan" }
)

foreach ($pair in $copyPairs) {
    $from = Join-Path $sourcePath $pair.From
    $to = Join-Path $targetPath $pair.To

    if (Test-Path $from) {
        Copy-OverlayTree -From $from -To $to
    }
}

Write-Host "Overlay copied to $targetPath"
