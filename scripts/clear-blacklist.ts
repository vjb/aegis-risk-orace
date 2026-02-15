import { createWalletClient, http, getAddress, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import * as dotenv from "dotenv";
import * as path from "path";

// robust dotenv loading
dotenv.config({ path: path.join(process.cwd(), ".env") });

const AEGIS_VAULT_ADDRESS = "0x1F807a431614756A6866DAd9607ca62e2542ab01";
const TENDERLY_RPC = process.env.TENDERLY_RPC_URL || "https://virtual.base.eu.rpc.tenderly.co/71828c3f-65cb-42ba-bc2a-3938c16ca878/";
const DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const account = privateKeyToAccount(DEPLOYER_KEY as Hex);
const wallet = createWalletClient({
    account,
    chain: base,
    transport: http(TENDERLY_RPC)
});

async function clearBlacklist() {
    const tokenArg = process.argv[2];
    if (!tokenArg) {
        console.error("Usage: bun scripts/clear-blacklist.ts <TOKEN_ADDRESS>");
        process.exit(1);
    }

    const token = getAddress(tokenArg);
    console.log(`🛡  [AEGIS SECURITY RESET] Clearing blacklist for ${token}...`);

    const abi = [
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

    try {
        const hash = await wallet.writeContract({
            address: AEGIS_VAULT_ADDRESS,
            abi,
            functionName: "updateRiskCache",
            args: [token, 0n]
        });

        console.log(`✅ SUCCESS: Blacklist cleared. Tx: ${hash}`);
    } catch (err) {
        console.error("❌ FAILED:", err);
    }
}

clearBlacklist();
