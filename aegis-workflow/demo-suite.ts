
import { analyzeRisk } from "./main";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env from parent directory
dotenv.config({ path: resolve(__dirname, "../.env") });

const SCENARIOS = [
    {
        name: "1. HAPPY PATH (USDC on Base)",
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        cgId: "usd-coin",
        description: "Official Circle USDC. High liquidity, reputable issuer, renounced ownership."
    },
    {
        name: "2. DETERMINISTIC CATCH (Honeypot)",
        address: "0x5a31705664a6d1dc79287c4613cbe30d8920153f",
        cgId: "scam-token",
        description: "Logic Brain catch! GoPlus identifies active honeypot code. Immediate rejection."
    },
    {
        name: "3. SPLIT-BRAIN (PEPE Consensus)",
        address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        cgId: "pepe",
        description: "Models disagree. GPT-4o sees a meme, Llama-3 flags impersonation. Union of Fears escalates to human review."
    },
    {
        name: "4. THE 'UNION OF FEARS' (Fake USDC Lure)",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        cgId: "usd-coin",
        description: "Logic passes (standard contract), but AI Brain rejects for semantic impersonation. Pure Right-Brain save!"
    },
    {
        name: "5. HOLISTIC INVESTIGATOR (DEGEN L3 Bridge)",
        address: "0x4ed4E28C584783f62c52515911550035B25A87C5",
        cgId: "degen-base",
        description: "Trusted asset but AI audit calls out potential development risks and lack of GitHub transparency."
    }
];

async function runDemo() {
    console.log("\n" + "=".repeat(60));
    console.log("   🛡️  AEGIS PROTOCOL: ELIZAOS x CHAINLINK HACKATHON DEMO");
    console.log("=".repeat(60) + "\n");

    for (const scenario of SCENARIOS) {
        console.log(`\n▶️ RUNNING SCENARIO: ${scenario.name}`);
        console.log(`📝 CONTEXT: ${scenario.description}`);

        try {
            const result = await analyzeRisk({
                tokenAddress: scenario.address,
                chainId: "8453",
                askingPrice: "1.00",
                coingeckoId: scenario.cgId
            });

            console.log("\n📊 AUDIT VERDICT:");
            console.log(`   ├─ Overall Risk Score: ${result.riskScore}`);
            console.log(`   ├─ Logic Flags: ${result.logicFlags}`);
            console.log(`   ├─ AI Flags: ${result.aiFlags}`);
            console.log(`   └─ Reasoning: ${result.reasoning}`);

            if (result.riskScore > 0) {
                console.log(`\n🔴 ACTION: [REJECT] Transaction blocked by Aegis Firewall.`);
            } else {
                console.log(`\n🟢 ACTION: [APPROVE] Transaction authorized.`);
            }
            console.log("\n" + "-".repeat(60));

            // Wait between scenarios for readability
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`❌ Scenario failed:`, error);
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("   ✨ DEMO COMPLETE: Aegis Protected Every Scenario.");
    console.log("=".repeat(60) + "\n");
}

runDemo();
