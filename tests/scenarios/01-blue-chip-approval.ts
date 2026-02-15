import { brainHandler } from "../../aegis-workflow/main";
import { createMockRuntime, cachedFetch } from "./api-recorder";
import dotenv from "dotenv";
import { getAddress } from "viem";

dotenv.config();

/**
 * 🕵️‍♂️ SCENARIO 1: THE BLUE-CHIP APPROVAL (Happy Path)
 * 
 * Target: USDC Official Contract (Base)
 * Goal: Verify that a legitimate, high-liquidity asset results in Risk Code 0.
 * 
 * 🎨 JUDGE'S NOTE:
 * Watch how Aegis identifies the Circle contract via BaseScan and GoPlus.
 * The AI reasoning confirms the asset's legitimacy and the final on-chain return 
 * is a deterministic '0' (Approved).
 */
async function runScenario() {
    console.log("\n" + "=".repeat(80));
    console.log("🛡️  AEGIS DEMO SCENARIO 1: THE BLUE-CHIP APPROVAL");
    console.log("=".repeat(80));

    const USDC_ADDRESS = getAddress("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");

    // We override global fetch to use our caching recorder
    global.fetch = cachedFetch as any;

    const config = {
        openaiApiKey: process.env.OPENAI_API_KEY,
        groqKey: process.env.GROQ_API_KEY,
        basescanApiKey: process.env.BASESCAN_API_KEY,
        coingeckoApiKey: process.env.COINGECKO_API_KEY,
        telemetryUrl: "http://localhost:3011/telemetry" // Side-channel
    };

    const runtime = createMockRuntime(config);

    const payload = {
        input: Buffer.from(JSON.stringify({
            tokenAddress: USDC_ADDRESS,
            chainId: "8453", // Base Mainnet
            askingPrice: "1.00",
            coingeckoId: "usd-coin"
        }))
    };

    try {
        console.log(`\n🔹 [INIT] Auditing Asset: USDC Official (Circle)`);
        console.log(`   └─ Contract: ${USDC_ADDRESS}`);
        console.log(`   └─ Network:  Base (8453)`);
        console.log(`   └─ Command:  "Swap 1.5 ETH for 4650 USDC"`);

        const result = await brainHandler(runtime as any, payload as any);

        // Extract the result from the ::AEGIS_RESULT:: delimiters
        const match = result.match(/::AEGIS_RESULT::(\d+)::AEGIS_RESULT::/);
        const riskCode = match ? parseInt(match[1]) : -1;

        console.log("\n" + "-".repeat(40));
        console.log(`🏁 SCENARIO RESULT:`);
        console.log(`   Status:    ${riskCode === 0 ? "✅ APPROVED" : "🚫 REJECTED"}`);
        console.log(`   Risk Code: ${riskCode}`);
        console.log("-".repeat(40));

        if (riskCode === 0) {
            console.log("\n🏆 SUCCESS: Aegis correctly approved the official USDC contract.");
            process.exit(0);
        } else {
            console.error("\n❌ FAILURE: Aegis flagged a legitimate blue-chip asset.");
            process.exit(1);
        }

    } catch (e) {
        console.error("\n❌ SCENARIO ABORTED:", e);
        process.exit(1);
    }
}

runScenario();
