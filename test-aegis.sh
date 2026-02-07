#!/bin/bash
# Aegis Risk Oracle - Test Suite
# Runs all three test scenarios for demo/validation

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  🛡️  AEGIS RISK ORACLE - TEST SUITE"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Test 1: PASS Scenario
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST 1: PASS Scenario (USDC on Base, fair price)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo '/app/test-payload-pass.json' | cre workflow simulate ./aegis-workflow --target staging-settings
echo ""
echo "✅ Expected: EXECUTE with risk_score < 7"
echo ""

# Test 2: FAIL Scenario
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST 2: FAIL Scenario (Suspicious token, price manipulation)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo '/app/test-payload-fail.json' | cre workflow simulate ./aegis-workflow --target staging-settings
echo ""
echo "✅ Expected: REJECT with risk_score >= 6"
echo ""

# Test 3: Invalid Payload
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST 3: Invalid Payload (Missing required fields)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo '/app/test-payload-invalid.json' | cre workflow simulate ./aegis-workflow --target staging-settings
echo ""
echo "✅ Expected: Validation error, REJECT with error details"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "  ✅ ALL TESTS COMPLETE"
echo "════════════════════════════════════════════════════════════════"
