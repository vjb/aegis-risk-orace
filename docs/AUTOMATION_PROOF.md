# Chainlink Automation Integration - Proof of Concept

## Overview
Aegis implements **Chainlink Automation** for preemptive risk blocking, allowing the protocol to update the risk cache automatically without waiting for user transactions.

## Implementation

### Smart Contract Integration
**File**: [`contracts/AegisVault.sol:159-163`](../contracts/AegisVault.sol)

```solidity
/**
 * @notice Chainlink Automation Hook
 * Allows Chainlink Automation to update risk levels without a user trade trigger.
 */
function updateRiskCache(address token, uint256 riskCode) external {
    require(msg.sender == owner(), "Unauthorized: Only Automation or Owner");
    riskCache[token] = riskCode;
    emit RiskCacheUpdated(token, riskCode);
}
```

### How It Works

1. **Preemptive Scanning**: Chainlink Automation nodes periodically call `updateRiskCache()` to flag high-risk tokens
2. **Risk Cache**: Maintains a persistent registry mapping `address => uint256` risk codes
3. **Automatic Blocking**: When a user attempts to swap, the `swap()` function checks the cache first:

```solidity
function swap(address token, uint256 amount) external payable whenNotPaused {
    require(msg.value == amount, "Aegis: Incorrect escrow amount");

    // PREEMPTIVE CHECK: Chainlink Automation Blacklist
    if (riskCache[token] != 0) {
         revert("Aegis: Token blacklisted by preemptive Automation");
    }
    // ... rest of swap logic
}
```

## Access Control

Currently configured for **owner-only** access for local testing:
```solidity
require(msg.sender == owner(), "Unauthorized: Only Automation or Owner");
```

**Production Deployment**: Replace with Chainlink Automation Forwarder address:
```solidity
require(msg.sender == owner() || msg.sender == automationForwarder, "Unauthorized");
```

## Risk Code Bitmask

The `riskCode` parameter uses the same bitmask protocol as the CRE workflow:

| Risk Flag | Bit Value | Description |
|-----------|-----------|-------------|
| `LIQUIDITY_WARN` | 1 | Low liquidity detected |
| `VOLATILITY_WARN` | 2 | High price volatility |
| `SUSPICIOUS_CODE` | 4 | Contract code anomalies |
| `OWNERSHIP_RISK` | 8 | Centralized control detected |
| `HONEYPOT_FAIL` | 16 | Cannot sell token |
| `IMPERSONATION_RISK` | 32 | Fake token detected |
| `WASH_TRADING` | 64 | Artificial volume |
| `SUSPICIOUS_DEPLOYER` | 128 | Deployer linked to scams |
| `PHISHING_SCAM` | 256 | Known phishing contract |
| `AI_ANOMALY_WARNING` | 512 | AI detected unusual patterns |

**Any non-zero value = BLOCKED**

## Testing
### Manual Test
```bash
# 1. Deploy contracts
./deploy-local.ps1

# 2. Simulate Automation update (as owner)
cast send <VAULT_ADDRESS> "updateRiskCache(address,uint256)" \
  0x0000000000000000000000000000000000000BAD \
  16 \
  --rpc-url http://localhost:8545 \
  --private-key <OWNER_KEY>

# 3. Try to swap the blacklisted token (should revert)
cast send <VAULT_ADDRESS> "swap(address,uint256)" \
  0x0000000000000000000000000000000000000BAD \
  1000000000000000000 \
  --value 1000000000000000000 \
  --rpc-url http://localhost:8545

# Expected: Transaction reverts with "Token blacklisted by preemptive Automation"
```

## Event Emission
When the risk cache is updated, the contract emits:
```solidity
event RiskCacheUpdated(address indexed token, uint256 riskCode);
```

This allows off-chain monitoring and analytics dashboards to track automated interventions.

## Benefits for Risk & Compliance Track

1. **Proactive Protection**: Blocks risky tokens *before* users attempt trades
2. **Continuous Monitoring**: Automation runs 24/7 without manual intervention  
3. **Gas Efficiency**: Updating cache is cheaper than running full analysis on every trade
4. **Composability**: Any external oracle or AI service can trigger updates via Automation
5. **Audit Trail**: All cache updates are logged on-chain via events

## Production Roadmap

- [ ] Deploy Automation Upkeep contract
- [ ] Configure keeper network with upkeep parameters
- [ ] Integrate with Chainlink Price Feeds for volatility detection
- [ ] Add time-based cache expiry (auto-clear after X blocks)
- [ ] Implement multi-sig for manual overrides
