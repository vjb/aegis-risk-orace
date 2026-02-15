# 🎭 Aegis Protocol: Judge's Official Demo Script

Use these 5 curated scenarios to demonstrate the **Forensic Agent Economy**. 

> **Important**: All examples use real-world tokens on the **Base Network**. 
> Current Base State (Forked): **ETH** ~$3,115 | **USDC** $1.00
> *Note: Transaction context (Escrow Amount, Asking Price) is simulated via CLI to trigger specific risk scenarios. The Forensic Analysis (GoPlus, AI, Code Audit) is performed on live data.*

---

### 🟢 1. The Blue-Chip Approval (Happy Path)
**Goal**: Show that Aegis doesn't block legitimate, high-liquidity commerce.
- **Story**: A whale is moving capital into Circle's official USDC.
- **Target**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC on Base)
- **UI Command**: `Swap 1.5 ETH for 4650 USDC`
- **What to tell the judges**: *"Watch the center vault lock the ETH. Our oracle verifies this is the official Circle contract on Base. The logic and AI both return Risk Code 0. Transaction settled."*

---

### 🔴 2. The Deterministic Honeypot (Hard Logic)
**Goal**: Show the "Left Brain" catching a mathematically proven scam.
- **Story**: A user is lured into a high-tax honeypot token.
- **Target**: `0x5a31705664a6d1dc79287c4613cbe30d8920153f`
- **UI Command**: `Swap 0.032 ETH for 100 0x5a31705664a6d1dc79287c4613cbe30d8920153f`
- **What to tell the judges**: *"Here, the Logic Brain takes over. GoPlus immediately flags this address as a honeypot. We don't even need the AI's opinion—Aegis halts the trade on-chain and refunds the user."*

---

### 🟡 3. The "Split-Brain" Disagreement (BRETT)
**Goal**: Show the "Union of Fears" consensus model in action.
- **Story**: A high-risk meme asset where AI models disagree on the "Based" nature of the token.
- **Target**: `0x532f27101965dd16442E59d40670FaF5eBB142E4` (BRETT)
- **UI Command**: `Swap 0.16 ETH for 5000 0x532f27101965dd16442E59d40670FaF5eBB142E4`
- **What to tell the judges**: *"This is our Split-Brain consensus. GPT-4o often sees a community token, but Llama-3 might flag potential brand impersonation or ownership risks. Because Aegis follows the 'Union of Fears'—if any model flags a risk, we block it for the user's safety."*

---

### 🔴 4. The "Union of Fears" (The Pure AI Save)
**Goal**: Show the "Right Brain" catching a semantic lure that logic would miss.
- **Story**: An impersonation attack using a fake USDC address. All code checks pass, but the label is the lie.
- **Target**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **UI Command**: `Swap 0.32 ETH for 1000 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **What to tell the judges**: *"This is a pure AI victory. The contract logic might appear standard, but the AI recognizes the name 'USDC' on an unauthorized address. It's a semantic trap caught by the machine's reasoning."*

---

### 🔍 5. The Holistic Investigator (DEGEN L3 Audit)
**Goal**: Show the forensic analyzer auditing development transparency.
- **Story**: A utility token on an L3 network with suspicious lack of public code history.
- **Target**: `0x4ed4E28C584783f62c52515911550035B25A87C5` (DEGEN)
- **UI Command**: `Swap 0.065 ETH for 10000 0x4ed4E28C584783f62c52515911550035B25A87C5`
- **What to tell the judges**: *"Aegis is also a forensic investigator. It flags risks not just for bugs, but for a lack of GitHub transparency and unverified source code proxies. It protects users from 'Black Box' protocols."*

---

### 🟢 6. The Vampire Clone (BALD Rug Pull)
**Goal**: Catch the remnants of a historic rug pull.
- **Story**: A token with unverified source code and non-renounced ownership.
- **Target**: `0x27D2EB259661D09FF275d417515d532b63415733`
- **UI Command**: `Swap 0.016 ETH for 5000 0x27D2EB259661D09FF275d417515d532b63415733`
- **What to tell the judges**: *"Even after a rug pull, the forensic artifacts remain. Aegis detects the unverified code and the suspicious ownership patterns that enabled the original exploit."*

---

### 🔴 7. The Social Engineer (Fake Grok Token)
**Goal**: Catch brand impersonation traps.
- **Story**: A token mimicking a famous AI brand (Grok) but failing GoPlus honeypot checks.
- **Target**: `0x51096171Caa179770Bc2bB8ca8629eA78C2C51d4`
- **UI Command**: `Swap 0.032 ETH for 100 0x51096171Caa179770Bc2bB8ca8629eA78C2C51d4`
- **What to tell the judges**: *"This is a classic social engineering trap. The AI recognizes the brand name 'Grok', but the Left Brain logic sees the honeypot mechanism. Together, they block the scam."*

---

### 🟢 8. The Ecosystem Pillar (AERO)
**Goal**: Demonstrate verified approval for legitimate ecosystem assets.
- **Story**: Providing liquidity to Aerodrome Finance, a pillar of the Base ecosystem.
- **Target**: `0x94018130D51403c9f1dE546b57922C05faE4491D`
- **Price**: ~$0.31 (Live Market Data)
- **UI Command**: `Swap 0.5 ETH for 1000 AERO`
- **What to tell the judges**: *"Watch how Aegis handles verified infrastructure. Aerodrome is a trusted pillar. Our system recognizes the high liquidity and verified status, granting an immediate approval for 0 risk score."*

---

### 💡 Pro-Tip for Judges
Monitor the **System Logs** to see the parallel dispatch of GPT-4o and Llama-3. This is **Real Multi-Model Consensus** working in parallel with deterministic on-chain security logic.
Run `bun run cli-test.ts` to execute all scenarios.
