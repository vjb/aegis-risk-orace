# Aegis Demo Stopper
# Stops all Node.js processes running on ports 3005 and 3011

Write-Host "🛑 Stopping Aegis Demo Stack..." -ForegroundColor Cyan

# Find and kill processes on port 3005 (Aegis Web)
$port3005 = Get-NetTCPConnection -LocalPort 3005 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($port3005) {
    $port3005 | ForEach-Object { 
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        Write-Host "   Stopped process on port 3005 (PID: $_)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   No process found on port 3005" -ForegroundColor DarkGray
}

# Find and kill processes on port 3011 (Eliza)
$port3011 = Get-NetTCPConnection -LocalPort 3011 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($port3011) {
    $port3011 | ForEach-Object { 
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        Write-Host "   Stopped process on port 3011 (PID: $_)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   No process found on port 3011" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "✅ Aegis Demo stopped." -ForegroundColor Green
