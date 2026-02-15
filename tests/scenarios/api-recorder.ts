import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import crypto from "crypto";
// 🔥 PATCH CRE SDK to use our recorder
import { cre } from "../../aegis-workflow/node_modules/@chainlink/cre-sdk";

const CACHE_DIR = join(process.cwd(), "tests", "scenarios", "fixtures");
const originalFetch = global.fetch;

if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
}

function wrapResponse(data: any, ok: boolean = true, status: number = 200) {
    return {
        ok,
        status,
        json: () => data,
        text: () => typeof data === 'string' ? data : JSON.stringify(data),
        headers: new Headers(),
    };
}

(cre.capabilities as any).HTTPClient = class MockHTTPClient {
    sendRequest(runtime: any, payload: any) {
        return {
            result: async () => {
                return await cachedFetch(payload.url, payload);
            }
        };
    }
    fetch(url: string, options: any = {}) {
        return cachedFetch(url, options);
    }
};

/**
 * 🕵️‍♂️ AEGIS API RECORDER
 * 
 * Intercepts API calls and caches responses to avoid 429 Rate Limits.
 * Useful for Hackathon demos where repeated testing is required.
 */
export async function cachedFetch(url: string, options: any = {}): Promise<any> {
    const isPost = options.method === "POST";
    const body = options.body ? JSON.stringify(options.body) : "";

    const hashInput = `${options.method || "GET"}:${url}:${body}`;
    const hash = crypto.createHash("sha1")
        .update(hashInput)
        .digest("hex");

    const cacheFile = join(CACHE_DIR, `${hash}.json`);
    const exists = existsSync(cacheFile);
    console.log(`   [RECORDER] Hashing: "${hashInput}" -> ${hash}`);
    console.log(`   [RECORDER] Cache File Path: ${cacheFile} (Exists: ${exists})`);

    // 🏎️ CACHE HIT: Return the previously saved response
    if (exists) {
        try {
            const data = JSON.parse(readFileSync(cacheFile, "utf-8"));
            console.log(`   [RECORDER] Cache Hit: ${hash}.json`);
            return wrapResponse(data);
        } catch (e: any) {
            console.error(`   [RECORDER] Cache Read Error: ${e.message}`);
        }
    }

    // 📡 PASS-THROUGH: Local Telemetry
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
        return originalFetch(url, options);
    }

    // 📡 CACHE MISS: Fetch from network and save
    console.log(`   [RECORDER] Cache Miss: ${url.substring(0, 50)}...`);
    try {
        const response = await originalFetch(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`   [RECORDER] API Request Failed: ${response.status} ${url.substring(0, 30)}...`);
            return wrapResponse({ error: errorText }, false, response.status);
        }

        const data = await response.json();

        // Save to disk for next time
        writeFileSync(cacheFile, JSON.stringify(data, null, 2));
        return wrapResponse(data);
    } catch (e: any) {
        console.error(`   [RECORDER] Fetch Error: ${e.message} for ${url.substring(0, 30)}...`);
        throw e;
    }
}

/**
 * 🛠️ MOCK RUNTIME
 * A runtime shim that handles Chainlink cre-sdk capability calls.
 */
export const createMockRuntime = (config: any) => ({
    config,
    log: (msg: string) => console.log(msg),
    // This is what the cre-sdk internally calls
    callCapability: (args: any) => {
        const payload = args.payload || args;
        return {
            result: async () => {
                return await cachedFetch(payload.url, payload);
            }
        };
    },
    // For direct use if needed
    sendRequest: (runtime: any, payload: any) => {
        return {
            result: async () => {
                return cachedFetch(payload.url, payload);
            }
        };
    },
    getSecret: async ({ id }: { id: string }) => {
        if (id === "OPENAI_API_KEY") return config.openaiApiKey;
        if (id === "GROQ_KEY") return config.groqKey;
        return null;
    }
});
