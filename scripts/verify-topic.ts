
import { keccak256, toHex, encodePacked } from "viem";

const sig = "TradeInitiated(bytes32,address,address,uint256)";
const hash = keccak256(toHex(sig));
console.log(`Signature: ${sig}`);
console.log(`Topic[0]:  ${hash}`);
