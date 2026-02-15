
import { fetch } from "bun";

async function main() {
    const ids = "avalanche-2,ethereum,bitcoin,pepe";
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
    console.log("Fetching prices...");
    const res = await fetch(url);
    const data = await res.json();
    console.log("Current Prices:");
    console.log(`AVAX: $${data["avalanche-2"].usd}`);
    console.log(`ETH:  $${data["ethereum"].usd}`);
    console.log(`BTC:  $${data["bitcoin"].usd}`);
    console.log(`PEPE: $${data["pepe"].usd}`);

    // Calculate ratios
    const avax = data["avalanche-2"].usd;
    const eth = data["ethereum"].usd;
    console.log(`\n1 ETH = ${(eth / avax).toFixed(2)} AVAX`);
}

main();
