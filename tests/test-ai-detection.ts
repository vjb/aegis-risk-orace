const { execSync } = require('child_process');

/**
 * Multi-Scenario Consensus Test
 * Demonstrates AI cluster detecting both SAFE and RISKY tokens
 */

const SCENARIOS = [
    {
        name: "✅ SAFE: Trusted WETH Token",
        payload: "test-payload-pass.json",
        expectedRisk: 0,
        description: "Wrapped ETH with good liquidity"
    },
    {
        name: "🚫 RISKY: Honeypot Trap",
        payload: "test-payload-honeypot.json",
        expectedRisk: "> 0",
        description: "Token with honeypot logic detected"
    },
    {
        name: "🚫 RISKY: Suspicious Metadata",
        payload: "test-payload-suspicious.json",
        expectedRisk: "> 0",
        description: "Phishing patterns in contract"
    }
];

async function runScenario(scenario, scenarioIndex) {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`📋 SCENARIO ${scenarioIndex + 1}: ${scenario.name}`);
    console.log(`   Payload: ${scenario.payload}`);
    console.log(`   Expected: Risk Code ${scenario.expectedRisk}`);
    console.log(`${"=".repeat(70)}\n`);

    const NUM_NODES = 3;
    const outputs = [];

    for (let i = 0; i < NUM_NODES; i++) {
        process.stdout.write(`--- 🤖 Node ${i + 1} Execution --- `);
        try {
            const cmd = `docker exec aegis_dev sh -c "cd /app && cre workflow simulate ./aegis-workflow --target staging-settings --non-interactive --trigger-index 0 --http-payload /app/tests/payloads/${scenario.payload}"`;

            const result = execSync(cmd, { encoding: 'utf8' });

            if (i < NUM_NODES - 1) {
                await new Promise(r => setTimeout(r, 2000));
            }

            // Parse result
            const startTag = "::AEGIS_RESULT::";
            const startIdx = result.indexOf(startTag);
            let resultObj = { riskCode: "99", verdict: false };

            if (startIdx !== -1) {
                const endIdx = result.indexOf(startTag, startIdx + startTag.length);
                if (endIdx !== -1) {
                    let jsonStr = result.substring(startIdx + startTag.length, endIdx).trim();
                    try {
                        if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
                            jsonStr = jsonStr.slice(1, -1);
                        }
                        jsonStr = jsonStr.replace(/\\"/g, '"');
                        resultObj = JSON.parse(jsonStr);
                    } catch (e) {
                        console.error("JSON Parse Error:", e.message);
                    }
                }
            }

            const riskCode = Number(resultObj.riskCode);
            console.log(`✅ [${resultObj.verdict ? 'PASS' : 'RISK'}] RiskCode: ${riskCode}`);

            outputs.push({
                nodeIndex: i,
                riskCode: riskCode,
                verdict: resultObj.verdict
            });

        } catch (e) {
            console.error(`❌ Node ${i + 1} Failed:`, e.message);
        }
    }

    // Consensus aggregation
    console.log("\n--- ⚖️  CONSENSUS AGGREGATION (BFT) ----------------");

    if (outputs.length === 0) {
        console.error("❌ FAILURE: No nodes reported back.");
        return false;
    }

    const aggregatedRisk = outputs.reduce((acc, out) => acc | out.riskCode, 0);
    const finalVerdict = aggregatedRisk === 0;

    console.log(`   Strategy: Bitwise Union (OR) of ${outputs.length} Nodes`);
    console.log(`   Aggregated Risk Code: ${aggregatedRisk}`);
    console.log(`   Final Verdict: ${finalVerdict ? "✅ SAFE - EXECUTE TRADE" : "🚫 RISK DETECTED - BLOCK & REFUND"}`);

    const distinctCodes = new Set(outputs.map(o => o.riskCode));
    if (distinctCodes.size > 1) {
        console.log(`   ⚠️  Semantic Variance: Nodes returned [${Array.from(distinctCodes).join(', ')}]`);
        console.log(`       Union of Fears Applied: Maximum security preference.`);
    } else {
        console.log(`   ✨ Perfect Consensus (All nodes identical).`);
    }

    // Validate expectation
    const passed = scenario.expectedRisk === 0 ?
        aggregatedRisk === 0 :
        aggregatedRisk > 0;

    if (passed) {
        console.log(`\n✅ SCENARIO PASSED: AI cluster correctly ${finalVerdict ? 'approved' : 'blocked'} this token`);
    } else {
        console.log(`\n❌ SCENARIO FAILED: Expected ${scenario.expectedRisk}, got ${aggregatedRisk}`);
    }

    return passed;
}

async function main() {
    console.log("╔══════════════════════════════════════════════════════════════════╗");
    console.log("║  🛡️  AEGIS MULTI-SCENARIO CONSENSUS TEST                        ║");
    console.log("║  Demonstrates AI Cluster Detecting Both Safe & Risky Tokens     ║");
    console.log("╚══════════════════════════════════════════════════════════════════╝");

    let passCount = 0;
    let failCount = 0;

    for (let i = 0; i < SCENARIOS.length; i++) {
        const passed = await runScenario(SCENARIOS[i], i);
        if (passed) {
            passCount++;
        } else {
            failCount++;
        }

        if (i < SCENARIOS.length - 1) {
            console.log("\n⏱️  Cooling down before next scenario...\n");
            await new Promise(r => setTimeout(r, 3000));
        }
    }

    // Final report
    console.log("\n" + "=".repeat(70));
    console.log("📊 FINAL TEST REPORT");
    console.log("=".repeat(70));
    console.log(`   Scenarios Tested: ${SCENARIOS.length}`);
    console.log(`   ✅ Passed: ${passCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log("=".repeat(70));

    if (failCount === 0) {
        console.log("\n🎉 ALL SCENARIOS PASSED! AI cluster successfully detected all threats.");
        process.exit(0);
    } else {
        console.log("\n⚠️  Some scenarios failed. Review output above.");
        process.exit(1);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
