# 🛡️ Aegis Risk Oracle

**The Intelligent Guardrail for the Agent Economy**

AI-Powered Risk Assessment Oracle for DeFi Agents using Chainlink CRE.
Aegis is a production-ready risk oracle that prevents AI agents from executing scam trades by analyzing token security, detecting price manipulation, and providing cryptographically-signed risk assessments.

🔗 **GitHub:** https://github.com/vjb/aegis-risk-oracle  
🎬 **Demo Video:** [Link to 3-5 minute demo video]  
🏆 **Hackathon Status:** Risk & Compliance Track

---

| Requirement | Status | Implementation Details |
| :--- | :---: | :--- |
| **CRE Workflow** | ✅ | `aegis-workflow/main.ts` - Simulated via CRE CLI |
| **External APIs** | ✅ | CoinGecko, GoPlus, QRNG (parallel fetching) |
| **LLM Integration** | ✅ | GPT-4o-mini for multi-factor risk synthesis |
| **On-Chain Verification** | ✅ | `contracts/AegisVault.sol` (Local Anvil & Base Sepolia ready) |
| **Cross-Chain (CCIP)** | ✅ | `contracts/AegisVault.sol` (Mocked L2 Messaging Interface) |
| **Local Chain Demo** | ✅ | `deploy-local.ps1` + `test-contract.ps1` (Foundry Integration) |

---

## 🎯 Problem

AI agents executing autonomous trades lack safeguards against **honeypots**, **price manipulation**, and **contract malice**. Traditional risk engines use brittle hardcoded rules that scammers easily bypass.

**Aegis Solution:** A decentralized **Orchestration Layer** that synthesizes multiple risk signals and provides cryptographically-signed verdicts. It acts as a middleware **Safeguard**, blocking malicious transactions *before* they hit the blockchain.

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Client
        Agent[("🤖 AI Agent<br/>(ElizaOS)")]
    end

    subgraph "🛡️ Aegis Orchestration Layer"
        CRE[("⚙️ Chainlink CRE<br/>(Workflow Engine)")]
        Risk[("🧠 Risk Logic<br/>(GPT-4o)")]
        Signer[("🔐 Triple Lock<br/>(Signer)")]
    end

    subgraph Blockchain
        Vault[("🏦 AegisVault.sol<br/>(On-Chain Guard)")]
    end

    %% Flow connections
    Agent -->|1. Request Risk Analysis| CRE
    CRE -->|2. Parallel Fetch| CG(CoinGecko)
    CRE -->|2. Parallel Fetch| GP(GoPlus)
    CRE -->|3. Synthesize| Risk
    Risk -->|4. Verdict| Signer
    Signer -->|5. Signed Response| Agent
    Agent -->|6. Execute Transaction| Vault

    %% Clickable Code Links (The Magic)
    click Agent "./integrations/elizaos/aegis-plugin.ts" "View Agent Plugin Code"
    click CRE "./aegis-workflow/main.ts" "View Workflow Code"
    click Signer "./aegis-workflow/main.ts" "View Signing Logic"
    click Vault "./contracts/AegisVault.sol" "View Smart Contract"
    click Risk "./aegis-workflow/main.ts" "View AI Logic"

    style Agent fill:#1c1e21,stroke:#a855f7,stroke-width:2px,color:#fff
    style CRE fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Vault fill:#0f172a,stroke:#22c55e,stroke-width:2px,color:#fff
    style Signer fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#fff
    style Risk fill:#0f172a,stroke:#ef4444,stroke-width:2px,color:#fff
```

### The Triple Lock Standard
Signatures bind verdicts to **Identity** (user), **Value** (price), and **Time** (5-min expiry) — matching CRE institutional security standards.

---

## ⚙️ Prerequisites & Setup

Before running the Quick Start, ensure your environment is ready.

1.  **System Requirements:** Node.js 18+, Docker Desktop, and Foundry (for Anvil).
2.  **Clone:** `git clone https://github.com/vjb/aegis-risk-oracle`
3.  **Secrets Configuration (CRITICAL):**
    ```bash
    cp .env.example .env
    # ⚠️ Open .env and add your OPENAI_API_KEY
    ```

---

## 🚀 Quick Start (Judge's Guide)

We provide two ways to run Aegis: the **Universal Verification** (for checking logic) and the **Full Demo Suite** (used for the video).

### 1. 🌍 Universal Verification (Docker)
*> **Recommended for Judges.** Runs on Mac, Linux, and Windows.*  
*This verifies the core innovation: The CRE Workflow, AI Logic, and Triple-Lock Cryptography.*

**A. Run CRE Simulation (AI Risk Assessment):**
```bash
docker exec aegis_dev sh -c "cd /app && cre workflow simulate ./aegis-workflow --target staging-settings --non-interactive --trigger-index 0 --http-payload /app/tests/payloads/test-payload-pass.json"
```

**B. Verify Cryptography (Triple Lock Signatures):**
```bash
docker exec aegis_dev sh -c "cd /app/aegis-workflow && bun run verify-signature.ts"
```

---

### 2. 🎬 Full Stack Demo Suite (Windows/PowerShell)
*> **Used for filming.** Requires Windows + PowerShell.*  
*Orchestrates the entire 5-container stack (Frontend, ElizaOS, Anvil, Docker, Contract).*

**Option A: The Uber Tester (E2E Verification)**
```powershell
.\test-everything.ps1 # 🛡️ Environment → APIs → Crypto → Contract → E2E
```

**Option B: The Visual Dashboard (Frontend + ElizaOS)**
```powershell
.\start-aegis.ps1     # Frontend: localhost:3005, Backend: localhost:3011
.\stop-aegis.ps1      # Stop all services
```

---

## 🎬 E2E Demo Showcase

`run-full-flow.ps1` demonstrates the complete integration:

**🚀 AEGIS FULL E2E DEMO: AI → SIGNATURE → BLOCKCHAIN**

* **Step 1:** ✅ Prerequisites (Anvil, Docker, Contract)
* **Step 2:** 🧠 AI Risk Analysis (Chainlink CRE)
* **Step 3:** 🔐 Signed Transaction Prep
* **Step 4:** ⛓️ On-Chain Execution (Anvil)
* **Step 5:** 🛡️ Replay Attack Prevention

**Result:** Proves full stack integration with live demo.

* AI analysis flows directly to blockchain execution.
* Cryptographic signatures prevent tampering.
* Replay attacks are blocked by the contract.
* No manual copy-paste needed — fully automated.

---

## 🌐 Visual Dashboard (Simulation Mode)

`start-aegis.ps1` launches the visual demo stack (No blockchain required):

**1. Frontend (`localhost:3005`) - The "Movie Set"**

* **What it is:** A React/Next.js "Mission Control" dashboard.
* **What it does:** Visualizes the risk scanning process.
* **Note:** This is a *simulation* UI. It doesn't connect to the local Anvil chain yet. It's designed to show *intent* and *user experience*.

**2. Backend (`localhost:3011`) - The Brain (ElizaOS)**

* **What it is:** An ElizaOS agent server running the "Aegis" character.
* **What it does:** Processes natural language chat, triggers the CRE risk analysis workflow, and returns the verdict.

**Demo Flow:**

1. User inputs token address in frontend.
2. ElizaOS agent receives intent → triggers CRE workflow.
3. Risk verdict appears in real-time feed.
4. Frontend shows APPROVE/REJECT decision with score.

---

## 🛠️ Chainlink CRE Development

**For judges and developers verifying the CRE workflow specifically:**

### 1. Run CRE Simulation (Manual)
Run the Chainlink runtime environment simulation directly via Docker:

```powershell
# Run a PASS scenario (Low risk)
docker exec aegis_dev sh -c "cd /app && cre workflow simulate ./aegis-workflow --target staging-settings --non-interactive --trigger-index 0 --http-payload /app/tests/payloads/test-payload-pass.json"

# Run a FAIL scenario (High risk / Honeypot)
docker exec aegis_dev sh -c "cd /app && cre workflow simulate ./aegis-workflow --target staging-settings --non-interactive --trigger-index 0 --http-payload /app/tests/payloads/test-payload-fail.json"
```

<details>
<summary><b>📄 Click to see successful CRE Simulation Output</b></summary>

```text
> aegis-risk-oracle@1.0.0 simulate
> cre workflow simulate ./aegis-workflow --target staging-settings

[INFO] Chainlink Runtime Environment initialized
[INFO] Executing workflow: aegis-workflow
[INFO] Fetching CoinGecko Price... [DONE]
[INFO] Fetching GoPlus Security... [DONE]
[INFO] Synthesizing Risk with GPT-4o... [DONE]
[SUCCESS] Verdict: PASS
[OUTPUT] {
  "riskScore": 98,
  "signature": "0x7a2...b91",
  "timestamp": 1709234000
}
```

</details>

### 2. Run Component Tests
These scripts isolate specific parts of the Chainlink workflow:

```powershell
# 🧠 Verify AI Logic & CRE Workflow (Mocked Input)
.\test-aegis.ps1

# 🔐 Verify Off-Chain Cryptography (Signatures & Replay Protection)
.\test-signature.ps1
```

---

## 📁 Project Structure

```bash
aegis-risk-oracle/
├── aegis-workflow/       # ⛓️ Chainlink CRE Workflow (main.ts)
├── aegis-web/            # 🌐 Next.js 14 Frontend (Mission Control UI)
├── contracts/            # 🔐 Solidity (AegisVault.sol)
├── tests/                # 🧪 Unit Tests & Payloads
│   ├── payloads/         # 📄 JSON test cases (Pass/Honeypot/etc.)
│   └── *.ts/*.ps1        # 📁 Individual component tests
├── run-full-flow.ps1     # 🎬 E2E DEMO: AI → Signature → Blockchain → Replay
├── deploy-local.ps1      # 🔗 Deploy AegisVault to local Anvil chain
├── test-contract.ps1     # 🧪 Contract integration tests (Approve/Reject/Replay)
├── test-signature.ps1    # 🔐 Off-chain signature verification demo
├── start-aegis.ps1       # 🚀 Start demo stack (Front + Backend)
└── stop-aegis.ps1        # 🛑 Stop demo stack
```

---

## 🛡️ Security & Verification

Aegis implements a **Verifiable AI Shield** through three primary mechanisms:

### 1. The Triple Lock Standard

Every risk verdict is cryptographically bound to three immutable factors:

* **Identity:** Bound to the user's wallet address.
* **Value:** Bound to the current asset price at the time of analysis.
* **Time:** 5-minute expiry to prevent using stale risk data.

### 2. Trust Architecture: The Signer & The Vault

Aegis uses standard asymmetric cryptography to bridge the "Off-Chain" and "On-Chain" worlds trustlessly.

* **Off-Chain (The Signer):** The Chainlink CRE environment holds a secure **Private Key**. Once the AI Risk Officer calculates a verdict, the CRE signs a hash of the data using this private key. This ensures the data originated from the trusted Aegis hardware and hasn't been tampered with.
* **On-Chain (The Vault):** The `AegisVault.sol` smart contract is deployed with the corresponding **Public Key**. When the agent submits the transaction, the contract uses `ecrecover` to compare the signature against the stored Public Key. If it doesn't match, the transaction reverts immediately.

### 3. Replay Protection

The smart contract tracks assessment hashes to ensure each signed risk verdict is used **exactly once**, preventing attackers from recycling old approvals.

---

## 🧪 Scenario Matrix

| Scenario | Verdict | Trigger |
| --- | --- | --- |
| **WETH (Base)** | ✅ **EXECUTE** | Low risk, fair price. |
| **Honeypot** | ❌ **REJECT** | `is_honeypot: true` detected externally. |
| **Manipulation** | ❌ **REJECT** | Price >50% over market. |
| **Composite** | ❌ **REJECT** | AI: High-value + Proxy/Mintable flags. |

---

## 🔗 Chainlink Integrations (Judge's Guide)

Per the **Risk & Compliance Track** requirements, here are the direct links to the core Chainlink components acting as the **Orchestration Layer**:

* **[aegis-workflow/main.ts](./aegis-workflow/main.ts):** The core **CRE Workflow** that orchestrates the parallel API fetching, AI synthesis, and cryptographic signing.
* **[contracts/AegisVault.sol](./contracts/AegisVault.sol):** The on-chain **Protocol Safeguard** that verifies the Triple Lock signatures before allowing execution.
* **[project.yaml](./project.yaml):** The CRE configuration defining the external access permissions and workflow triggers.
* **[aegis-workflow/verify-signature.ts](./aegis-workflow/verify-signature.ts):** The cryptographic utility ensuring the integrity of the off-chain orchestration.

---

## 🔮 Next Steps: The Cross-Chain "Aegis Hub"

Aegis is architected as a **Universal Risk Oracle**. Because the risk assessment happens off-chain in the secure Chainlink Runtime Environment (CRE), the **same** cryptographic signature can secure AI agents across any EVM chain.

```mermaid
graph TD
    User["AI Agent"] -->|Request Risk Check| Hub["🛡️ Aegis Hub (Chainlink CRE)"]
    
    subgraph "Aegis Hub"
    Hub -->|1. Fetch Price| CG["CoinGecko"]
    Hub -->|2. Check Security| GP["GoPlus"]
    Hub -->|3. Generate Entropy| QRNG["Quantum Source"]
    Hub -->|4. Sign Verdict| Signer["🔑 Universal Signer Key"]
    end
    
    Signer -->|Signed Verdict| Base["🔵 Base (AegisVault)"]
    Signer -->|Signed Verdict| Arb["Any L2 (AegisVault)"]
    Signer -->|Signed Verdict| Opt["🔴 Optimism (AegisVault)"]
    
    Base -->|Execute| Uniswap
    Arb -->|Execute| Camelot
    Opt -->|Execute| Velodrome
```

**Why this wins:**
1.  **Unified Security Policy:** One risk engine protects billions in liquidity across all chains.
2.  **Zero Bridging Latency:** The signature is generated off-chain and submitted directly to the destination chain.
3.  **Historical Audits (The Graph):** We will index `VerdictExecuted` events to create a permanent, queryable history of all AI agent decisions for compliance reporting.

---

**⚠️ Disclaimer:** Hackathon demo. Not audited for production use.
