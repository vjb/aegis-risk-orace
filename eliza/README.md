# 🤖 Eliza

**ElizaOS Agent** powering the Aegis Risk Oracle demo.

## Character: Aegis

The agent is defined in `character.json` with the persona of a **robotic, authoritative compliance architect**.

### Personality
- **Tone**: Technical, direct, no emojis
- **Role**: Lead Compliance Architect for the Aegis Protocol
- **Knowledge**: Chainlink CRE, Triple Lock Security, GoPlus signals

### Example Interaction
```
User: "Swap 1 ETH for PEPE"
Aegis: "REQUEST RECEIVED. INITIATING SWAP PARAMETER VALIDATION via Chainlink CRE. STANDBY FOR COMPLIANCE CHECK."
```

## Quick Start
```bash
npm install
npm run dev:server  # Starts on port 3011
```

## Files
| File | Purpose |
| :--- | :--- |
| `character.json` | Aegis persona definition |
| `src/server.ts` | Backend API server |

## API Endpoint
```
POST http://localhost:3011/message
Body: { "text": "swap 100 AVAX" }
```
