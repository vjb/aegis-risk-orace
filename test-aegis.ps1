# Aegis Risk Oracle - Test Suite (Video Ready)
# This script runs all test scenarios and filters out SDK noise for a clean demo video.

# Force UTF-8 for proper emoji rendering in PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🛡️  AEGIS RISK ORACLE - TEST SUITE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Function to run a single test scenario
# It executes the CRE simulation inside the Docker container and filters the output
function Run-Test($ScenarioName, $PayloadFile, $ExpectedNote, $Color = "Cyan") {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Color
    Write-Host "📊 $ScenarioName" -ForegroundColor $Color
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Color
    
    # Run the simulation inside the docker container
    $cmd = "cd /app && cre workflow simulate ./aegis-workflow --target staging-settings --non-interactive --trigger-index 0 --http-payload $PayloadFile"
    
    # Execute and filter output
    $output = docker exec aegis_dev sh -c "$cmd" 2>&1
    
    $cleanOutput = $output | 
        Select-String -NotMatch `
            "Added experimental chain", `
            "Warning: using default private key", `
            "Workflow compiled", `
            "Created HTTP trigger", `
            "msg=`"context canceled`"", `
            "Skipping WorkflowEngineV2", `
            "Please provide JSON input", `
            "Workflow Simulation Result:", `
            "Analysis Complete:", `
            "Enter your input" |
        ForEach-Object { $_.ToString().Trim() }
    
    # Only print non-empty lines to keep it tight
    foreach ($line in $cleanOutput) {
        if ($line.Trim() -ne "") {
            Write-Host $line
        }
    }

    Write-Host "✅ Expected: $ExpectedNote" -ForegroundColor Yellow
}

# Run All Scenarios
Run-Test "TEST 1: PASS Scenario (USDC on Base, fair price)" "/app/test-payload-pass.json" "EXECUTE with risk_score < 7" "Green"
Run-Test "TEST 2: FAIL Scenario (Critical Honeypot)" "/app/test-payload-honeypot.json" "REJECT - critical safety failure" "Red"
Run-Test "TEST 3: FAIL Scenario (Price Manipulation)" "/app/test-payload-manipulation.json" "REJECT - high price deviation" "Magenta"
Run-Test "TEST 4: FAIL Scenario (Composite Risk)" "/app/test-payload-fail.json" "REJECT - multiple risk factors" "Yellow"
Run-Test "TEST 5: FAIL Scenario (Invalid Payload)" "/app/test-payload-invalid.json" "Validation error & REJECT" "Gray"

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ ALL TESTS COMPLETE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
