
import { createPublicClient, http, getAddress, Hex } from "viem";
import { base } from "viem/chains";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const RPC = process.env.TENDERLY_RPC_URL;
const ADDR = process.env.AEGIS_VAULT_ADDRESS as Hex;

async function check() {
    console.log(`Checking RPC: ${RPC}`);
    console.log(`Vault Address: ${ADDR}`);

    if (!RPC || !ADDR) {
        console.log("Missing ENV vars.");
        return;
    }

    const client = createPublicClient({ chain: base, transport: http(RPC) });

    try {
        const code = await client.getBytecode({ address: ADDR });
        if (!code || code === "0x") {
            console.log("❌ REJECTED: No contract code found at this address. You likely swapped RPCs without redeploying.");
        } else {
            console.log(`✅ SUCCESS: Contract detected (Code size: ${code.length / 2 - 1} bytes)`);

            // Optional: try to call a getter
            try {
                const owner = await client.readContract({
                    address: ADDR,
                    abi: [{ name: "owner", type: "function", inputs: [], outputs: [{ type: "address" }] }],
                    functionName: "owner"
                });
                console.log(`   Owner: ${owner}`);
            } catch (e) {
                console.log(`   Could not call owner() - maybe wrong ABI?`);
            }
        }
    } catch (e) {
        console.error("❌ Error connecting to RPC:", e.message);
    }
}

check();
