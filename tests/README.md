# 🧪 Aegis Test Suite

This directory contains the verification scripts used to ensure the reliability and determinism of the Aegis Oracle.

## 1. Consensus Simulator (`simulate-consensus.ts`)
**The Holy Grail of Oracle Testing.**
- Spawns 5 independent Docker containers.
- Executes the `aegis-workflow` in each.
- Compares the hex output bit-by-bit.
- **Pass Condition**: All 5 outputs must be identical.

## 2. End-to-End Logic (`test-aegis.ps1`)
**The Scenario Runner.**
Runs the system against a battery of predetermined scenarios:
- **Pass Case**: Safe WETH trade (low volatility, high liquidity).
- **Honeypot Case**: Known malicious contract (Risk Code 16).
- **Economic Fail**: Price Manipulation attempt (Risk Code 2).
- **Combo Fail**: Multiple amber flags (Wash Trading + Volatility).

## running Tests
```bash
# Run Consensus Check
bun run simulate-consensus.ts

# Run E2E Scenarios (PowerShell)
.\test-aegis.ps1
```
