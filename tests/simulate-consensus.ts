const { execSync } = require('child_process');

async function main() {
    console.log("⚡ STARTING CONSENSUS SIMULATION (3 NODES) ⚡");
    console.log("   Architecture: Split-Path (Strict Bitmap Consensus + Telemetry)");

    // Define Simulated Nodes with variance
    // Node 1: Detects Phishing (Risk 256) + Text
    // Node 2: Detects Nothing (Risk 0)
    // Node 3: Detects Nothing (Risk 0)
    const simulatedNodes = [
        { id: 1, riskScore: 256, reasoning: "Phishing detected in metadata." },
        { id: 2, riskScore: 0, reasoning: "No risks found." },
        { id: 3, riskScore: 0, reasoning: "Clean asset." }
    ];

    console.log("\n--- 🤖 NODE REPORTING PHASE ----------------");
    simulatedNodes.forEach(node => {
        console.log(`Node ${node.id}: Risk ${node.riskScore} | "${node.reasoning}"`);

        // 🚀 TELEMETRY SIMULATION (Fire-and-Forget)
        if (node.reasoning) {
            console.log(`   [Telemetry] 📡 Sending forensic log to Aegis Indexer...`);
        }
    });

    console.log("\n--- ⚖️  CONSENSUS AGGREGATION (ON-CHAIN) ----------------");
    console.log("   Aggregating Risk Bitmaps via Bitwise OR (Union)...");

    let finalRiskBitmap = 0;

    // STRICT CONSENSUS: Union the Bitmaps ONLY
    simulatedNodes.forEach(node => {
        finalRiskBitmap |= node.riskScore;
    });

    console.log(`\n🏁 FINAL VERDICT:`);
    console.log(`   Consensus Risk Bitmap: ${finalRiskBitmap}`);

    if (finalRiskBitmap === 0) {
        console.log(`   Action: ✅ APPROVED (Passthrough)`);
    } else {
        console.log(`   Action: 🚫 BLOCKED (Risk Detected)`);
        const labels = getRiskLabels(finalRiskBitmap);
        console.log(`   Risk Labels: ${labels.join(", ")}`);
    }

    if (finalRiskBitmap === 256) {
        console.log("\n✅ SUCCESS: The 'Union of Fears' successfully blocked the threat despite 2/3 nodes missing it.");
        process.exit(0);
    } else {
        console.error("\n❌ FAILURE: Consensus logic failed to aggregate risks.");
        process.exit(1);
    }
}

function getRiskLabels(bitmap: number): string[] {
    const labels = [];
    if (bitmap & 1) labels.push("LIQUIDITY_WARN");
    if (bitmap & 2) labels.push("VOLATILITY_WARN");
    if (bitmap & 4) labels.push("SUSPICIOUS_CODE");
    if (bitmap & 8) labels.push("OWNERSHIP_RISK");
    if (bitmap & 16) labels.push("HONEYPOT_FAIL");
    if (bitmap & 32) labels.push("IMPERSONATION_RISK");
    if (bitmap & 64) labels.push("WASH_TRADING");
    if (bitmap & 128) labels.push("SUSPICIOUS_DEPLOYER");
    if (bitmap & 256) labels.push("PHISHING_SCAM");
    if (bitmap & 512) labels.push("AI_ANOMALY");
    return labels;
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
