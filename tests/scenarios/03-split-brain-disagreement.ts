import { brainHandler } from "../../aegis-workflow/main.ts";
import { cachedFetch, createMockRuntime } from "./api-recorder";
import { getAddress } from "viem";

async function runScenario() {
    console.log("\n" + "=".repeat(80));
    console.log("🛡️  AEGIS DEMO SCENARIO 3: THE SPLIT-BRAIN DISAGREEMENT (BRETT)");
    console.log("=".repeat(80));

    const BRETT_ADDRESS = getAddress("0x532f27101965dd16442E59d40670FaF5eBB142E4");

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
            tokenAddress: BRETT_ADDRESS,
            chainId: "8453",
            askingPrice: "0.1",
            coingeckoId: "brett"
        })
    };

    console.log(`\n🔹 [INIT] Auditing Asset: BRETT (#532f)`);
    console.log(`   └─ Contract: ${BRETT_ADDRESS}`);
    console.log(`   └─ Network:  Base (8453)`);

    try {
        const result = await brainHandler(mockRuntime as any, payload as any);
        console.log("\n" + "-".repeat(40));
        console.log("🏁 SCENARIO RESULT:");
        console.log(`   Status:    ${result.includes("0") ? "✅ APPROVED" : "🚫 REJECTED"}`);
        console.log(`   Risk Code: ${result.split("::")[2]}`);
        console.log("-".repeat(40));

        if (!result.includes("0")) {
            console.log("\n🏆 SUCCESS: Aegis captured the disagreement and blocked the asset.");
        } else {
            console.log("\n❌ FAILURE: Aegis failed to detect risk or reached false consensus.");
            process.exit(1);
        }
    } catch (e) {
        console.error("\n💥 CRITICAL ERROR:", e);
        process.exit(1);
    }
}

runScenario();
