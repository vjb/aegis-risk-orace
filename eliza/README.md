# 🤖 Aegis AI Agent (ElizaOS)

The Aegis AI Agent, built on the **ElizaOS** framework, acts as the primary user interface and conversational bridge to the Aegis Protocol.

## 🧠 AI Integration Logic

Unlike the on-chain components, the agent provides a natural language interface for users to assess risks.

- **ElizaOS Framework**: A multi-agent framework that parses user intent and manages conversational state.
- **OpenAI Tool Calling**: The agent uses GPT-4o to interpret queries. While it appears to perform real-time actions, it actually utilizes a "Tool/Action" interception pattern:
    1. The model determines a user wants to check a token.
    2. ElizaOS intercepts this "tool call."
    3. The agent triggers the **Chainlink CRE Workflow** as the source of truth for security.
- **Decoupled Architecture**: The frontend communicates with the agent via a dedicated API server. Note that while the UI visualizes these flows, the agent acts as an independent intent parser that can be integrated into Discord, Twitter (X), or Telegram.

## 🚀 Setup & Launch

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment**:
   Ensure your `.env` file in the root directory contains the `OPENAI_API_KEY`.
3. **Start the Agent**:
   ```bash
   # From the eliza/ directory
   npm run start --character="characters/aegis.character.json"
   ```

## 💡 How ElizaOS Works
ElizaOS uses a "Character" system to define personality and knowledge. In Aegis, the agent is tuned for DeFi security forensics. It doesn't just "talk"; it evaluates when to trigger the Aegis Oracle for a verifiable audit, ensuring that AI-driven advice is backed by decentralized consensus.
