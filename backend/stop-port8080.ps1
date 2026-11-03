$mypids = (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue).OwningProcess
foreach ($mypid in $mypids) {
    Stop-Process -Id $mypid -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 3
$remaining = (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($remaining) {
    Write-Output "Port 8080 encore occupé par : $remaining"
    exit 1
}
Write-Output "Port 8080 libre"
exit 0
