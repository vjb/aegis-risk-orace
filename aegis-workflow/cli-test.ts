import { analyzeRisk } from "./main";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { getAddress } from "viem";

// Load .env from parent directory
dotenv.config({ path: resolve(__dirname, "../.env") });

const SCENARIOS = [
    {
        name: "1. THE BLUE-CHIP APPROVAL (Happy Path)",
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Official USDC
        cgId: "usd-coin",
        askingPrice: "1.00",
        description: "Official Circle USDC. Should return Risk Score 0 (Approved).",
        details: { totalEscrowValue: 4650, targetAmount: 4650 },
        expected: "APPROVE (Clear)"
    },
    {
        name: "2. THE DETERMINISTIC HONEYPOT (Hard Logic)",
        address: "0x5a31705664a6d1dc79287c4613cbe30d8920153f", // Known honeypot on Base
        cgId: "scam-token",
        askingPrice: "1.00",
        description: "A proven honeypot. Left Brain (Logic) should catch this immediately.",
        details: { totalEscrowValue: 100, targetAmount: 100 },
        expected: "REJECT (Left Brain: Value Asymmetry)"
    },
    {
        name: "3. THE SPLIT-BRAIN (BRETT / Meme Branding)",
        address: "0x532f27101965dd16442E59d40670FaF5eBB142E4", // BRETT
        cgId: "brett",
        askingPrice: "0.00003",
        description: "High-risk meme asset. AI models may disagree on risk, triggers 'Union of Fears'.",
        expected: "REJECT (Split-Brain Consensus)"
    },
    {
        name: "4. THE UNION OF FEARS (Fake USDC Lure)",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Fake USDC lure
        cgId: "usd-coin",
        askingPrice: "1.00",
        description: "Contract logic might pass, but AI should flag semantic impersonation (Right Brain victory).",
        expected: "REJECT (Right Brain: Impersonation)"
    },
    {
        name: "5. THE HOLISTIC INVESTIGATOR (DEGEN L3 Bridge Audit)",
        address: "0x4ed4E28C584783f62c52515911550035B25A87C5", // DEGEN
        cgId: "degen-base",
        askingPrice: "0.01",
        description: "Auditing development transparency. Checks for unverified proxies or suspicious metadata.",
        expected: "REJECT (Right Brain: Transparency/Code Audit)"
    },
    {
        name: "6. THE VAMPIRE CLONE (BALD Rug Pull)",
        address: "0x27D2EB259661D09FF275d417515d532b63415733",
        cgId: "bald",
        askingPrice: "0.01",
        description: "Infamous Base rug pull. AI should catch the lack of Renounced Ownership and suspicious code patterns.",
        expected: "REJECT (Forensic Ownership Audit)"
    },
    {
        name: "7. THE SOCIAL ENGINEER (Fake Grok Token)",
        address: "0x51096171Caa179770Bc2bB8ca8629eA78C2C51d4",
        cgId: "grok",
        askingPrice: "1.00",
        description: "Impersonation of a famous brand (Grok). AI flags semantic lure.",
        expected: "REJECT (Right Brain: Phishing/Impersonation)"
    },
    {
        name: "8. THE ECOSYSTEM PILLAR (AERO)",
        address: "0x94018130D51403c9f1dE546b57922C05faE4491D",
        cgId: "aerodrome-finance",
        askingPrice: "0.3147",
        description: "Official Aerodrome finance token. Trusted ecosystem pillar.",
        expected: "APPROVE (Clear)"
    }
];

async function runTests() {
    console.log("\n" + "=".repeat(120));
    console.log("   🛡️  AEGIS PROTOCOL: ADVANCED FORENSIC AUDIT REPORT");
    console.log("    Consensus: BFT Hybrid (Deterministic Logic + Multi-Model AI)");
    console.log("=".repeat(120) + "\n");

    const tableData: any[] = [];

    for (const scenario of SCENARIOS) {
        console.log(`\n▶️ [RUNNING] Scenario ${scenario.name}`);
        console.log(`[TARGET]   ${scenario.address}`);

        try {
            const result: any = await analyzeRisk({
                tokenAddress: scenario.address,
                chainId: "8453", // Base
                askingPrice: scenario.askingPrice,
                coingeckoId: scenario.cgId,
                details: scenario.details
            });

            const verdict = result.riskScore > 0 ? "🔴 REJECT" : "🟢 APPROVE";

            // Extract Logic Flags
            const logicFlagNames = result.flagBreakdown
                ?.filter((f: string) => !f.toLowerCase().includes("ai") && !f.toLowerCase().includes("anomaly"))
                .join(", ") || "None";

            // Extract AI Flags
            const aiFlagNames = result.flagBreakdown
                ?.filter((f: string) => f.toLowerCase().includes("ai") || f.toLowerCase().includes("anomaly") || f.toLowerCase().includes("impersonation") || f.toLowerCase().includes("phishing") || f.toLowerCase().includes("suspicious"))
                .join(", ") || "None";

            console.log("\n--- FORENSIC BREAKDOWN ---");
            console.log(`[LEFT BRAIN (LOGIC)]  Code: ${result.logicFlags.toString().padEnd(4)} | Flags: ${logicFlagNames}`);
            console.log(`[RIGHT BRAIN (AI)]    Code: ${result.aiFlags.toString().padEnd(4)} | Flags: ${aiFlagNames}`);
            console.log(`   └─ AI Reasoning: ${result.reasoning.substring(0, 300)}...`);

            // Prevent Rate Limiting
            await new Promise(r => setTimeout(r, 2000));

            console.log(`\n[FINAL VERDICT]     ${verdict} (Expected: ${(scenario as any).expected})`);
            console.log("-".repeat(80));

            tableData.push({
                "Scenario ID": scenario.name.split(".")[0].trim(),
                "Asset Name": scenario.name.split(".")[1].trim().split(" (")[0],
                "Left Brain Flags": logicFlagNames || "CLEAN",
                "Right Brain Flags": aiFlagNames || "CLEAN",
                "Verdict": verdict,
                "Match": (verdict.includes("REJECT") === (scenario as any).expected.includes("REJECT") || verdict.includes("APPROVE") === (scenario as any).expected.includes("APPROVE")) ? "✅" : "⚠️"
            });

        } catch (error) {
            console.error(`\n❌ [ERROR] Scenario failed:`, error);
        }
    }

    console.log("\n" + "=".repeat(120));
    console.log("   📊 FORENSIC SUMMARY TABLE");
    console.log("=".repeat(120));
    console.table(tableData);
    console.log("=".repeat(120) + "\n");
}

runTests().catch(console.error);
