# 🎭 Aegis Protocol Judge's Demo Guide

This guide outlines the perfect end-to-end demonstration sequence for the Aegis Protocol, highlighting the synergy between **Eliza Agent Intelligence** and **Chainlink Infrastructure**.

---

## 🛠️ **Demo Preparation**

Before starting, ensure all components are active:
1. Open the project in VS Code.
2. Press `Ctrl+Shift+B` and select **🚀 Launch Aegis Stack**.
3. Open the UI: [http://localhost:3005](http://localhost:3005).

---

## 🟢 **Scenario 1: The "Happy Path" (Audit Success)**
*Demonstrates: NLP Intent Parsing -> Escrow -> Chainlink CRE Oracle -> AI Assessment -> Authorized Settlement.*

1. **Clear WBTC**: `bun scripts/risk-manager.ts clear 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599`
2. **Interact**: Ask the agent: *"Swap 5 BTC for me."*
3. **Observe**:
   - Agent decodes intent and broadcasts the transaction.
   - UI shows **LOCKING ASSETS** and **AWAITING CONSENSUS**.
   - Check the **Oracle Terminal**: Watch the parallel Logic and AI flags execute.
   - UI **automatically updates** to **APPROVED** once the audit completes.

---

## 🔴 **Scenario 2: The "Circuit Breaker" (Preemptive Block)**
*Demonstrates: Real-time on-chain enforcement using the Risk Cache.*

1. **Flag WBTC**: `bun scripts/risk-manager.ts set 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599 1`
2. **Interact**: Ask the agent: *"Swap 10 btc"*
3. **Observe**:
   - The UI immediately shows **⛔ [AEGIS_REJECT]**.
   - The transaction **REVERTS** on-chain, saving gas.
   - **Important**: Note that the Oracle Terminal shows **NO EVENTS**, because the threat was stopped at the door.

---

## 🔍 **Scenario 3: Forensic Audit Transparency**
*Demonstrates: Proof of Work and "Split-Brain" diagnostic detail.*

1. Run a fresh audit for a new token (e.g., AVAX).
2. Point out the **Log Terminal** in the UI:
   - Highlight the **Logic Flags** (Deterministic risks like Honeypots).
   - Highlight the **AI Analysis** (Semantic cluster evaluating impersonation).
3. Explain that this audit trail is cryptographically signed and archived on-chain.

---

## 🔧 **Risk Management Utility**
Use the `risk-manager.ts` tool to control the demo state:

- **List Status**: `bun scripts/risk-manager.ts list`
- **Flag a Token**: `bun scripts/risk-manager.ts set <ADDRESS> 1`
- **Clear a Token**: `bun scripts/risk-manager.ts clear <ADDRESS>`

*Common Addresses:*
- **WBTC**: `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599`
- **AVAX**: `0x54251907338946759b07d61E30052a48bd4E81F4`
- **LINK**: `0x514910771AF9Ca656af840dff83E8264EcF986CA`
