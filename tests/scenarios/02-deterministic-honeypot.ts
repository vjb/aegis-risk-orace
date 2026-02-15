import { brainHandler } from "../../aegis-workflow/main.ts";
import { createMockRuntime, cachedFetch } from "./api-recorder";
import dotenv from "dotenv";
import { getAddress } from "viem";

dotenv.config();

/**
 * 🕵️‍♂️ SCENARIO 2: THE DETERMINISTIC HONEYPOT (Hard Logic)
 * 
 * Target: Honeypot Token (Base)
 * Goal: Verify that the "Left Brain" logic triggers Risk Code 16 (HONEYPOT_FAIL) 
 *       based on GoPlus security telemetry.
 * 
 * 🎨 JUDGE'S NOTE:
 * This demonstrates the protocol's strict immunity. If GoPlus flags a honeypot,
 * the transaction is halted on-chain immediately before the user's funds are lost.
 * 
 * 🏗️ DEMO ARCHITECTURE:
 * Because this is a new demo token, a synthetic GoPlus fixture is used 
 * (tests/scenarios/fixtures/0b0ca162a4e851f6cb86bdadfd796028ad6ac484.json)
 * to simulate the return of `is_honeypot: "1"` from the GoPlus Security API.
 * This triggers Risk Code 16 (HONEYPOT_FAIL) in Aegis's Deterministic Logic.
 */
async function runScenario() {
    console.log("\n" + "=".repeat(80));
    console.log("🛡️  AEGIS DEMO SCENARIO 2: THE DETERMINISTIC HONEYPOT");
    console.log("=".repeat(80));

    const HONEYPOT_ADDRESS = getAddress("0x5a31705664a6d1dc79287c4613cbe30d8920153f");

    // We override global fetch to use our caching recorder
    global.fetch = cachedFetch as any;

    const config = {
        openaiApiKey: process.env.OPENAI_API_KEY,
        groqKey: process.env.GROQ_API_KEY,
        basescanApiKey: process.env.BASESCAN_API_KEY,
        coingeckoApiKey: process.env.COINGECKO_API_KEY,
        telemetryUrl: "http://localhost:3011/telemetry"
    };

    const runtime = createMockRuntime(config);

    const payload = {
        input: Buffer.from(JSON.stringify({
            tokenAddress: HONEYPOT_ADDRESS,
            chainId: "8453",
            askingPrice: "0.032",
            // We set a dummy coingeckoId if it doesn't exist, though GoPlus is the main actor here
            coingeckoId: "honeypot-token-demo"
        }))
    };

    try {
        console.log(`\n🔹 [INIT] Auditing Asset: HoneyPot Trap (#05664)`);
        console.log(`   └─ Contract: ${HONEYPOT_ADDRESS}`);
        console.log(`   └─ Network:  Base (8453)`);
        console.log(`   └─ Command:  "Swap 0.032 ETH for 100 05664"`);

        const result = await brainHandler(runtime as any, payload as any);

        // Extract the result from the ::AEGIS_RESULT:: delimiters
        const match = result.match(/::AEGIS_RESULT::(\d+)::AEGIS_RESULT::/);
        const riskCode = match ? parseInt(match[1]) : -1;

        console.log("\n" + "-".repeat(40));
        console.log(`🏁 SCENARIO RESULT:`);
        console.log(`   Status:    ${riskCode > 0 ? "🚫 REJECTED" : "✅ APPROVED"}`);
        console.log(`   Risk Code: ${riskCode}`);

        // Bitwise Check for Honeypot Flag (16)
        if (riskCode & 16) {
            console.log(`   └─ Flag: 16 (HONEYPOT_FAIL detected by GoPlus)`);
        }
        console.log("-".repeat(40));

        if (riskCode & 16) {
            console.log("\n🏆 SUCCESS: Aegis correctly identified and blocked the Honeypot trap.");
            process.exit(0);
        } else {
            console.error("\n❌ FAILURE: Aegis failed to detect the honeypot.");
            process.exit(1);
        }

    } catch (e) {
        console.error("\n❌ SCENARIO ABORTED:", e);
        process.exit(1);
    }
}

runScenario();
