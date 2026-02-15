# 🧠 Aegis Dispatcher: The Digital Judge (elizaOS x Chainlink)

> **"Consensus-Driven Forensics. Deterministic Execution."**

This directory contains the **Chainlink Runtime Environment (CRE)** logic. It acts as the "Impartial Judge" that bridges real-world security metadata and parallel AI forensics (GPT-4o + Llama-3) into a single, verifiable bitmask.

---

## 👩‍⚖️ Judge's Guide: The Sovereign Oracle

The CRE logic is designed to be **Deterministic**. This means multiple nodes running slightly different AI prompts or external APIs must converge on the exact same integer result.

| Feature | Description | File Link |
| :--- | :--- | :--- |
| **Logic Brain** | Deterministic risk checks (Liquidity, Taxes, Honeypots). | [`main.ts:226`](main.ts#L226) |
| **Forensic Cluster** | Parallel AI analysis dispatch. | [`main.ts:258`](main.ts#L258) |
| **Source Fetcher** | Recursive Etherscan V2 implementation. | [`main.ts:89`](main.ts#L89) |

---

## 🌊 Data Flow Architecture: The "Split-Path" Model

The CRE orchestrates a **Parallel Execution Environment** where deterministic logic and probabilistic AI run side-by-side. We strictly decouple **Enforcement** (On-Chain) from **Telemetry** (Off-Chain).

```mermaid
graph TD
    Start([🚀 Trigger: On-Chain Event]) --> CRE[⚡ CHAINLINK RUNTIME ENVIRONMENT]
    
    subgraph "The Split-Brain Core"
        CRE -->|Dispatch| Parallel{⚡ Parallel Execution}
        
        subgraph "🧠 Left Brain (Deterministic)"
            Parallel --> Logic[Math & Security Checks]
            Logic --> Liq[Liquidity > $50k?]
            Logic --> Honey[Honeypot Check]
        end
        
        subgraph "🗣️ Right Brain (Probabilistic AI)"
            Parallel --> AI_Agent[Forensic AI Cluster]
            AI_Agent --> Fetch[📡 Fetch Source Code & Metadata]
            
            Fetch --> GPT[🤖 OpenAI GPT-4o]
            Fetch --> Llama[🦙 Groq Llama-3]
            
            GPT -->|Semantic Analysis| Risk1[Risk Flags]
            Llama -->|Adversarial Review| Risk2[Risk Flags]
        end
    end
    
    Logic -->|Bitmap A| Union(⚖️ BFT CONSENSUS: Union)
    Risk1 -->|Bitmap B| Union
    Risk2 -->|Bitmap C| Union
    
    Logic -->|Log Event| Telemetry(📡 OFF-CHAIN TELEMETRY)
    Risk1 -->|Reasoning Text| Telemetry
    Risk2 -->|Reasoning Text| Telemetry
    
    Union -->|Strict uint256| Final[🏁 Final Verdict (Smart Contract)]
    Telemetry -->|Rich JSON| Indexer[📊 Aegis API / UI]

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style CRE fill:#3b82f6,stroke:#333,stroke-width:2px,color:#fff
    style Union fill:#f59e0b,stroke:#333,stroke-width:2px,color:#000
    style Final fill:#10b981,stroke:#333,stroke-width:2px,color:#fff
    style Telemetry fill:#8b5cf6,stroke:#333,stroke-width:2px,color:#fff
```

---

## 🏛️ The "Split-Brain" Architecture

To run non-deterministic AI on a consensus network, Aegis uses a **Split-Brain Architecture**:

- **Right Brain (AI)**: Scans for fuzzy risks (Sentiment, Wash Trading, Developer History).
- **Left Brain (Logic)**: Normalizes outputs into a **Deterministic Bitmask (uint256)**.

### ⛓️ Keeping AI "On the Rails"
We enforce absolute determinism at the API and logic level:
- **Temperature 0**: Flattens the probability distribution.
- **Seed 42**: Ensures consistent sampling across different oracle nodes.
- **Source Code Forensic**: The oracle fetches real-time source code from BaseScan V2 to detect "hidden" risks.

---

## 🕸️ The Risk Bitmask Protocol

This is the standard the DON enforces:

<div style="display: flex; gap: 20px;">

| **Bit** | **Value** | **Category** | **Description** | **Source** |
| :--- | :--- | :--- | :--- | :--- |
| 0 | `1` | Liquidity | Low Liquidity (<$50k) | **Left Brain** |
| 1 | `2` | Volatility | High Volatility Spill | **Left Brain** |
| 2 | `4` | Security | Malicious Code Patterns | **Right Brain** |
| 3 | `8` | Governance | Renounced Ownership | **Left Brain** |
| 4 | `16` | Scam | Honeypot Trap Detected | **Left Brain** |

| **Bit** | **Value** | **Category** | **Description** | **Source** |
| :--- | :--- | :--- | :--- | :--- |
| 5 | `32` | Identity | Impersonation Attempt | **Right Brain** |
| 6 | `64` | Pattern | Wash Trading Detected | **Right Brain** |
| 7 | `128` | History | Suspicious Deployer | **Right Brain** |
| 8 | `256` | Metadata | Phishing Signature | **Right Brain** |
| 9 | `512` | Anomaly | AI Anomaly Detection | **Right Brain** |

</div>

---

## 🧪 Simulation

Verify the consensus logic locally:

```bash
docker exec -it aegis_dev sh
cre workflow simulate ./aegis-workflow
```

*Aegis: Forensic integrity signed by the DON ⚡*
