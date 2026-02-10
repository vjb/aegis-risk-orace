# 🧠 Aegis Workflow (The Technical Core)

This directory contains the **Chainlink Runtime Environment (CRE)** orchestration logic. It acts as the "Orchestrator" that bridges real-world security data, AI forensics, and on-chain execution.

## 🔑 Core Logic Implementation

### 1. Deterministic "Lock-In"
We achieve consensus on AI outputs using three primary levers:
- **Temperature: 0**: Forces the LLM to select the most probable token, eliminating stylistic variance.
- **Seed: 42**: Uses OpenAI's consistency features to ensure deterministic sampling across nodes.
- **Bitmask Normalization**: The LLM output is parsed into a **Bitmask (uint256)**. Nodes don't compare the reasoning text; they only reach consensus on the integer flags and the final boolean verdict.

### 2. The Risk Bitmask Protocol (LLM on Rails)
Risks are represented as binary flags, allowing for gas-efficient on-chain evaluation. The bitmask is signed by the DON and verified by the vault. This keeps the LLM "on the rails" by restricting its output to a defined security matrix.

| Bit | Value | Flag | Logic |
| :--- | :--- | :--- | :--- |
| 0 | 1 | `LIQUIDITY_WARN` | Liquidity < $50k or Volume/Liq ratio anomaly |
| 1 | 2 | `VOLATILITY_WARN` | 24h price deviation > 10% |
| 2 | 4 | `SUSPICIOUS_CODE` | Blacklisted functions or vulnerable patterns |
| 3 | 8 | `OWNERSHIP_RISK` | Non-renounced or suspicious owner address |
| 4 | 16 | `HONEYPOT_FAIL` | GoPlus confirmation of honeypot behavior |
| 5 | 32 | `IMPERSONATION` | Metadata scan detects brand spoofing |
| 6 | 64 | `WASH_TRADING` | Volume 24h > 5x Liquidity |
| 7 | 128 | `DEPLOYER_RISK` | Suspicious history of the deployer address |
| 8 | 256 | `PHISHING_SCAM` | Domain or contract metadata reflects scam patterns |
| 9 | 512 | `AI_ANOMALY` | Special flag for LLM-detected fuzzy risks |

### 3. Fail-Closed Resilience
If any external API (CoinGecko, GoPlus) fails or returns an error, the system injects the `AI_ANOMALY` flag and defaults to `false` (REJECT). We never certify a trade if we are blind to the security telemetry.

## 💡 Developer Guide: WASM Constraints
This workflow runs in the **Chainlink Runtime Environment (CRE)**, which uses a WASM-based execution engine (**Javy**).
> [!IMPORTANT]
> - **No Node.js Modules**: Native modules like `fs` or `crypto` are unavailable.
> - **Custom Crypto**: Use the pure JavaScript implementations in `utils.ts` for hashing.
> - **Payload Encoding**: Payloads must be **Base64 encoded** for HTTP transport.

## 🧪 Simulation
Verify the determinism and logic flow locally:
```bash
# Run the consensus simulation
bun run ../tests/simulate-consensus.ts
```
