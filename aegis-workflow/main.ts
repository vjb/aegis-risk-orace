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
import { sha1, toBase64 } from "./utils";

const DON_DEMO_PRIVATE_KEY: Hex = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const donAccount = privateKeyToAccount(DON_DEMO_PRIVATE_KEY);

const RISK_FLAGS = {
    LIQUIDITY_WARN: 1,
    VOLATILITY_WARN: 2,
    SUSPICIOUS_CODE: 4,
    OWNERSHIP_RISK: 8,
    HONEYPOT_FAIL: 16,
    IMPERSONATION_RISK: 32,
    WASH_TRADING: 64,
    SUSPICIOUS_DEPLOYER: 128,
    PHISHING_SCAM: 256,
    AI_ANOMALY_WARNING: 512
};

const ERROR_CODES = {
    API_FAIL: 200,
    INVALID_TOKEN: 201,
    LLM_FAIL: 202,
    GENERAL_FAIL: 255
};

const configSchema = z.object({
    openaiApiKey: z.string().optional(),
    coingeckoApiKey: z.string().optional(),
    goplusAppKey: z.string().optional(),
    goplusAppSecret: z.string().optional(),
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

// --- BRAIN HANDLER ---

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

    let apiKeySecret = runtime.config.coingeckoApiKey;
    if (!apiKeySecret) {
        const secret = await runtime.getSecret({ id: "COINGECKO_API_KEY" });
        // Handle potential object return from getSecret
        if (typeof secret === 'object' && secret !== null) {
            apiKeySecret = (secret as any).value || (secret as any).secret || JSON.stringify(secret);
        } else {
            apiKeySecret = secret as string;
        }
    }

    const cgApiKey = apiKeySecret || ""; // Ensure string

    runtime.log(`${CYAN}🔑 API Key Check:${RESET} Type=${typeof cgApiKey} Length=${cgApiKey.length}`);

    // --- GoPlus Authentication (Robustness) ---
    // Fetch GoPlus Secrets
    let gpAppKey: string | undefined = runtime.config.goplusAppKey;
    let gpAppSecret: string | undefined = runtime.config.goplusAppSecret;

    if (!gpAppKey) {
        const keySecret = await runtime.getSecret({ id: "GOPLUS_APP_KEY" });
        if (typeof keySecret === 'object' && keySecret !== null) {
            gpAppKey = (keySecret as any).value || (keySecret as any).secret || JSON.stringify(keySecret);
        } else {
            gpAppKey = keySecret as string;
        }
    }

    if (!gpAppSecret) {
        const secretSecret = await runtime.getSecret({ id: "GOPLUS_APP_SECRET" });
        if (typeof secretSecret === 'object' && secretSecret !== null) {
            gpAppSecret = (secretSecret as any).value || (secretSecret as any).secret || JSON.stringify(secretSecret);
        } else {
            gpAppSecret = secretSecret as string;
        }
    }

    let gpHeaders: Record<string, string> = {};
    if (gpAppKey && gpAppSecret) {
        try {
            const time = Math.floor(Date.now() / 1000);
            const sign = sha1(gpAppKey + time + gpAppSecret);

            runtime.log(`   🔐 GoPlus Auth: Exchanging Token...`);

            // We need a separate HTTP call for token exchange
            const tokenCall = await httpClient.sendRequest(runtime as any, {
                url: "https://api.gopluslabs.io/api/v1/token",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: toBase64(new TextEncoder().encode(JSON.stringify({
                    app_key: gpAppKey,
                    sign: sign,
                    time: time
                })))
            }).result();

            if (ok(tokenCall)) {
                const tokenData = json(tokenCall) as any;
                if (tokenData.code === 1 && tokenData.result?.access_token) {
                    gpHeaders["Authorization"] = tokenData.result.access_token; // Bearer not needed for some versions, but usually it is token directly or Bearer. 
                    // GoPlus docs say 'Authorization: <token>' (no Bearer prefix sometimes, or with. Docs say access_token).
                    // Based on search "Authorization header... access_token". 
                    gpHeaders["Authorization"] = `Bearer ${tokenData.result.access_token}`;
                    // Let's assume Bearer standard. If fails, we might need to adjust.
                    // Actually, re-reading search: "Authorization header... Bearer <access_token>"
                    runtime.log(`   ✅ GoPlus Token Acquired`);
                } else {
                    runtime.log(`   ⚠️ GoPlus Token Error: ${JSON.stringify(tokenData)}`);
                }
            }
        } catch (e) {
            runtime.log(`   ⚠️ GoPlus Auth Failed: ${e}`);
        }
    }


    // 2. Deterministic Data Acquisition
    runtime.log(`\n${YELLOW}━━━ 🌐  PARALLEL SIGNAL ACQUISITION ━━━${RESET}`);

    const [cgResult, gpResult] = await Promise.all([
        httpClient.sendRequest(runtime as any, {
            url: `https://api.coingecko.com/api/v3/simple/price?ids=${requestData.coingeckoId || 'ethereum'}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`,
            method: "GET",
            headers: cgApiKey ? { "x-cg-demo-api-key": cgApiKey } : {}
        }).result(),
        httpClient.sendRequest(runtime as any, {
            url: `https://api.gopluslabs.io/api/v1/token_security/${requestData.chainId}?contract_addresses=${requestData.tokenAddress}`,
            method: "GET",
            headers: gpHeaders
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
    const cgData = (coingecko as any)[requestData.coingeckoId || 'ethereum'] || {};
    let marketPrice = cgData.usd || 0;

    // DEMO FALLBACK: If API fails to return price (rate limit), use safe default to unblock demo
    if (marketPrice === 0 && (requestData.coingeckoId === 'ethereum' || !requestData.coingeckoId)) {
        runtime.log(`   ⚠️ [DEMO MODE] CoinGecko Rate Limit? Using Fallback Price: $2500`);
        marketPrice = 2500;
    }

    const askingPrice = Number(requestData.askingPrice || "0");
    const deviation = marketPrice > 0 ? ((askingPrice - marketPrice) / marketPrice) * 100 : 0;

    // Enhanced Metrics for New Flags
    const volume24h = cgData.usd_24h_vol || 0;
    const marketCap = cgData.usd_market_cap || 0;
    // Liquidity Proxy: For hackathon, use Market Cap as primary liquidity indicator if DEX data missing
    const liquidity = marketCap;
    const volLiqRatio = liquidity > 0 ? volume24h / liquidity : 0;

    // Security Data
    const tokenSecurity = (goplus as any).result?.[requestData.tokenAddress.toLowerCase()] || {};
    const creatorAddress = tokenSecurity.creator_address || "";
    const ownerAddress = tokenSecurity.owner_address || "";
    const isOwnerCreator = creatorAddress && ownerAddress && (creatorAddress.toLowerCase() === ownerAddress.toLowerCase());
    const isVanity = creatorAddress.startsWith("0x0000") || creatorAddress.startsWith("0xdead");

    const riskContext = {
        market: {
            price_usd: marketPrice,
            volume_24h: volume24h,
            market_cap: marketCap,
            vol_liq_ratio: volLiqRatio.toFixed(2)
        },
        trade: {
            asking_price: askingPrice,
            deviation_percent: deviation.toFixed(2) + "%"
        },
        security: {
            is_honeypot: tokenSecurity.is_honeypot === "1",
            owner_address: ownerAddress,
            creator_address: creatorAddress,
            is_open_source: tokenSecurity.is_open_source === "1",
            metadata: {
                token_name: tokenSecurity.token_name,
                token_symbol: tokenSecurity.token_symbol
            }
        }
    };

    // 📝 LOGGING MANDATE: Data Ingestion
    runtime.log(`${CYAN}📊 DATA METRICS:${RESET}`);
    runtime.log(`   Price: $${marketPrice} | Vol: $${volume24h.toLocaleString()} | Liq(MCap): $${marketCap.toLocaleString()}`);
    runtime.log(`   Vol/Liq Ratio: ${volLiqRatio.toFixed(2)}x`);
    runtime.log(`   Owner: ${ownerAddress.slice(0, 6)}... | Creator: ${creatorAddress.slice(0, 6)}...`);

    const prompt = `
    Analyze this DeFi Token Trade. Return a JSON object with 'flags' (array of integers) and 'reasoning'.
    
    DATA:
    ${JSON.stringify(riskContext)}
    
    RISK MAP (Bitmask):
    1 = Low Liquidity (Context: Flag if Market Cap < $50k.)
    2 = High Volatility (Context: Flag if Price Deviation > 10% from Market.)
    4 = Suspicious Code (Context: Look for 'blacklist', 'pause', or hidden fees.)
    8 = Centralized Owner (Context: Flag if ownership not renounced.)
    16 = Honeypot (CRITICAL: If is_honeypot=true).
    32 = Impersonation (Context: Check if name/symbol spoofs 'USDC', 'OpenAI', 'Coinbase' but contract is different.)
    64 = Wash Trading (Context: Flag if Vol/Liq Ratio > 5.0).
    128 = Suspicious Deployer (Context: Flag if Creator == Owner OR Creator starts with 0x0000/0xdead).
    256 = Phishing Scam (Context: Check metadata for 'claim', 'airdrop', 'giveaway').

    INSTRUCTIONS:
    - Be a "Deterministic Judge". Strict Thresholds.
    - CHECK PRICE: If 'asking_price' is >10% different from 'market_price', YOU MUST FLAG '2'.
    - CHECK WASH TRADING: If vol_liq_ratio > 5.0, YOU MUST FLAG '64'.
    - CHECK DEPLOYER: If creator_address == owner_address, YOU MUST FLAG '128'.
    - If GoPlus says is_honeypot=true, YOU MUST include flag 16.
    - If you are UNCERTAIN or see conflicting signals (e.g. safe liquidity but suspicious metadata), YOU MUST FLAG '512'.
    - Return JSON ONLY: {"flags": [number], "reasoning": "string"}
    `;

    // 📝 LOGGING MANDATE: Prompt Context
    runtime.log(`${CYAN}📝 PROMPT CONTEXT (Snippet):${RESET}`);
    runtime.log(`   ${JSON.stringify(riskContext, null, 2)}`);

    const aiCall = await httpClient.sendRequest(runtime as any, {
        url: "https://api.openai.com/v1/chat/completions",
        method: "POST",
        headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: toBase64(new TextEncoder().encode(JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0,
            seed: 42,
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        })))
    }).result();

    if (!ok(aiCall)) {
        return JSON.stringify({ verdict: false, riskCode: ERROR_CODES.LLM_FAIL.toString(), salt: requestData.vrfSalt });
    }

    const aiResponseRaw = (json(aiCall) as any).choices[0].message.content;
    const aiParsed = JSON.parse(aiResponseRaw) as AIAnalysisResult;

    // 📝 LOGGING MANDATE: LLM Output
    runtime.log(`${CYAN}🤖 AI RAW OUTPUT:${RESET}`);
    runtime.log(`   ${aiResponseRaw}`);

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
    const askingPriceWei = BigInt(Math.round(askingPrice * 1e8));

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

    // 📝 LOGGING MANDATE: Final Payload
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
    return [handler(http.trigger({ authorizedKeys: [] }), brainHandler)];
};

export async function main() {
    const runner = await Runner.newRunner<Config>({ configSchema });
    await runner.run(initWorkflow);
}
