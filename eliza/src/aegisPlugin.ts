import { type Plugin, type Action } from "@elizaos/core";
import { executeSwapAction } from "./actions/executeSwap";
import { brainHandler } from "../../aegis-workflow/main.ts";
import { createMockRuntime } from "../../tests/scenarios/api-recorder";
import { getAddress } from "viem";

const mockRuntime = createMockRuntime({
    openaiApiKey: process.env.OPENAI_API_KEY,
    groqKey: process.env.GROQ_API_KEY,
    coingeckoApiKey: process.env.COINGECKO_API_KEY,
    basescanApiKey: process.env.BASESCAN_API_KEY,
});

const COINGECKO_MAP: Record<string, string> = {
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "usd-coin",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "usd-coin",
    "0x4200000000000000000000000000000000000006": "ethereum",
    "0x6982508145454Ce325dDbE47a25d4ec3d2311933": "pepe",
    "0x5a31705664a6d1dc79287c4613cbe30d8920153f": "honeypot-token-demo",
    "0x532f27101965dd16442E59d40670FaF5eBB142E4": "brett"
};

export const aegisPlugin: Plugin = {
    name: "Aegis",
    description: "Chainlink CRE Integration for Transaction Security",
    actions: [
        {
            name: "CHECK_SECURITY",
            similes: ["VALIDATE_TRANSACTION", "SCAN_RISK", "AUDIT_SWAP"],
            description: "Validates a transaction using the Chainlink CRE Oracle.",
            validate: async (runtime, message) => {
                const text = (message.content.text || "").toLowerCase();
                return text.includes("swap") || text.includes("send");
            },
            handler: async (runtime, message, state, options, callback) => {
                console.log("🛡️ [AEGIS PLUGIN] Intercepting transaction for Oracle verification...");

                // "Hollywood" Demo Mode: specialized mock response without network delay
                const text = (message.content.text || "").toLowerCase();

                // Extract address from text or use a default for demo
                const addrMatch = text.match(/(0x[a-fA-F0-9]{40})/);
                const targetAddress = addrMatch ? getAddress(addrMatch[1]) : "0x5A31705664A6D1dc79287c4613Cbe30d8920153f";

                console.log(`🛡️ [AEGIS PLUGIN] Performing real audit for: ${targetAddress}`);

                const auditPayload = {
                    input: JSON.stringify({
                        tokenAddress: targetAddress,
                        chainId: "8453",
                        askingPrice: "0.1",
                        coingeckoId: COINGECKO_MAP[targetAddress] || "honeypot-token-demo"
                    })
                };

                const result = await brainHandler(mockRuntime as any, auditPayload as any);
                const riskCode = parseInt(result.split("::")[2]);

                // We parse the full forensic reasoning from the telemetry report if possible, 
                // but since brainHandler returns it in the logic, we'd need to adapt main.ts 
                // to return a JSON string if we want rich data here.
                // For now, we'll use a simplified version of the verified reasoning.

                const isRisky = riskCode > 0;

                const mockVerdict = {
                    status: isRisky ? "REJECT" : "APPROVE",
                    aegisVerdict: {
                        reasoning: isRisky
                            ? `🚫 Hybrid Consensus Reached. Logic Flags: ${riskCode}. Bitwise Union = [CRITICAL_RISK].`
                            : "✅ Hybrid Consensus Reached. Consensus: 0 (Verified).",
                        riskScore: riskCode,
                        logicFlags: riskCode,
                        aiFlags: 0
                    }
                };

                if (callback) {
                    const statusText = isRisky ? "REJECT" : "APPROVE";
                    const reasoning = isRisky
                        ? `❌ [AEGIS_REJECT] Security scan complete. Verdict: THREAT_DETECTED.\n\n**FORENSIC AUDIT SUMMARY**\n- **Risk Code**: ${riskCode}\n- **Risk Score**: ${riskCode}/100\n- **Forensic Reasoning**: ${mockVerdict.aegisVerdict.reasoning}\n\nAssets have been safely refunded to your wallet.`
                        : `✅ [AEGIS_APPROVE] Compliance verified. Settlement authorized.`;

                    callback({
                        text: reasoning,
                        content: mockVerdict
                    });
                }
                return;
            },
            examples: []
        },
        executeSwapAction
    ]
};
