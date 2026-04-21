param(
    [switch]$Quiet
)

$processes = Get-Process CyberSecureAR.API -ErrorAction SilentlyContinue

if (-not $processes) {
    if (-not $Quiet) {
        Write-Host "No CyberSecureAR.API process is running."
    }

    exit 0
}

$processes | Stop-Process -Force

if (-not $Quiet) {
    $ids = ($processes | Select-Object -ExpandProperty Id) -join ", "
    Write-Host "Stopped CyberSecureAR.API process(es): $ids"
}
