# 🛡️ Aegis Smart Contracts

This directory contains the Solidity smart contracts for the Aegis Protocol.

## `AegisVault.sol`
The core vault contract that holds funds and enforces Oracle-gated trading.

### Key Features
- **VRF Salt Integration**: Consumes Chainlink VRF to generate random salts, preventing replay attacks and ensuring signature uniqueness.
- **Bitmask Enforcement**: Decodes the `uint256 riskCode` to determine exactly which safety checks failed (e.g., specific error handling for "Honeypot" vs "Volatility").
- **Threshold Signature Verification**: Verifies that the payload was signed by the authorized Chainlink DON address.

## Deployment
```bash
# Deploy to Base Sepolia
npx hardhat deploy --network base_sepolia
```
