# Aegis Protocol: Curated Demo Scenarios

Use this guide to understand the **Forensic Heuristics** used by the Aegis Oracle Cluster. These scenarios are implemented in `demo-suite.ts` and `main.ts`.

---

## 🟢 Scenario 1: The Happy Path (USDC)
*   **Target Asset**: Official USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`).
*   **Forensic Trigger**: Automated "Blue Chip" verification.
*   **Outcome**: **APPROVED** (Risk Code 0).
*   **Analysis**:
    - **Logic Brain**: Detects high liquidity and renounced owner.
    - **AI Brain**: Verifies the name "USD Coin" matches the authorized address.

## 🔴 Scenario 2: Deterministic Catch (Honeypot)
*   **Target Asset**: Mock Honeypot (`0x5a31...153f`).
*   **Forensic Trigger**: GoPlus `is_honeypot: "1"` flag.
*   **Outcome**: **REJECTED** (Risk Code 16).
*   **Analysis**:
    - **Logic Brain**: Immediate trigger on the honeypot flag. AI analysis acts as secondary verification but logic is sufficient for rejection.

## 🟡 Scenario 3: Split-Brain Consensus (PEPE)
*   **Target Asset**: PEPE (`0x6982...1933`).
*   **Forensic Trigger**: Model Disagreement.
*   **Outcome**: **REJECTED** (Union of Fears).
*   **Analysis**:
    - **GPT-4o**: Views it as a "Legitimate community-driven meme asset."
    - **Llama-3**: Flags "Potential impersonation of legacy branding."
    - **Result**: The **Union of Fears** policy blocks the trade because the cluster is not in full agreement.

## 🔴 Scenario 4: The 'Union of Fears' (Fake USDC Lure)
*   **Target Asset**: Fake USDC (`0xA0b8...B48`).
*   **Forensic Trigger**: Semantic Impersonation.
*   **Outcome**: **REJECTED** (Risk Code 32 + 256).
*   **Analysis**:
    - **Logic Brain**: Passes (standard ERC20 code).
    - **AI Brain**: REJECTS. Detects that the name "USDC" is used on an address that does not match the official registry. This is a pure AI "save."

## 🔍 Scenario 5: Holistic Investigator (DEGEN)
*   **Target Asset**: DEGEN (`0x4ed4...87C5`).
*   **Forensic Trigger**: Transparency Audit.
*   **Outcome**: **REJECTED** (Risk Code 4 + 8).
*   **Analysis**:
    - **AI Brain**: Flags "High-risk black box" due to unverified source code and lack of GitHub links for a high-value utility token.
