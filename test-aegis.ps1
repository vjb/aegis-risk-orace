# Aegis Risk Oracle - Test Suite (PowerShell)
# Runs all three test scenarios for demo/validation

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🛡️  AEGIS RISK ORACLE - TEST SUITE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 1: PASS Scenario
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "📊 TEST 1: PASS Scenario (USDC on Base, fair price)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
docker exec aegis_dev sh -c "cd /app && echo '/app/test-payload-pass.json' | cre workflow simulate ./aegis-workflow --target staging-settings"
Write-Host ""
Write-Host "✅ Expected: EXECUTE with risk_score < 7" -ForegroundColor Yellow
Write-Host ""

# Test 2: FAIL Scenario
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "📊 TEST 2: FAIL Scenario (Suspicious token, price manipulation)" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""
docker exec aegis_dev sh -c "cd /app && echo '/app/test-payload-fail.json' | cre workflow simulate ./aegis-workflow --target staging-settings"
Write-Host ""
Write-Host "✅ Expected: REJECT with risk_score >= 6" -ForegroundColor Yellow
Write-Host ""

# Test 3: Invalid Payload
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "📊 TEST 3: Invalid Payload (Missing required fields)" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host ""
docker exec aegis_dev sh -c "cd /app && echo '/app/test-payload-invalid.json' | cre workflow simulate ./aegis-workflow --target staging-settings"
Write-Host ""
Write-Host "✅ Expected: Validation error, REJECT with error details" -ForegroundColor Yellow
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ ALL TESTS COMPLETE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
