# ⚖️ Aegis Consensus Mechanism: The "Union of Fears"

> **"If one sentry sees a fire, the entire garrison wakes up."**

## The Problem: AI Non-Determinism
Aegis uses Large Language Models (LLMs) like GPT-4o and Llama-3 to detect semantic threats (phishing, impersonation). Unlike mathematical logic, LLMs are **probabilistic**.
- Node A might see "Phishing Risk" (Risk Code 256).
- Node B might see "Safe" (Risk Code 0).

Standard Oracle Networks use **Median** or **Mode** aggregation. In a 4-node network, if only 1 node detects a threat, the "Mode" result would be "Safe".
**For a security protocol, this is a failure.** We prefer false positives over false negatives.

## The Solution: Custom "Union of Fears" Strategy

Chainlink Functions provides two execution modes:
1. **Standard `Runtime` (Built-in BFT)**: Uses automated consensus (defaults to Median or Mode). This is excellent for deterministic data (prices).
2. **`NodeRuntime` (Custom Aggregation)**: Allows developers to define their own aggregation logic.

For a high-stakes Risk Oracle, we architect Aegis to use **`NodeRuntime`** with a **Bitwise OR (Union)** strategy.

### The Algorithm (Custom Aggregation)
Instead of taking the *median* numeric result or the *mode* (most common) answer, we apply a mathematical **Union**:

```typescript
FinalRisk = Node1_Risk | Node2_Risk | Node3_Risk | Node4_Risk
```

### The "Double Union" Architecture
You are correct that each node performs a "Union of Fears" internally (Logic | AI). However, for maximum security, we apply this **Recursive Strategy** at the Network Level too.

#### Layer 1: Intra-Node Union (Local)
Inside a single node, we combine Deterministic Logic and AIProbabilistic Reasoning.
`NodeResult = LogicFlags | AIFlags`

#### Layer 2: Inter-Node Union (Network)
Across the decentralized network, we combine the results of multiple independent nodes.
`FinalConsensus = NodeA_Result | NodeB_Result | NodeC_Result | NodeD_Result`

### Why Layer 2 Matters (The "Black Swan" Case)
Even with Temperature 0, AI models are non-deterministic across different hardware/regions.
*   **Node A (US-East)**: "I see Phishing." -> `Risk: 256`
*   **Node B (EU-West)**: "I see nothing." -> `Risk: 0`
*   **Node C (AP-South)**: "I see nothing." -> `Risk: 0`
*   **Node D (SA-East)**: "I see nothing." -> `Risk: 0`

**If we used Standard Consensus (Mode/Majority):**
The network would return `0` (Safe). **The threat is ignored.**

**If we use Custom Aggregation (Union):**
The network returns `256` (Phishing). **The threat is blocked.**

By using Custom Aggregation, we ensure that **if even ONE node detects a threat, the entire protocol respects it.**

## 📦 Standard "Out-of-the-Box" Options
If you strictly require **Standard Mode**, these are your options:

### Option A: `Mode` (Majority Consensus)
- **Behavior**: Returns the most common response.
- **Requirement**: **ALL** nodes must return the *exact same JSON* (byte-for-byte).
- **Constraint**: You MUST remove all non-deterministic fields (Timestamps, AI Reasoning, Logs).
- **Result**: `{"risk": 256}` (No reasoning provided).

### Option B: `Median` (Numeric Only)
- **Behavior**: Returns the median value.
- **Requirement**: Return type must be a single number.
- **Constraint**: Cannot return JSON/Objects.
- **Result**: `0` (Safe/Median of 0,0,0,256).

## ⚠️ The "Single Pipe" Architecture Constraint
You might ask: *"Can't we just send the strict Bitmap to the Contract and the loose Reasoning to the UI?"*

**No. There is only one output pipe.**
1.  The Oracle Node returns a **Single Payload**.
2.  Consensus is applied to that **Entire Payload**.
3.  If the Payload contains *any* variable data (like AI text), the **Hashes Mismatch**.
    - Node A: `Hash({risk:1, text:"foo"})` -> `0xAb...`
    - Node B: `Hash({risk:1, text:"bar"})` -> `0xCd...`
4.  **Consensus Fails**. The network returns *Nothing*.

**Conclusion**: To get rich, human-readable AI reasoning to the UI, we **MUST** use Custom Aggregation (`NodeRuntime`) to mathematically merge the differing text strings into a single agreed-upon string (e.g., by concatenation).

**Verdict**: The Standard Modes are insufficient for a *Forensic Protocol* that requires detailed reasoning and "Safety-First" alerting. We deliberately chose the Custom Path.

## 🏗️ Protocol Compliance: The "Split-Path" Architecture
To adhere to **Institutional Best Practices**, we decouple **Enforcement** (On-Chain) from **Telemetry** (Off-Chain).

### 1. Enforcement Layer (Strict Consensus)
*   **Data**: The `Risk Bitmap` (uint256).
*   **Mechanism**: **Bitwise OR (Union)** across all nodes.
*   **Output**: A single, deterministic integer.
*   **Benefit**: Extremely lightweight, deeply secure, and minimized gas costs on-chain. The Smart Contract receives *only* the final verdict.

### 2. Telemetry Layer (Rich Context)
*   **Data**: The `Reasoning String` (Human-readable text).
*   **Mechanism**: **Direct Egress (HTTP POST)** or **Runtime Logs**.
*   **Output**: Asynchronous JSON payload sent to the Aegis API/Indexer.
*   **Benefit**: The UI receives the full forensic report (pages of text) without clogging the consensus pipeline or risking BFT failure due to minor text variations.

### Updated Implementation Pattern (NodeRuntime)

```typescript
// ADVANCED CHAINLINK FUNCTIONS PATTERN: SPLIT-PATH
export const riskAssessment = {
    // ... config ...
    
    // 1. The Reporting Phase (Runs on each Node)
    handler: async (runtime, request) => {
        const result = await analyzeRisk(request);
        
        // 🚀 TELEMETRY CHANNEL: Fire-and-Forget
        // Send rich reasoning to off-chain indexer for UI consumption
        // (This does not affect consensus)
        if (runtime.config.telemetryUrl) {
           await fetch(runtime.config.telemetryUrl, {
               method: "POST",
               body: JSON.stringify({
                   node: runtime.publicKey,
                   riskScore: result.riskScore,
                   reasoning: result.reasoning
               })
           });
        }

        // 🔒 CONSENSUS CHANNEL: Strict Bitmap Only
        return { riskScore: result.riskScore }; 
    },

    // 2. The Aggregation Phase (Runs on Transmitter Node)
    // Now purely mathematical and deterministic
    aggregate: async (observations) => {
        let finalRiskBitmap = 0;
        // Simple, fast, and gas-efficient Union
        for (const obs of observations) {
            finalRiskBitmap |= obs.riskScore;
        }
        return { riskScore: finalRiskBitmap };
    }
};
```

---
