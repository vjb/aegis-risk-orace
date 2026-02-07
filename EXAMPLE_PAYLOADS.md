# Aegis Risk Oracle - Example Payloads

## Payload Schema

```typescript
interface RiskAssessmentRequest {
    tokenAddress: string;      // Token contract address to analyze
    chainId: string;            // Chain ID (1=Ethereum, 56=BSC, 8453=Base, etc.)
    askingPrice?: string;       // Optional: Trade price to compare against market
    amount?: string;            // Optional: Trade amount for context
    userAddress?: string;       // Optional: User address for compliance
}
```

## Example 1: PASS - Safe Trade

**File:** `test-payload-pass.json`

```json
{
  "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "chainId": "8453",
  "askingPrice": "2050.00",
  "amount": "1000000000",
  "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Why it passes:**
- ✅ USDC on Base (trusted stablecoin)
- ✅ Asking price ~$2050 is close to ETH market price (~$2040)
- ✅ Not a honeypot
- ✅ Well-known token address

**Expected AI Response:**
```json
{
  "risk_score": 1-3,
  "decision": "EXECUTE",
  "reasoning": "USDC is a trusted stablecoin, not a honeypot, asking price within reasonable range"
}
```

## Example 2: FAIL - Suspicious Trade

**File:** `test-payload-fail.json`

```json
{
  "tokenAddress": "0x0000000000000000000000000000000000000001",
  "chainId": "56",
  "askingPrice": "5000.00",
  "amount": "1000000000",
  "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Why it fails:**
- ⚠️ Suspicious token address (burn address)
- ⚠️ Asking price $5000 is 2.4x market price (~$2040)
- ⚠️ Likely scam/honeypot
- ⚠️ Unknown token on BSC

**Expected AI Response:**
```json
{
  "risk_score": 8-10,
  "decision": "REJECT",
  "reasoning": "Asking price significantly exceeds market price (2.4x), suspicious token address, potential honeypot scam"
}
```

## Testing

```bash
# Test PASS scenario
docker exec aegis_dev sh -c "cat test-payload-pass.json | cre workflow simulate ./aegis-workflow --target staging-settings"

# Test FAIL scenario  
docker exec aegis_dev sh -c "cat test-payload-fail.json | cre workflow simulate ./aegis-workflow --target staging-settings"
```

## Chain IDs Reference

- `1` - Ethereum Mainnet
- `56` - BSC (Binance Smart Chain)
- `137` - Polygon
- `8453` - Base
- `42161` - Arbitrum
- `10` - Optimism
