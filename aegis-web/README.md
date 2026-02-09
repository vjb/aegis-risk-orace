# 🛸 Aegis Mission Control (Frontend)

The **Aegis Mission Control** is a Next.js application that visualizes the security analysis process. It provides a "Hollywood-style" interface to demonstrate the rigorous checks performed by the Aegis Oracle.

## 🎨 The "Tri-Vector" UI
We visualize the 3-step security pipeline:
1.  **Market Data**: Verifying price stability and liquidity depth.
2.  **Security Audit**: Checking smart contract bytecode for honeypots.
3.  **AI Forensics**: Using LLMs to detect "soft" risks like social engineering and wash trading.

## 🔐 "Backend-for-Frontend" (IPFS)
To keep the Oracle consensus lightweight, we don't store text logs on-chain.
- The **Oracle** returns a minimal signature (Verdict + Risk Code).
- The **Frontend** immediately uploads the full rich-text audit log to **Pinata (IPFS)** via a secure API route (`/api/pinata`).
- This creates an immutable, public record of *why* a decision was made, without clogging the blockchain execution layer.

## 🚀 Setup
```bash
npm install
npm run dev
```
