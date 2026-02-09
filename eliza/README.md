# 🤖 Aegis ElizaOS Plugin

Integration for the **ElizaOS** agent framework. This plugin allows an autonomous AI agent to "consult" the Aegis Oracle before taking any on-chain action.

## How it Works
1.  **Intent Detection**: The agent detects a user's intent to "swap" or "invest".
2.  **Pre-Flight Check**: The agent pauses execution and calls the Aegis Plugin.
3.  **Oracle Query**: The plugin formats a request to the Chainlink DON.
4.  **Decision Gate**:
    - **Approve**: Agent proceeds with the transaction.
    - **Deny**: Agent politely refuses and explains the risk factors (cited from the Oracle's reasoning).

## Usage
Add to your Eliza character config:
```json
"plugins": ["@elizaos/plugin-aegis"],
```
