# AEGIS ULTIMATE LAUNCHER - FORCE UTF-8 EMOJI MODE
$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# This forces the registry to tell PowerShell to use UTF-8 for the session
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

Write-Host "🚀 INITIALIZING AEGIS MISSION CONTROL..." -ForegroundColor Cyan

# 🔄 Automated Environment Sync
Write-Host "🔄 Syncing Environment Configuration..." -ForegroundColor Yellow
try {
    $rootEnv = Get-Content "$PSScriptRoot\.env"
    
    function Get-EnvValue($key) {
        $match = $rootEnv | Select-String "^$key=" | Select-Object -First 1
        if ($match) { return $match.ToString().Split("=", 2)[1].Trim() }
        return $null
    }

    $openai = Get-EnvValue "OPENAI_API_KEY"
    $rpc = Get-EnvValue "TENDERLY_RPC_URL"
    $groq = Get-EnvValue "GROQ_API_KEY"
    $vault = Get-EnvValue "AEGIS_VAULT_ADDRESS"

    if ($openai -and $rpc -and $groq -and $vault) {
        # FORCE UPDATE process environment variables to override any stale shell values
        $env:TENDERLY_RPC_URL = $rpc
        $env:AEGIS_VAULT_ADDRESS = $vault
        
        $elizaEnvContent = "OPENAI_API_KEY=$openai`r`nVITE_TENDERLY_RPC_URL=$rpc`r`nGROQ_API_KEY=$groq`r`nAEGIS_VAULT_ADDRESS=$vault"
        $elizaEnvContent | Out-File -FilePath "$PSScriptRoot\eliza\.env" -Encoding utf8
        Write-Host "✅ Sync Complete: eliza/.env updated from root .env" -ForegroundColor Green
    } else {
        throw "One or more required values missing in root .env"
    }
} catch {
    Write-Host "⚠️  Sync Warning: Could not propagate all .env values. Ensure root .env is complete." -ForegroundColor Red
}

Write-Host ""

# Define the command wrapper to ensure NO glyph loss
$UTF8_WRAPPER = "chcp 65001 > `$null; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8;"

# 🤖 Start Eliza Backend
Start-Process powershell -ArgumentList "-NoProfile", "-NoExit", "-Command", "$UTF8_WRAPPER cd '$PSScriptRoot\eliza'; Write-Host '🤖 ELIZA BACKEND ACTIVE' -ForegroundColor Green; npm run dev:server | Tee-Object -FilePath '$PSScriptRoot\logs\eliza-backend.log'"

# 🌐 Start Aegis Web
Start-Process powershell -ArgumentList "-NoProfile", "-NoExit", "-Command", "$UTF8_WRAPPER cd '$PSScriptRoot\aegis-web'; Write-Host '🌐 AEGIS WEB UI ACTIVE' -ForegroundColor Magenta; npm run dev -- -p 3005 | Tee-Object -FilePath '$PSScriptRoot\logs\aegis-web.log'"

# ⛓️ Start Chainlink CRE Node
Start-Process powershell -ArgumentList "-NoProfile", "-NoExit", "-Command", "$UTF8_WRAPPER cd '$PSScriptRoot'; Write-Host '⛓️  CHAINLINK DON LISTENER ACTIVE' -ForegroundColor Cyan; bun run scripts/cre-listener.ts | Tee-Object -FilePath '$PSScriptRoot\logs\cre-listener.log'"

Write-Host ""
Write-Host "✅ AEGIS STACK DEPLOYED" -ForegroundColor Green
Write-Host "------------------------------------" -ForegroundColor Gray
Write-Host "UI:      http://localhost:3005" -ForegroundColor Yellow
Write-Host "API:     http://localhost:3011" -ForegroundColor Yellow
Write-Host "ORACLE:  Sentry Node Watching Tenderly" -ForegroundColor Yellow
