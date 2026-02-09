# ════════════════════════════════════════════════════════════════════════════════
# 🛡️  AEGIS UBER TESTER: THE MASTER VERIFICATION SUITE
# ════════════════════════════════════════════════════════════════════════════════
# One command to verify the entire project state:
#   1. 📋 Environment & Deps
#   2. 📡 Backend API Connectivity (CRITICAL)
#   3. 🤖 Consensus Simulation (CRITICAL)
#   4. 🔐 Off-Chain Cryptography (CRITICAL)
#   5. ⛓️  Smart Contract Integration (If Anvil is up)
#   6. 🚀 Full End-to-End Flow (If Anvil is up)
# ════════════════════════════════════════════════════════════════════════════════

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSScriptRoot = Get-Location
$Global:TestsFailed = 0

function Write-Header($text) {
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   $text" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Run-TestStep($Name, $ScriptPath, $Critical = $false, $Arguments = "") {
    Write-Host "🏃 Running: $Name..." -ForegroundColor Yellow
    $fullPath = Join-Path $PSScriptRoot $ScriptPath
    
    if ($ScriptPath.EndsWith(".ps1")) {
        & $fullPath $Arguments
    } elseif ($ScriptPath.EndsWith(".ts") -or $ScriptPath.EndsWith(".js")) {
        npx tsx $fullPath
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ $Name FAILED!" -ForegroundColor Red
        $Global:TestsFailed++
        
        if ($Critical) {
            Write-Host "   ⛔ CRITICAL FAILURE DETECTED. ABORTING SUITE." -ForegroundColor Red -BackgroundColor Black
            exit 1
        }
        return $false
    } else {
        Write-Host "   ✅ $Name PASSED!" -ForegroundColor Green
        return $true
    }
}

Write-Header "🚀 STARTING AEGIS UBER TESTER (PRE-COMMIT MODE)"

# ════════════════════════════════════════════════════════════════════════════════
# PHASE 1: PREREQUISITES
# ════════════════════════════════════════════════════════════════════════════════
Write-Host "📋 Phase 1: Checking Environment..." -ForegroundColor White

# Check Docker
$dockerCheck = docker ps --filter "name=aegis_dev" --format "{{.Names}}" 2>$null
if ($dockerCheck -ne "aegis_dev") {
    Write-Host "   ❌ Docker container 'aegis_dev' is not running!" -ForegroundColor Red
    Write-Host "      Run: docker-compose up -d" -ForegroundColor DarkGray
    exit 1
} else {
    Write-Host "   ✅ Docker: Running" -ForegroundColor Green
}

# Check Anvil
$castPath = "$env:USERPROFILE\.foundry\bin\cast.exe"
$env:FOUNDRY_DISABLE_NIGHTLY_WARNING = "1"
$anvilCheck = & $castPath chain-id --rpc-url http://localhost:8545 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  Anvil: Not running (Blockchain tests will be skipped)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Anvil: Running (Chain ID: $anvilCheck)" -ForegroundColor Green
}

# ════════════════════════════════════════════════════════════════════════════════
# PHASE 2: CONNECTIVITY (APIs)
# ════════════════════════════════════════════════════════════════════════════════
Write-Header "📡 Phase 2: Connectivity Suite"
Run-TestStep "API Connectivity (CoinGecko/GoPlus/OpenAI)" "test-all-apis.ts" $true

# ════════════════════════════════════════════════════════════════════════════════
# PHASE 3: CONSENSUS SIMULATION
# ════════════════════════════════════════════════════════════════════════════════
Write-Header "🤖 Phase 3: Consensus Simulation"
Run-TestStep "Determinism Check (3 Nodes)" "simulate-consensus.ts" $true

# ════════════════════════════════════════════════════════════════════════════════
# PHASE 4: CRYPTOGRAPHY
# ════════════════════════════════════════════════════════════════════════════════
Write-Header "🔐 Phase 4: Cryptography Suite"
Run-TestStep "Off-Chain Signature Verification" "test-signature.ps1" $true

# ════════════════════════════════════════════════════════════════════════════════
# PHASE 5: SMART CONTRACT & E2E (If Anvil is up)
# ════════════════════════════════════════════════════════════════════════════════
if ($anvilCheck) {
    Write-Header "⛓️  Phase 5: Smart Contract Integration"
    Run-TestStep "AegisVault integration tests" "test-contract.ps1" $true
    
    Write-Header "🚀 Phase 6: Full E2E Demo Flow"
    Run-TestStep "Full AI-to-Blockchain flow" "run-full-flow.ps1" $true
} else {
    Write-Host ""
    Write-Host "⏩ Skipping Phases 5 & 6 (Anvil not running)" -ForegroundColor DarkGray
}

# ════════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
if ($Global:TestsFailed -eq 0) {
    Write-Host "   🏆 ALL SYSTEMS NOMINAL: PROJECT IS READY FOR SUBMISSION!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  VERIFICATION INCOMPLETE: $Global:TestsFailed test(s) failed." -ForegroundColor Yellow
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

exit $Global:TestsFailed
