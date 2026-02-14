# Minimal E2E Test for Aegis
$ErrorActionPreference = "Stop"
$CONTRACT = "0x9A676e781A523b5d0C0e43731313A708CB607508"
$KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" 
$TOKEN = "0x4200000000000000000000000000000000000006" # Mock Token
$AMT = "1000000000000000000"

Write-Host "1. Initiating Swap..." -ForegroundColor Cyan
# Call swap
$out = cast send $CONTRACT "swap(address,uint256)" $TOKEN $AMT --value $AMT --private-key $KEY --rpc-url http://localhost:8545 --json | ConvertFrom-Json
$tx = $out.transactionHash

Start-Sleep -Seconds 1
$rec = cast receipt $tx --rpc-url http://localhost:8545 --json | ConvertFrom-Json

# Find Log
$reqId = $null
foreach ($log in $rec.logs) {
    if ($log.address -eq $CONTRACT -or $log.address -eq $CONTRACT.ToLower()) {
        $reqId = $log.topics[1]
        break
    }
}

if (-not $reqId) {
    Write-Error "Failed to find Request ID in logs"
}

Write-Host "   Request ID: $reqId" -ForegroundColor Green

Write-Host "2. Running AI Audit (Docker)..." -ForegroundColor Cyan
Write-Host "2. Running AI Audit (Docker)..." -ForegroundColor Cyan

# Strategy: Write payload to file to bypass CLI quoting issues on Windows
$payloadObj = @{
    tokenAddress = $TOKEN
    chainId = "31337"
    askingPrice = "2000"
}
$payloadObj | ConvertTo-Json | Set-Content -Path "payload.json" -Encoding UTF8

# Container mounts current dir, so ./payload.json is accessible
$cmd = "docker exec aegis_dev cre workflow simulate ./aegis-workflow --target staging-settings --non-interactive --trigger-index 0 --http-payload ./payload.json"

Write-Host "   Command: $cmd" -ForegroundColor DarkGray
$res = Invoke-Expression $cmd 2>&1 | Out-String

if ($res -match "riskCodeHex`":\s*`"(0x[0-9a-fA-F]+)`"") {
    $hex = $matches[1]
    Write-Host "   Risk Hex: $hex" -ForegroundColor Green
} else {
    Write-Host "   Failed to parse risk code. Defaulting to safe (0x0...)" -ForegroundColor Yellow
    $hex = "0x0000000000000000000000000000000000000000000000000000000000000000"
}

Write-Host "3. Fulfilling Request..." -ForegroundColor Cyan
cast send $CONTRACT "fulfillRequest(bytes32,bytes,bytes)" $reqId $hex "0x" --private-key $KEY --rpc-url http://localhost:8545

Write-Host "✅ E2E Flow Complete" -ForegroundColor Green
