# 🛡️ AEGIS RISK ORACLE (Chainlink Hackathon 2026)

> **"The Deterministic Shield for DeFi."**  
> *Track: Risk & Compliance / Cross-Chain Interoperability*

Aegis is a **DeFi Safety Agent** powered by a **Decentralized Oracle Network (DON)**. It analyzes token safety using AI Forensics and Consensus Validation before allowing users to interact with contracts.

## 🚀 Key Features

### 1. 🧠 Deterministic "Split-Brain" Oracle
Aegis uses a novel **Split-Brain Architecture** to ensure non-deterministic LLMs can run on a consensus network:
- **The "Right Brain" (AI)**: Analyzes fuzzy data (Sentiment, Wash Trading patterns, Metadata).
- **The "Left Brain" (Logic)**: Normalizes outputs into a **Deterministic Bitmask** (e.g., `RiskCode: 66` = Flags 2 + 64).
- **Consensus**: 5 Nodes must agree on the exact Bitmask and Verdict to sign the transaction.

### 2. 👁️ "Tri-Vector" Forensic Scan
Before any trade is approved, Aegis runs three parallel checks:
1.  **Market Integrity**: Real-time price/liquidity analysis (via CoinGecko).
2.  **Security Audit**: Contract vulnerability scanning (via GoPlus).
3.  **AI Forensics**: GPT-4o powered semantic analysis of metadata, deployer history, and wash trading patterns.


---

## 🛠️ Architecture

```mermaid
graph TD
    User[User / Eliza Agent] -->|1. Request Audit| AEGIS_API
    AEGIS_API -->|2. Trigger Workflow| DON[Chainlink DON]
    
    subgraph "Chainlink Consensus Network"
        Node1[Node 1]
        Node2[Node 2]
        Node3[Node 3]
        Node4[Node 4]
        Node5[Node 5]
    end
    
    DON --> Node1 & Node2 & Node3 & Node4 & Node5
    
    Node1 -->|Fetch| CG[CoinGecko] & GP[GoPlus]
    Node1 -->|Analyze| GPT[OpenAI (Temp=0)]
    
    Node1 -->|3. Normalize| Bitmask[Risk Bitmask]
    
    Bitmask -->|4. Consensus| Signature[Threshold Signature]
    
    Signature -->|5. Verify| Contract[AegisVault.sol]
```

## 📦 Repository Structure

- **`aegis-workflow/`**: The Chainlink CRE/Functions code. Contains the **Deterministic AI Logic**.
- **`contracts/`**: Solidity Smart Contracts (`AegisVault.sol`) with **VRF Salt** integration.
- **`aegis-web/`**: The "Mission Control" Dashboard (Next.js) featuring the **Tri-Vector UI**.
- **`integrations/`**: Plugins for **ElizaOS** agents.
- **`tests/`**: Comprehensive Test Suite (`simulate-consensus.ts`, `test-aegis.ps1`).

---

## ⚡ Quick Start

### Prerequisites
- Node.js v20+
- Docker (for Consensus Simulation)
- Bun or pnpm

### 1. Installation
```bash
npm install
cd aegis-workflow && npm install
cd ../aegis-web && npm install
```

### 2. Run the "Mission Control" Dashboard
```bash
cd aegis-web
npm run dev
# Visit http://localhost:3000
```

### 3. Verification (The "Acid Test")
Run the Consensus Simulator to prove deterministic behavior across 5 nodes:
```bash
# Must have Docker running
npm run test:consensus
```

---

## 🏆 Hackathon Tracks
- **Risk & Compliance**: Automated fail-closed protection against Honeypots and Rugpulls.
- **Artificial Intelligence**: Bringing GPT-4o on-chain reliably using Consensus Normalization.

---

*Built with ❤️ by the Aegis Team.*
