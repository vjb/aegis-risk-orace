import * as dotenv from "dotenv";
import { resolve } from "path";

// ANSI Color Codes (Inline to avoid dependencies)
const reset = "\x1b[0m";
const red = "\x1b[31m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const cyan = "\x1b[36m";

// Load .env
dotenv.config({ path: resolve(__dirname, "../.env") });

const REQUIRED_KEYS = [
    "OPENAI_API_KEY",
    "GROQ_API_KEY",
    "COINGECKO_API_KEY",
    "GOPLUS_APP_KEY",
    "GOPLUS_APP_SECRET",
    "BASESCAN_API_KEY"
];

async function checkEnv() {
    console.log(`${cyan}🔍 AEGIS ENVIRONMENT VALIDATOR${reset}\n`);

    let allValid = true;
    const missingKeys: string[] = [];

    for (const key of REQUIRED_KEYS) {
        const value = process.env[key];
        if (!value || value === "undefined" || value.trim() === "") {
            console.log(`${red}❌ MISSING: ${key}${reset}`);
            missingKeys.push(key);
            allValid = false;
        } else {
            // Mask the key for security, show first/last 4 chars
            const masked = value.length > 8
                ? `${value.slice(0, 4)}...${value.slice(-4)}`
                : "****";
            console.log(`${green}✅ FOUND:   ${key}${reset} (${masked})`);
        }
    }

    console.log("\n" + "-".repeat(50) + "\n");

    if (allValid) {
        console.log(`${green}✨ ALL SYSTEMS GO. Environment is ready for launch.${reset}`);
        process.exit(0);
    } else {
        console.error(`${red}🚨 CRITICAL ERROR: Missing ${missingKeys.length} required environment variables.${reset}`);
        console.error(`${yellow}Please check your .env file and ensure the following keys are set:${reset}`);
        missingKeys.forEach(k => console.error(`   - ${k}`));
        process.exit(1);
    }
}

checkEnv();
