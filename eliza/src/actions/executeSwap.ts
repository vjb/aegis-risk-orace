
import { Action, IAgentRuntime, Memory, State, HandlerCallback, ActionExample } from "@elizaos/core";
import { createWalletClient, http, publicActions, parseEther, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

// Contract ABI for swap
const TOKEN_MAP: Record<string, string> = {
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "USDC",
    "0xfde4C96251273064830555d01ecB9c5E3AC1761a": "USDT",
    "0x6982508145454Ce325dDbE47a25d4ec3d2311933": "PEPE",
    "0x54251907338946759b07d61E30052a48bd4e81F4": "AVAX",
    "0x4200000000000000000000000000000000000006": "WETH"
};
const VAULT_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "token", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "swap",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
] as const;

// Configuration
const TENDERLY_RPC = process.env.VITE_TENDERLY_RPC_URL || "https://virtual.base.eu.rpc.tenderly.co/71828c3f-65cb-42ba-bc2a-3938c16ca878";
// Use a fixed demo key if not in env (Deployer Key)
const PRIVATE_KEY = (process.env.PRIVATE_KEY as Hex) || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const AEGIS_VAULT_ADDRESS = "0x1F807a431614756A6866DAd9607ca62e2542ab01";
// Token Mapping for Demo (Base Mainnet / Mock Addresses)
// const TOKEN_MAP: Record<string, string> = {
//     "usdc": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
//     "usdt": "0xfde4C96251273064830555d01ecB9c5E3AC1761a",
//     "pepe": "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
//     "avax": "0x54251907338946759b07d61E30052a48bd4e81F4",
//     "weth": "0x4200000000000000000000000000000000000006",
// };

export const executeSwapAction: Action = {
    name: "EXECUTE_SWAP",
    similes: ["SWAP_TOKEN", "TRADE_ASSET", "BUY_TOKEN"],
    description: "Executes a swap transaction on the AegisVault contract via Tenderly.",
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        const text = (message.content.text || "").toLowerCase();
        return text.includes("swap") || text.includes("buy");
    },
    handler: async (_runtime: IAgentRuntime, message: Memory, _state?: State, _options?: any, callback?: HandlerCallback) => {
        console.log("🚀 [AEGIS ACTION] Initiating Swap Sequence...");

        const text = (message.content.text || "").toLowerCase();

        // Smarter Parsing: "swap [amount] [from] for [to]"
        const amountMatch = text.match(/swap\s+([\d\.]+)/i) || text.match(/([\d\.]+)/);
        const amountVal = amountMatch ? amountMatch[1] : "0.1";
        const amountWei = parseEther(amountVal);

        // Detect Target Token
        let targetToken = "0x4200000000000000000000000000000000000006"; // Default WETH address
        let targetLabel = "WETH";

        // Reverse lookup for token names from the new TOKEN_MAP (address -> name)
        const tokenNameToAddressMap: Record<string, string> = {};
        for (const [address, name] of Object.entries(TOKEN_MAP)) {
            tokenNameToAddressMap[name.toLowerCase()] = address;
        }

        for (const [name, addr] of Object.entries(tokenNameToAddressMap)) {
            // Check if user mentioned the token name after "for" or "to"
            if (text.includes(`for ${name}`) || text.includes(`to ${name}`) || (text.includes(name) && !text.includes(`for ${name}`))) {
                targetToken = addr;
                targetLabel = name.toUpperCase();
                // If it's a "for [token]" match, it's a strong signal, so we break
                if (text.includes(`for ${name}`)) break;
            }
        }

        console.log(`🎯 Intent Decoded: Swap ${amountVal} native for ${targetLabel} (${targetToken})`);

        if (callback) {
            callback({
                text: `Initiating secure swap: ${amountVal} native core for ${targetLabel}...`,
                action: "SWAP_INITIATED"
            });
        }

        try {
            const account = privateKeyToAccount(PRIVATE_KEY);
            const client = createWalletClient({
                account,
                chain: base,
                transport: http(TENDERLY_RPC)
            }).extend(publicActions);

            console.log(`🔌 Connected to Tenderly: ${TENDERLY_RPC}`);
            console.log(`👤 Wallet: ${account.address}`);
            console.log(`💸 Amount: ${amountVal} ETH (${amountWei.toString()} wei)`);

            // Execute Transaction
            const hash = await client.writeContract({
                address: AEGIS_VAULT_ADDRESS,
                abi: VAULT_ABI,
                functionName: 'swap',
                args: [targetToken as Hex, amountWei],
                value: amountWei,
            });

            console.log(`✅ Transaction Sent! Hash: ${hash}`);

            if (callback) {
                callback({
                    text: `Transaction broadcasted to Tenderly Virtual TestNet.\nHash: ${hash}`,
                    content: {
                        hash: hash,
                        status: "PENDING_AUDIT",
                        amount: amountVal,
                        token: targetLabel,
                        targetAddress: targetToken
                    }
                });
            }

        } catch (error) {
            console.error("❌ Transaction Failed:", error);
            if (callback) {
                callback({
                    text: `Transaction failed: ${(error as Error).message}`,
                    error: true
                });
            }
        }
    },
    examples: [
        [
            {
                name: "user",
                content: { text: "Swap 1 ETH for PEPE" }
            },
            {
                name: "Aegis",
                content: { text: "Initiating secure swap...", action: "EXECUTE_SWAP" }
            }
        ]
    ] as ActionExample[][]
};
