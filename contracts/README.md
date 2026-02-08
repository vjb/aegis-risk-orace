# 🔐 Contracts

**Solidity smart contracts** for on-chain verification of Aegis Risk Oracle verdicts.

## AegisVault.sol

The `AegisVault` contract demonstrates how AI agents can execute trades **only** when they have a valid signature from the Aegis DON.

### Key Functions

```solidity
function swapWithOracle(
    string memory token,
    uint256 amount,
    RiskAssessment memory assessment,
    bytes memory signature
) external
```

### Security Features
1. **Signature Verification** - Uses `ecrecover` to validate DON signatures
2. **Replay Protection** - Tracks processed request hashes
3. **Risk Enforcement** - Reverts if `riskScore >= 7` or `decision != "EXECUTE"`

### Triple Lock Standard
The signature binds:
- **Identity** - User address (prevents hijacking)
- **Value** - Asset price (ensures immutability)
- **Time** - 5-minute expiry (prevents replay)

## Deployment
```bash
# Deploy to Base Sepolia (example)
forge create --rpc-url $BASE_SEPOLIA_RPC AegisVault --constructor-args $DON_PUBLIC_KEY
```

## Files
| File | Purpose |
| :--- | :--- |
| `AegisVault.sol` | Main vault with signature verification |
