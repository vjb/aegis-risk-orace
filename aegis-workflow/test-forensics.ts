
import { analyzeRisk } from "./main";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env from parent directory or current
dotenv.config({ path: resolve(__dirname, "../.env") });

async function runTest() {
    console.log("🧪 Starting Forensic Source Code Fetcher Test...");

    const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC is a Proxy

    // Check for API Key
    if (!process.env.BASESCAN_API_KEY || process.env.BASESCAN_API_KEY.includes("YOUR_KEY")) {
        console.warn("⚠️  WARNING: BASESCAN_API_KEY is missing or invalid in .env. Fetch validation may fail.");
    }

    try {
        const result = await analyzeRisk({
            tokenAddress: USDC_BASE,
            chainId: "8453", // Base
            askingPrice: "1.00",
            coingeckoId: "usd-coin"
        });

        console.log("\n✅ Test Complete. Result Summary:");
        console.log("------------------------------------------------");
        console.log(`Risk Score: ${result.riskScore}`);
        console.log(`Logic Flags: ${result.logicFlags}`);
        console.log(`AI Flags: ${result.aiFlags}`);
        console.log(`Reasoning: ${result.reasoning}`);

        // Inspect if code was fetched
        const snippet = result.details.code_audit?.source_snippet;
        if (snippet && snippet.length > 100 && !snippet.startsWith("Error") && !snippet.startsWith("Failed")) {
            console.log("📜 Source Code Fetched Successfully!");
            console.log(`Snippet Length: ${snippet.length} chars`);
            console.log(`Snippet Preview:\n${snippet.slice(0, 200)}...`);
        } else {
            console.log("❌ Source Code Fetch Failed or Empty.");
            console.log("Snippet:", snippet);
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

runTest();
