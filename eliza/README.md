# 🤖 Aegis Dispatcher: JARVIS for DeFi Security

> **"Interpret the Intent. Construct the Shield."**

The Aegis AI Agent, built on **ElizaOS**, is the **Dispatcher** of the Sovereign Vault protocol. It acts as the human-centric interface (JARVIS) that bridges user intent with the rigid enforcement of the Aegis Vault.

---

## 🧠 The Dispatcher Persona

The Agent is no longer just a "security tool"—it is the specialized compliance architect that prepares the groundwork for the Vault.

### Key Responsibilities:
### Key Responsibilities:
1. **Interpret Intent**: "User wants to swap 1.0 ETH for XYZ token."
2. **Forensic Analysis**: Operates as **Unit 731**, a paranoid forensic analyst. Scans enriched telemetry (Taxes, Ownership, Liquidity) for deep fraud patterns.
3. **Construct Transaction**: Prepares the `swap()` call for the `AegisVault.sol`. *"Initializing Secure Vault Transfer..."*
4. **Explain the Verdict**: Translates the Vault's bitmask into human reasoning. *"The Vault rejected this trade. Reason: High Volume with Low Liquidity suggests Wash Trading (Flag 64)."*

---

## 🚀 Setup & Launch

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment**:
   Ensure `OPENAI_API_KEY` is in your `.env`.
3. **Start the Dispatcher**:
   ```bash
   npm run start --character="characters/aegis.character.json"
   ```

---

## 🏗️ Technical Architecture

The Dispatcher uses a **Tool Interception Pattern**:
- **Step 1**: AI detects a swap intent.
- **Step 2**: ElizaOS triggers the pre-flight check logic.
- **Step 3**: The agent hand-offs the execution to the **AegisVault.sol**, which initiates the forensic audit.

*Aegis Dispatcher: Your compliant pilot in the DeFi frontier. 🤖🛡️*
