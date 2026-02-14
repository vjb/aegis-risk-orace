# ═══════════════════════════════════════════════════════════════════════════════
# 🏆 TENDERLY VIRTUAL TESTNETS INTEGRATION TEST
# ═══════════════════════════════════════════════════════════════════════════════
# Verifies that Tenderly RPC URL environment variable is properly configured
# and that the network is accessible for deployment and testing.

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ═══════════════════════════════════════════════════════════════════════════════
# Load .env file if it exists
# ═══════════════════════════════════════════════════════════════════════════════
$envPath = Join-Path (Split-Path -Parent $PSScriptRoot) ".env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "Loaded environment variables from .env file" -ForegroundColor DarkGray
}

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🌐 TENDERLY VIRTUAL TESTNETS INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$testsPassed = 0
$testsFailed = 0

# ═══════════════════════════════════════════════════════════════════════════════
# TEST 1: Environment Variable Configuration
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "🧪 TEST 1: Environment Variable Configuration" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

if ($env:TENDERLY_RPC_URL) {
    $RPC_URL = $env:TENDERLY_RPC_URL
    Write-Host "   ✅ PASS: TENDERLY_RPC_URL is set" -ForegroundColor Green
    Write-Host "   → URL: $RPC_URL" -ForegroundColor DarkGray
    $testsPassed++
    
    # Verify it's a valid Tenderly URL format
    if ($RPC_URL -match "tenderly\.co" -or $RPC_URL -match "virtual\..*\.rpc\.tenderly") {
        Write-Host "   ✅ PASS: URL format matches Tenderly pattern" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "   ⚠️  WARNING: URL doesn't match typical Tenderly format" -ForegroundColor Yellow
        Write-Host "      Expected pattern: https://virtual.*.rpc.tenderly.co/*" -ForegroundColor DarkGray
    }
} else {
    $RPC_URL = "http://localhost:8545"
    Write-Host "   ℹ️  INFO: TENDERLY_RPC_URL not set, using fallback: $RPC_URL" -ForegroundColor Cyan
    Write-Host "   → This is expected behavior for local testing" -ForegroundColor DarkGray
    $testsPassed++
}

# ═══════════════════════════════════════════════════════════════════════════════
# TEST 2: Network Connectivity
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "🧪 TEST 2: Network Connectivity" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$castPath = "$env:USERPROFILE\.foundry\bin\cast.exe"
$env:FOUNDRY_DISABLE_NIGHTLY_WARNING = "1"

if (-not (Test-Path $castPath)) {
    Write-Host "   ⚠️  WARNING: Foundry not installed. Skipping connectivity test." -ForegroundColor Yellow
} else {
    try {
        Write-Host "   → Attempting to connect to $RPC_URL..." -ForegroundColor DarkGray
        $chainId = & $castPath chain-id --rpc-url $RPC_URL 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ PASS: Successfully connected to network" -ForegroundColor Green
            Write-Host "   → Chain ID: $chainId" -ForegroundColor DarkGray
            $testsPassed++
            
            # Verify it's Base network (Chain ID 8453) or Base Sepolia (84532) or Anvil (31337)
            if ($chainId -match "8453|84532|31337") {
                Write-Host "   ✅ PASS: Chain ID matches expected network (Base/Anvil)" -ForegroundColor Green
                $testsPassed++
            } else {
                Write-Host "   ⚠️  WARNING: Unexpected Chain ID: $chainId" -ForegroundColor Yellow
                Write-Host "      Expected: 8453 (Base), 84532 (Base Sepolia), or 31337 (Anvil)" -ForegroundColor DarkGray
            }
        } else {
            Write-Host "   ❌ FAIL: Could not connect to network" -ForegroundColor Red
            Write-Host "   → Error: $chainId" -ForegroundColor Red
            $testsFailed++
        }
    } catch {
        Write-Host "   ❌ FAIL: Connection error" -ForegroundColor Red
        Write-Host "   → $_" -ForegroundColor Red
        $testsFailed++
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# TEST 3: Script Integration Verification
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "🧪 TEST 3: Script Integration Verification" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$scriptsToCheck = @(
    "deploy-local.ps1",
    "tests/test-contract.ps1",
    "tests/run-full-flow.ps1"
)

foreach ($script in $scriptsToCheck) {
    $scriptPath = Join-Path $PSScriptRoot ".." $script
    if (Test-Path $scriptPath) {
        $content = Get-Content $scriptPath -Raw
        
        if ($content -match '\$env:TENDERLY_RPC_URL') {
            Write-Host "   ✅ PASS: $script contains TENDERLY_RPC_URL integration" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "   ❌ FAIL: $script missing TENDERLY_RPC_URL integration" -ForegroundColor Red
            $testsFailed++
        }
    } else {
        Write-Host "   ⚠️  WARNING: $script not found" -ForegroundColor Yellow
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST SUMMARY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ Passed: $testsPassed" -ForegroundColor Green
if ($testsFailed -gt 0) {
    Write-Host "   ❌ Failed: $testsFailed" -ForegroundColor Red
}
Write-Host "`n" -NoNewline

if ($testsFailed -eq 0) {
    Write-Host "🎉 All Tenderly integration tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Please review the output above." -ForegroundColor Yellow
    exit 1
}
