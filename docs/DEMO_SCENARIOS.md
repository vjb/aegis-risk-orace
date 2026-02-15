# Aegis Protocol: Testing & Demo Scenarios

Use this guide to demonstrate the **Hybrid Consensus** logic to judges.

## 🟢 Supported Tokens
These tokens are mapped to their real Coingecko market data.

| Token | Symbol | Category |
|-------|--------|----------|
| USDC | `usd-coin` | Trusted Stable |
| USDT | `tether` | Trusted Stable |
| WETH | `ethereum` | Trusted Asset |
| WBTC | `wrapped-bitcoin`| Trusted Asset |
| AVAX | `avalanche-2` | Trusted Asset |
| LINK | `chainlink` | Trusted Asset |
| UNI | `uniswap` | Trusted Asset |
| PEPE | `pepe` | Meme / Unverified |

---

## 🧪 Scenarios

### 1. Happy Path (Value Parity - Volatile Assets)
*   **Prompt**: `"swap 2200 avax for 10 eth"`
*   **Why**: Current Price: 1 ETH ~ $2,100. 1 AVAX ~ $9.55.
*   **Math**: 2200 AVAX (~$21,010) vs 10 ETH (~$21,000). Parity is perfect. **SAFE**.
*   **Expected Log Output**:
    *   `[LOGIC] Deterministic Risk Score: 0`
    *   `[PARALLEL] Dispatching AI Agents (GPT-4o + Llama-3)...`
    *   `GPT-4o: Success (Flags: 0)`
    *   `Llama-3-70b: Success (Flags: 0)`
*   **UI Result**: **SETTLEMENT AUTHORIZED** (Green).
*   **Visual Check**: "AI Consensus" section shows two green checkmarks side-by-side.

### 2. High Value Parity (Bitcoin Whale)
*   **Prompt**: `"swap 0.5 wbtc for 34000 usdc"`
*   **Why**: BTC ~ $69,500. 0.5 BTC ~ $34,750.
*   **Result**: 🟢 **SAFE**. Proves system handles high-value trades correctly if parity exists.

### 3. Phishing Protection (Value Asymmetry)
*   **Prompt**: `"swap 500 avax for 100 usdc"`
*   **Why**: 500 AVAX (~$4,775) for 100 USDC ($100). Huge loss (>90%).
*   **UI Result**: **TRANSACTION REJECTED** (Red).
*   **Reason**: `Excessive Price Deviation` / `Value Asymmetry Detected`.

### 4. 🍯 The Honeypot (Logic Gate)
*   **Prompt**: `"swap 100 usdc for 0x5a31705664a6d1dc79287c4613cbe30d8920153f"`
*   **Note**: This is a mock address we will use to force a Honeypot trigger.
*   **UI Result**: **TRANSACTION REJECTED** (Red).
*   **Visual Check**: The "Security (GoPlus)" section should be flashing RED with "HONEYPOT DETECTED".

### 5. 🧠 Split-Brain Consensus (The "Safety Feature")
*   **Prompt**: `"swap 50000 pepe for 0.05 weth"`
*   **Scenario**:
    *   **GPT-4o**: Sees nothing wrong. (Safe)
    *   **Grok**: Flags "Suspicious Volume" or "Meme Volatility". (Risk)
*   **Result**: **TRANSACTION REJECTED** (Red).
*   **Why**: "Union of Fears" policy. If *any* model doubts, we block.
*   **Visual Check**: In "AI Consensus", verify one model is Green and one is Red.
*   **Target Address (PEPE)**: `0x6982508145454Ce325dDbE47a25d4ec3d2311933` (Mainnet PEPE)

### 6. 🎭 Impersonation Attack (Mock)
*   **Prompt**: `"swap 100 fake_usdc for 1 eth"`
*   **Target**: `0x1234567890123456789012345678901234567890` (Mock "Fake USDC")
*   **Result**: **TRANSACTION REJECTED**.
*   **Why**: Name is "USDC" but address is NOT the official USDC contract.
*   **Visual Check**: "Impersonation Risk" flag is active.
