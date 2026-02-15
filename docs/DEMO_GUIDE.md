# 🎭 Aegis Protocol: Judge's Demo Guide (elizaOS x Chainlink)

This guide outlines the perfect demonstration sequence for the Aegis Protocol, highlighting the synergy between **Forensic Agent Intelligence** and **Chainlink Infrastructure**.

---

## 🛠️ **Demo Preparation**

1. **Environment**: Ensure your `.env` has active `OPENAI_API_KEY`, `GROQ_KEY`, and `BASESCAN_API_KEY`.
2. **Terminal 1 (Web UI)**: 
   ```bash
   cd aegis-web && npm run dev
   ```
3. **Terminal 2 (Workflow)**: 
   ```bash
   # Use this to run scenarios
   bun run aegis-workflow/demo-suite.ts
   ```

---

## 🛡️ **The 5-Scenario Forensic Audit**

We recommend running the automated suite to see the "Split-Brain" oracle in full glory.

### 🟢 **Scenario 1: The Happy Path (USDC)**
*   **Target**: Official Circle USDC on Base.
*   **Outcome**: **APPROVED**.
*   **Why**: High liquidity, reputable issuer, code verified. Shows how Aegis authorizes blue-chip assets with zero friction.

### 🔴 **Scenario 2: The Deterministic Catch (Honeypot)**
*   **Target**: Active Honeypot contract.
*   **Outcome**: **REJECTED**.
*   **Why**: The **Logic Brain** (Left Brain) catches the threat using GoPlus heuristics before the AI even needs to guess.

### 🟡 **Scenario 3: The Split-Brain (PEPE)**
*   **Target**: PEPE Meme coin.
*   **Outcome**: **REJECTED**.
*   **Why**: **Consensus Divergence**. GPT-4o sees a "Clean Community Coin", while Llama-3 flags "Legacy Branding Impersonation". Aegis follows the **Union of Fears**—if one model flags a risk, the trade is blocked.

### 🔴 **Scenario 4: The 'Union of Fears' (Fake USDC Lure)**
*   **Target**: Fake USDC Address.
*   **Outcome**: **REJECTED**.
*   **Why**: **Pure AI Brain Save!** The contract logic passes, but the AI recognizes the "USDC" label on an unauthorized address.

### 🔍 **Scenario 5: Holistic Investigator (DEGEN L3)**
*   **Target**: DEGEN (L3 Bridge).
*   **Outcome**: **REJECTED**.
*   **Why**: AI flags the **lack of GitHub transparency** and unverified source code for a high-value utility token.

---

## 📊 **Observing the Forensic Logs**

While the scenarios run, look at the **elizaOS System Logs** in the Web UI:
1. **[SYS] KEYCHAIN**: Accessing encrypted secrets via Vault DON.
2. **🧠 LEFT BRAIN**: Hard-math deterministic checks.
3. **⚡ RIGHT BRAIN**: Parallel AI Agent dispatch (GPT-4o + Llama-3).
4. **⚖️ CONSENSUS**: Bitwise Union of all fear vectors.

---

## 💡 **Key Takeaway for Judges**
Aegis doesn't just "predict" risk; it **enforces** security by locking funds in a Smart Escrow that only releases on a clean cryptographic audit from the Chainlink DON.
