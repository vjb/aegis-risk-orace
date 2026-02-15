# 🖥️ Aegis Mission Control: SecOps Terminal (elizaOS x Aegis)

> **"Visualize the Firewall. Monitor the Vault."**

This is the **SecOps Command Center** for the Aegis Protocol. It visualizes the parallel forensic cluster in real-time, bringing elizaOS agent logs and Chainlink oracle telemetry into a single professional dashboard.

---

## 👩‍⚖️ Judge's Guide: The High-Stakes UX

The UI is designed to prove that **money is safe**.

| Feature | Description | Component |
| :--- | :--- | :--- |
| **Dispatcher** | The Agent interface that parses user intent. | [`Chat.tsx`](src/components/Chat.tsx) |
| **Vault Lock** | Visualizes the on-chain Escrow state (`LOCKED`, `SETTLED`). | [`VaultStatus`](src/components/VaultStatus.tsx) |
| **System Logs** | Real-time telemetry from the Chainlink DON. | [`TerminalLogs`](src/components/TerminalLogs.tsx) |

---

## 🎨 Layout: Split-Screen Forensics

The Mission Control follows a three-pane "SecOps" view:

1. **Left Pane (The Dispatcher)**: "Soft" intent parsing. JARVIS provides pre-flight warnings but has no custody.
2. **Center Pane (The Vault Lock)**: The **Sovereign Executor**. It shows the movement of funds from `LOCKING` -> `AUDITING` -> `SETTLED`.
3. **Right Pane (The Matrix Logs)**: **Live Forensic Reasoning**. Displays the raw "thought process" of the AI Cluster as it analyzes enriched telemetry (Taxes, Ownership) in real-time.

### 🔒 Visualizing the "Triple Lock"
The SecOps Terminal mirrors the protocol's security phases:
1. `🔒 AUDIT INITIATED: 0x...` (Asset Frozen in Escrow)
2. `📡 DISPATCHING ORACLE REQUEST...` (Chainlink DON Signaling)
3. `🧠 AI FORENSIC CONSENSUS...` (Parallel Cluster Reasoning)
4. `✅ TRANSACTION AUTHORIZED / REJECTED` (Final Enforcement)

---

## ⚡ Getting Started

```bash
npm install
npm run dev
```

*Aegis Mission Control: Command the firewall. 🛡️💻*
