import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { pinataContent, pinataMetadata } = body;

        const pinataJwt = process.env.PINATA_JWT;

        if (!pinataJwt) {
            return NextResponse.json({ error: 'Server Config Error: Missing Pinata JWT' }, { status: 500 });
        }

        const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${pinataJwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pinataContent,
                pinataMetadata
            })
        });

        const data = await res.json();
        return NextResponse.json(data);

    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
