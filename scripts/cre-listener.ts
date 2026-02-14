
import { createPublicClient, createWalletClient, http, parseAbiItem, webSocket, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { handler as analyzeRisk } from "../aegis-workflow/main"; // Import existing logic
import * as dotenv from "dotenv";

dotenv.config();

// Contract & Event Config
const AEGIS_VAULT_ADDRESS = "0x1F807a431614756A6866DAd9607ca62e2542ab01";
const AUDIT_REQUESTED_EVENT = parseAbiItem(
    "event AuditRequested(bytes32 indexed requestId, address indexed user, address indexed token, uint256 amount)"
);

const TOKEN_MAP: Record<string, string> = {
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "USDC",
    "0xfde4C96251273064830555d01ecB9c5E3AC1761a": "USDT",
    "0x6982508145454Ce325dDbE47a25d4ec3d2311933": "PEPE",
    "0x54251907338946759b07d61E30052a48bd4e81F4": "AVAX",
    "0x4200000000000000000000000000000000000006": "WETH"
};
const TENDERLY_RPC = process.env.TENDERLY_RPC_URL || "https://virtual.base.eu.rpc.tenderly.co/71828c3f-65cb-42ba-bc2a-3938c16ca878";
// DON Private Key (Mock for Hackathon)
const DON_KEY = (process.env.DON_PRIVATE_KEY as Hex) || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const account = privateKeyToAccount(DON_KEY);

const client = createPublicClient({
    chain: base,
    transport: http(TENDERLY_RPC)
});

const wallet = createWalletClient({
    account,
    chain: base,
    transport: http(TENDERLY_RPC)
});

console.log("👂 AEGIS CRE LISTENER STARTED");
console.log(`📡 Watching contract: ${AEGIS_VAULT_ADDRESS}`);
console.log(`🔗 RPC: ${TENDERLY_RPC}`);

// Polling for events (simpler than WebSocket for http RPCs)
const runListener = async () => {
    console.log("Waiting for events...");

    // Watch for Contract Events
    client.watchEvent({
        address: AEGIS_VAULT_ADDRESS,
        event: AUDIT_REQUESTED_EVENT,
        onLogs: async (logs) => {
            for (const log of logs) {
                const tokenLabel = TOKEN_MAP[token?.toLowerCase() || ""] || token;
                console.log(`\n🚨 EVENT DETECTED: AuditRequested`);
                console.log(`   User: ${user}`);
                console.log(`   Target Token: ${tokenLabel}`);
                console.log(`   Amount: ${amount}`);
                console.log(`   RequestID: ${requestId}`);

                try {
                    console.log("🧠 Triggering CRE Workflow Analysis...");

                    // Call the real workflow logic
                    const assessment = await analyzeRisk({
                        tokenAddress: token!,
                        chainId: "8453", // Base
                        userAddress: user!,
                        askingPrice: "100" // Simulated market price for demonstration
                    });

                    console.log(`⚖️  VERDICT reached by Split-Brain:`);
                    console.log(`   ├─ Logic Flags: ${assessment.logicFlags}`);
                    console.log(`   ├─ AI Flags:    ${assessment.aiFlags}`);
                    console.log(`   └─ Risk Score:  ${assessment.riskScore}`);

                    // Submit Verdict
                    console.log("📝 Submitting fulfillRequest on-chain...");
                    const abi = [
                        {
                            "inputs": [
                                { "internalType": "bytes32", "name": "requestId", "type": "bytes32" },
                                { "internalType": "uint256", "name": "riskScore", "type": "uint256" },
                                { "internalType": "bytes", "name": "signature", "type": "bytes" }
                            ],
                            "name": "fulfillRequest",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        }
                    ] as const;

                    const hash = await wallet.writeContract({
                        address: AEGIS_VAULT_ADDRESS,
                        abi: abi,
                        functionName: 'fulfillRequest',
                        args: [requestId!, BigInt(assessment.riskScore), assessment.signature as Hex]
                    });

                    console.log(`✅ VERDICT SUBMITTED! Tx: ${hash}`);

                } catch (e) {
                    console.error("❌ Analysis Failed:", e);
                }
            }
        }
    });
};

runListener();
