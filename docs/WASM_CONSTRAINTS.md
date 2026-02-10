# 💡 Developer Guide: WASM Constraints

The Aegis Risk Oracle runs inside the **Chainlink Runtime Environment (CRE)**, which uses a WASM-based execution engine (**Javy**). This environment has strict limitations:

> [!WARNING]
> New developers must adhere to these rules to avoid **WASM Panic** (unreachable instruction) or decoding errors.

1.  **NO Node.js Native Modules**: You cannot use `node:crypto`, `node:fs`, `node:path`, etc.
2.  **NO Global `Buffer`**: The `Buffer` object is not supported. Use `Uint8Array` or the provided helpers in `utils.ts`.
3.  **Use `utils.ts` for Cryptography**: We provide pure JavaScript implementations of `sha1` and `toBase64` in `aegis-workflow/utils.ts`.
4.  **HTTP Body Encoding**: All payloads must be **Base64 encoded**. Use `toBase64(new TextEncoder().encode(JSON.stringify(obj)))`.
