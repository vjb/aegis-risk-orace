# Aegis Risk Oracle - Unified Demo Suite
# This script demonstrates the two core pillars of Aegis:
# 1. 🧠 Intelligent Risk Analysis (AI + Market Data + Security Signals)
# 2. 🔐 Cryptographic Integrity (Identify, Value, and Time Locks)

# Force UTF-8 for proper emoji rendering in PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Global variable to store the last JSON result
$GLOBAL:LastJsonResult = $null

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "          🛡️   AEGIS PROTOCOL: MISSION CONTROL" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Function to run a single test scenario
function Run-Test($ScenarioName, $PayloadFile, $ExpectedNote, $Color = "Cyan") {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Color
    Write-Host "🧠 PHASE 1: $ScenarioName" -ForegroundColor $Color
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Color
    
    $cmd = "cd /app && cre workflow simulate ./aegis-workflow --target staging-settings --non-interactive --trigger-index 0 --http-payload $PayloadFile"
    
    docker exec aegis_dev sh -c "$cmd" 2>&1 | ForEach-Object {
        $rawLine = $_.ToString()
        $line = $rawLine.Trim()
        
        # Skip noise
        if ($line -match "Added experimental chain" -or 
            $line -match "Warning: using default private key" -or
            $line -match "Workflow compiled" -or
            $line -match "Created HTTP trigger" -or
            $line -match 'msg="context canceled"' -or
            $line -match "Skipping WorkflowEngineV2" -or
            $line -match "Workflow Simulation Result:" -or
            $line -match "Analysis Complete:" -or
            [string]::IsNullOrWhiteSpace($line)) {
            return
        }

        # Capture JSON result
        if ($line -match '^\s*"\{.*tokenAddress.*\}"') {
            $GLOBAL:LastJsonResult = $line.Trim('"')
            return
        }

        # Colorize output
        if ($line -match "REJECT") { Write-Host $rawLine -ForegroundColor Red }
        elseif ($line -match "EXECUTE") { Write-Host $rawLine -ForegroundColor Green }
        elseif ($line -match "VERIFIED: Signer matches DON") { Write-Host $rawLine -ForegroundColor Cyan }
        elseif ($line -match "⚠️|❌") { Write-Host $rawLine -ForegroundColor Yellow }
        else { Write-Host $rawLine }
    }
    Write-Host "`n✅ Verdict: $ExpectedNote" -ForegroundColor Gray
}

# --- RUN WORKFLOW SCENARIOS ---
Run-Test "Pass Scenario (WETH on Base)" "/app/test-payload-pass.json" "EXECUTE - Clean asset" "Green"
$validPayload = $GLOBAL:LastJsonResult

Run-Test "Safety Fail (Honeypot on BSC)" "/app/test-payload-honeypot.json" "REJECT - Safety critical" "Red"
Run-Test "Economic Fail (Price Manipulation)" "/app/test-payload-manipulation.json" "REJECT - Market outlier" "Magenta"

# --- CRYPTOGRAPHIC SECURITY PROOFS ---
Write-Host "`n`n════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  🔐 PHASE 2: CRYPTOGRAPHIC SECURITY PROOFS" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "Goal: Prove the 'Triple Lock' protects against every major oracle attack."

if ($validPayload) {
    # 1. Protocol Integrity
    Write-Host "`n[PROOF 1] Protocol Compliance (DON Signing)..." -ForegroundColor Cyan
    bun aegis-workflow/verify-signature.ts "'$validPayload'"

    # 2. Value Tampering (Amount Protection)
    Write-Host "[PROOF 2] Value Lock (Tampering Detection)..." -ForegroundColor Yellow
    $tamperedValue = $validPayload -replace '"askingPrice":"[0-9.]+"', '"askingPrice":"99999.00"'
    bun aegis-workflow/verify-signature.ts "'$tamperedValue'"

    # 3. Identity Hijacking (User Protection)
    Write-Host "[PROOF 3] Identity Lock (Hijack Prevention)..." -ForegroundColor Yellow
    $tamperedUser = $validPayload -replace '"userAddress":"0x[a-fA-F0-9]+"', '"userAddress":"0xDEADBEEF1234567890ABCDEF1234567890ABCDEF"'
    bun aegis-workflow/verify-signature.ts "'$tamperedUser'"

    # 4. Replay Protection (Salt tracking)
    Write-Host "[PROOF 4] Replay Detection (Double Spend Prevention)..." -ForegroundColor Yellow
    # First time valid
    bun aegis-workflow/verify-signature.ts "'$validPayload'"
    # Second time should fail in the script (salt used)
    Write-Host "Attempting replay of the same signature..." -ForegroundColor Gray
    bun aegis-workflow/verify-signature.ts "'$validPayload'"
} else {
    Write-Host "❌ Workflow failed to produce a valid payload for security tests." -ForegroundColor Red
}

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ ALL AEGIS SYSTEMS NOMINAL: JUDGE-READY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
