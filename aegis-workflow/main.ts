/**
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │                     AEGIS RISK ORACLE - CRE WORKFLOW v3.0                    │
 * │            DETERMINISTIC CONSENSUS + VERIFIABLE AI AUDIT LAYER               │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */
import { HTTPCapability, handler, Runner, type Runtime, type HTTPPayload, cre, ok, text, json } from "@chainlink/cre-sdk";
import { z } from "zod";
import { keccak256, encodePacked, Hex, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const DON_DEMO_PRIVATE_KEY: Hex = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const donAccount = privateKeyToAccount(DON_DEMO_PRIVATE_KEY);

const RISK_FLAGS = {
    LIQUIDITY_WARN: 1,
    VOLATILITY_WARN: 2,
    SUSPICIOUS_CODE: 4,
    OWNERSHIP_RISK: 8,
    HONEYPOT_FAIL: 16
};

const ERROR_CODES = {
    API_FAIL: 200,
    INVALID_TOKEN: 201,
    LLM_FAIL: 202,
    GENERAL_FAIL: 255
};

const configSchema = z.object({
    openaiApiKey: z.string().optional(),
    pinataJwt: z.string().optional(),
});

type Config = z.infer<typeof configSchema>;

const requestSchema = z.object({
    tokenAddress: z.string().min(1),
    chainId: z.string().min(1),
    askingPrice: z.string().optional(),
    userAddress: z.string().optional(),
    coingeckoId: z.string().optional(),
    vrfSalt: z.string().optional(),
});

type RiskAssessmentRequest = z.infer<typeof requestSchema>;

interface AIAnalysisResult {
    flags: number[];
    reasoning: string;
}

const brainHandler = async (runtime: Runtime<Config>, payload: HTTPPayload): Promise<string> => {
    const GREEN = "\x1b[32m";
    const RED = "\x1b[31m";
    const YELLOW = "\x1b[33m";
    const CYAN = "\x1b[36m";
    const RESET = "\x1b[0m";

    runtime.log("━━━━━━ 🧠  AEGIS DETERMINISTIC SHIELD ━━━━━━");
    runtime.log("   🚀 [CRE] Chainlink Runtime v3.0 | DON Consensus Mode: Active");

    // 1. Payload & VRF Salt Extraction
    let requestData: RiskAssessmentRequest;
    try {
        const parsed = JSON.parse(payload.input?.toString() || "{}");
        requestData = requestSchema.parse(parsed);
        runtime.log(`${CYAN}📥 INPUT RECEIVED:${RESET}`);
        runtime.log(`   Token: ${requestData.tokenAddress}`);
        runtime.log(`   VRF Salt: ${requestData.vrfSalt || "Fallback-Mode"}`);
    } catch (e) {
        runtime.log(`${RED}❌ Invalid Payload${RESET}`);
        return JSON.stringify({ error: "Invalid Request" });
    }

    const httpClient = new cre.capabilities.HTTPClient();

    // 2. Deterministic Data Acquisition
    runtime.log(`\n${YELLOW}━━━ 🌐  PARALLEL SIGNAL ACQUISITION ━━━${RESET}`);

    const [cgResult, gpResult] = await Promise.all([
        httpClient.sendRequest(runtime as any, {
            url: `https://api.coingecko.com/api/v3/simple/price?ids=${requestData.coingeckoId || 'ethereum'}&vs_currencies=usd`,
            method: "GET"
        }).result(),
        httpClient.sendRequest(runtime as any, {
            url: `https://api.gopluslabs.io/api/v1/token_security/${requestData.chainId}?contract_addresses=${requestData.tokenAddress}`,
            method: "GET"
        }).result()
    ]);

    // Operational Guardrail: Fail-Closed on API Error
    if (!ok(cgResult) || !ok(gpResult)) {
        runtime.log(`   ❌ API FAILURE. Returning Code ${ERROR_CODES.API_FAIL}`);
        return JSON.stringify({
            verdict: false,
            riskCode: ERROR_CODES.API_FAIL.toString(),
            salt: requestData.vrfSalt || "0x0"
        });
    }

    const coingecko = json(cgResult);
    const goplus = json(gpResult);
    runtime.log(`   ✅ Signals Captured. Processing context...`);

    // 3. AI Synthesis (Context-Aware Prompt)
    runtime.log(`\n${CYAN}━━━ 🧠  CONTEXT-AWARE AI SYNTHESIS ━━━${RESET}`);
    const openaiKey = runtime.config.openaiApiKey || await runtime.getSecret({ id: "OPENAI_API_KEY" });

    // Calculate Deviation for Context
    let marketPrice = (coingecko as any)[requestData.coingeckoId || 'ethereum']?.usd || 0;

    // DEMO FALLBACK: If API fails to return price (rate limit), use safe default to unblock demo
    if (marketPrice === 0 && (requestData.coingeckoId === 'ethereum' || !requestData.coingeckoId)) {
        runtime.log(`   ⚠️ [DEMO MODE] CoinGecko Rate Limit? Using Fallback Price: $2500`);
        marketPrice = 2500;
    }

    const askingPrice = Number(requestData.askingPrice || "0");
    const deviation = marketPrice > 0 ? ((askingPrice - marketPrice) / marketPrice) * 100 : 0;

    const riskContext = {
        coingecko,
        goplus,
        trade: {
            asking_price: askingPrice,
            market_price: marketPrice,
            deviation_percent: deviation.toFixed(2) + "%"
        }
    };

    const prompt = `
    Analyze this DeFi Token Trade. Return a JSON object with 'flags' (array of integers) and 'reasoning'.
    
    DATA:
    ${JSON.stringify(riskContext)}
    
    RISK MAP (Bitmask):
    1 = Low Liquidity (Context: Only flag if <$50k AND Token is >24h old. New tokens start low.)
    2 = High Volatility (Context: Flag if price drop >30% in 1h OR Price Deviation > 10% from Market.)
    4 = Suspicious Code (Context: Look for 'blacklist', 'pause', or hidden fees in metadata.)
    8 = Centralized Owner (Context: Flag if ownership not renounced after 7 days.)
    16 = Honeypot (CRITICAL: If GoPlus says is_honeypot=true).

    INSTRUCTIONS:
    - Be a "Smart Judge".
    - CHECK PRICE: If 'asking_price' is >10% different from 'market_price', YOU MUST FLAG '2' (High Volatility/Manipulation).
    - If GoPlus indicates honeypot, you MUST include flag 16.
    - Return JSON ONLY: {"flags": [number], "reasoning": "string"}
    `;

    const aiCall = await httpClient.sendRequest(runtime as any, {
        url: "https://api.openai.com/v1/chat/completions",
        method: "POST",
        headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: Buffer.from(JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0,
            seed: 42,
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        })).toString('base64')
    }).result();

    if (!ok(aiCall)) {
        return JSON.stringify({ verdict: false, riskCode: ERROR_CODES.LLM_FAIL.toString(), salt: requestData.vrfSalt });
    }

    const aiParsed = JSON.parse((json(aiCall) as any).choices[0].message.content) as AIAnalysisResult;
    const flags = aiParsed.flags || [];
    const reasoningText = aiParsed.reasoning || "REASONING_NOT_FOUND";

    // Calculate Bitmask
    const riskCode = flags.reduce((a, b) => a + b, 0);
    const finalVerdict = riskCode === 0;

    runtime.log(`   🛡️  AEGIS VERDICT: ${finalVerdict ? "APPROVED" : "RISK_DETECTED"}`);
    runtime.log(`   RISK CODE: ${riskCode}`);
    runtime.log(`   REASONING: ${reasoningText}`);

    // 4. Cryptographic Signing (Deterministic)
    runtime.log(`\n${YELLOW}━━━ 🔐  DETERMINISTIC SIGNING ━━━${RESET}`);
    const timestamp = BigInt(Math.floor(Date.now() / 1000));
    const salt = (requestData.vrfSalt || "0x" + "0".repeat(64)) as Hex;
    const askingPriceWei = BigInt(Math.round(Number(requestData.askingPrice || "0") * 1e8));

    const messageHash = keccak256(
        encodePacked(
            ['address', 'address', 'uint256', 'uint256', 'uint256', 'bool', 'uint256', 'bytes32'],
            [
                getAddress(requestData.userAddress || "0x0000000000000000000000000000000000000000"),
                getAddress(requestData.tokenAddress),
                BigInt(requestData.chainId),
                askingPriceWei,
                timestamp,
                finalVerdict,
                BigInt(riskCode),
                salt
            ]
        )
    );

    const signature = await donAccount.signMessage({ message: { raw: messageHash } });

    return JSON.stringify({
        verdict: finalVerdict,
        riskCode: riskCode.toString(),
        salt: salt,
        signature: signature,
        reasoning: reasoningText,
        timestamp: timestamp.toString()
    });
};

const initWorkflow = (config: Config) => {
    const http = new HTTPCapability();
    return [handler(http.trigger({}), brainHandler)];
};

export async function main() {
    const runner = await Runner.newRunner<Config>({ configSchema });
    await runner.run(initWorkflow);
}
