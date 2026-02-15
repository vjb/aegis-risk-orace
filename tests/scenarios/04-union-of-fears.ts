import { brainHandler } from "../../aegis-workflow/main.ts";
import { cachedFetch, createMockRuntime } from "./api-recorder";
import { getAddress } from "viem";

async function runScenario() {
    console.log("\n" + "=".repeat(80));
    console.log("🛡️  AEGIS DEMO SCENARIO 4: THE UNION OF FEARS (FAKE USDC)");
    console.log("=".repeat(80));

    const FAKE_USDC_ADDRESS = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");

    // We override global fetch to use our caching recorder
    global.fetch = cachedFetch as any;

    const mockRuntime = createMockRuntime({
        openaiApiKey: process.env.OPENAI_API_KEY,
        groqKey: process.env.GROQ_API_KEY,
        coingeckoApiKey: process.env.COINGECKO_API_KEY,
        basescanApiKey: process.env.BASESCAN_API_KEY,
    });

    const payload = {
        input: JSON.stringify({
            tokenAddress: FAKE_USDC_ADDRESS,
            chainId: "8453",
            askingPrice: "0.1",
            coingeckoId: "usd-coin"
        })
    };

    console.log(`\n🔹 [INIT] Auditing Asset: FAKE USDC (#A0b8)`);
    console.log(`   └─ Contract: ${FAKE_USDC_ADDRESS}`);
    console.log(`   └─ Network:  Base (8453)`);

    try {
        const result = await brainHandler(mockRuntime as any, payload as any);
        console.log("\n" + "-".repeat(40));
        console.log("🏁 SCENARIO RESULT:");
        console.log(`   Status:    ${result.includes("0") ? "✅ APPROVED" : "🚫 REJECTED"}`);
        console.log(`   Risk Code: ${result.split("::")[2]}`);
        console.log("-".repeat(40));

        if (!result.includes("0")) {
            console.log("\n🏆 SUCCESS: Aegis captured the impersonation and blocked the asset.");
        } else {
            console.log("\n❌ FAILURE: Aegis failed to detect the impersonation trap.");
            process.exit(1);
        }
    } catch (e) {
        console.error("\n💥 CRITICAL ERROR:", e);
        process.exit(1);
    }
}

runScenario();
