import { createPublicClient, createWalletClient, http, getAddress, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import * as dotenv from "dotenv";
import * as path from "path";

// Robust dotenv loading from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const AEGIS_VAULT_ADDRESS = process.env.AEGIS_VAULT_ADDRESS as Hex;
if (!AEGIS_VAULT_ADDRESS) {
    throw new Error("AEGIS_VAULT_ADDRESS not found in .env");
}
const TENDERLY_RPC = process.env.TENDERLY_RPC_URL;
if (!TENDERLY_RPC) {
    throw new Error("TENDERLY_RPC_URL not found in .env");
}
const DEPLOYER_KEY = (process.env.PRIVATE_KEY as Hex) || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const account = privateKeyToAccount(DEPLOYER_KEY);
const client = createWalletClient({
    account,
    chain: base,
    transport: http(TENDERLY_RPC)
});

const publicClient = createPublicClient({
    chain: base,
    transport: http(TENDERLY_RPC)
});

const VAULT_ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
        "name": "riskCache",
        "outputs": [
            { "internalType": "uint256", "name": "riskCode", "type": "uint256" },
            { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "RISK_TTL",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "token", "type": "address" },
            { "internalType": "uint256", "name": "riskCode", "type": "uint256" }
        ],
        "name": "updateRiskCache",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

const COMMON_TOKENS: Record<string, string> = {
    "WETH": "0x4200000000000000000000000000000000000006",
    "WBTC": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    "AVAX": "0x54251907338946759b07d61E30052a48bd4E81F4",
    "LINK": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    "UNI": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    "PEPE": "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
};

const ALIAS_MAP: Record<string, string> = {
    "ETH": "WETH",
    "NATIVE": "WETH",
    "BITCOIN": "WBTC",
    "BTC": "WBTC"
};

async function main() {
    const command = process.argv[2];
    const target = process.argv[3];
    const value = process.argv[4];

    if (!command || command === "help") {
        console.log(`
🛡  AEGIS RISK MANAGER CLI
Usage:
  bun scripts/risk-manager.ts list
  bun scripts/risk-manager.ts set <address|alias> <score>
  bun scripts/risk-manager.ts clear <address|alias>

Aliases: WBTC, AVAX, LINK, UNI, PEPE, USDC
        `);
        return;
    }

    if (command === "list") {
        console.log("\n🔍 AEGIS ON-CHAIN RISK CACHE:");
        console.log("------------------------------------------------------------------");
        const ttl = await publicClient.readContract({
            address: AEGIS_VAULT_ADDRESS,
            abi: VAULT_ABI,
            functionName: "RISK_TTL"
        });

        const now = BigInt(Math.floor(Date.now() / 1000));

        for (const [name, addr] of Object.entries(COMMON_TOKENS)) {
            const [score, timestamp] = (await publicClient.readContract({
                address: AEGIS_VAULT_ADDRESS,
                abi: VAULT_ABI,
                functionName: "riskCache",
                args: [getAddress(addr)]
            })) as [bigint, bigint];

            let status = "🟢 CLEARED";
            let ttlInfo = "";

            if (score > 0n) {
                const age = now - timestamp;
                if (age < ttl) {
                    status = "🔴 BLACKLISTED";
                    const remaining = ttl - age;
                    ttlInfo = ` (Expires in: ${Math.floor(Number(remaining) / 60)}m)`;
                } else {
                    status = "🟡 EXPIRED";
                }
            }

            console.log(`${name.padEnd(6)} | ${addr} | ${status.padEnd(14)} | Score: ${score.toString().padEnd(4)}${ttlInfo}`);
        }
        console.log("------------------------------------------------------------------\n");
        return;
    }

    // Resolve Address
    let address: Hex;
    try {
        const uTarget = target?.toUpperCase();
        const resolvedAlias = ALIAS_MAP[uTarget] || uTarget;
        const aliasAddr = COMMON_TOKENS[resolvedAlias];
        address = getAddress(aliasAddr || target);
    } catch {
        console.error(`❌ Invalid address or alias: ${target}`);
        return;
    }

    if (command === "set" || command === "clear") {
        const score = command === "clear" ? 0n : BigInt(value || 1);
        console.log(`📡 Sending Update: ${target} (${address}) -> Score: ${score}...`);

        try {
            const hash = await client.writeContract({
                address: AEGIS_VAULT_ADDRESS,
                abi: VAULT_ABI,
                functionName: "updateRiskCache",
                args: [address, score]
            });
            console.log(`✅ SUCCESS! Transaction hash: ${hash}`);
        } catch (err) {
            console.error("❌ FAILED to update risk cache:", err);
        }
    }
}

main().catch(console.error);
