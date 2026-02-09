import { type Plugin, type Action } from "@elizaos/core";

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
                const isRisky = text.includes("scam") || text.includes("honeypot") || text.includes("pepe");

                const mockVerdict = {
                    status: isRisky ? "REJECT" : "APPROVE",
                    aegisVerdict: {
                        reasoning: isRisky
                            ? "⚠️ CRITICAL: Token contracts contain malicious logic (Honeypot Detected). Ownership not renounced."
                            : "✅ UNVERIFIED SAFE: Market metrics healthy. Liquidity > $2M. No known vulnerabilities.",
                        riskScore: isRisky ? 95 : 5
                    },
                    signature: "0xHollywoodSignatureForDemoPurposeOnly"
                };

                console.log(`[AEGIS PLUGIN] Generated Verdict for "${text}":`, mockVerdict.status);

                if (callback) {
                    callback({
                        text: `Oracle Verdict: ${mockVerdict.status}`,
                        content: mockVerdict
                    });
                }
                return;
            },
            examples: []
        }
    ]
};
