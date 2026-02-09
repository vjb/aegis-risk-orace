/**
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │                     AEGIS WASM COMPATIBILITY UTILITIES                       │
 * │       Pure JavaScript implementations of Node.js-native functionality        │
 * │       required for Chainlink CRE Runtime (Javy/WASM).                         │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Pure JS SHA1 for Javy/WASM.
 * Necessary because 'node:crypto' is not available in the CRE WASM runtime.
 */
export const sha1 = (message: string): string => {
    const rotateLeft = (n: number, s: number) => (n << s) | (n >>> (32 - s));
    const toHex = (n: number) => {
        let s = "";
        for (let i = 7; i >= 0; i--) s += ((n >>> (i * 4)) & 0xf).toString(16);
        return s;
    };
    let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
    let msg = message + String.fromCharCode(0x80);
    const l = msg.length;
    const n = ((l + 8) >> 6) + 1;
    const words = new Uint32Array(n * 16);
    for (let i = 0; i < l; i++) words[i >> 2] |= msg.charCodeAt(i) << (24 - (i % 4) * 8);
    words[n * 16 - 1] = message.length * 8;
    for (let i = 0; i < n; i++) {
        const w = new Uint32Array(80);
        for (let j = 0; j < 16; j++) w[j] = words[i * 16 + j];
        for (let j = 16; j < 80; j++) w[j] = rotateLeft(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
        let a = h0, b = h1, c = h2, d = h3, e = h4;
        for (let j = 0; j < 80; j++) {
            let f, k;
            if (j < 20) { f = (b & c) | ((~b) & d); k = 0x5a827999; }
            else if (j < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
            else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
            else { f = b ^ c ^ d; k = 0xca62c1d6; }
            const temp = (rotateLeft(a, 5) + f + e + k + w[j]) | 0;
            e = d; d = c; c = rotateLeft(b, 30); b = a; a = temp;
        }
        h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4);
};

/**
 * Pure JS Base64 for Javy/WASM.
 * Necessary because 'Buffer' is not available in the CRE WASM runtime.
 * Simulator requires Base64 strings for protobuf bytes fields.
 */
export const toBase64 = (buf: Uint8Array): string => {
    const table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let b64 = "";
    for (let i = 0; i < buf.length; i += 3) {
        const c1 = buf[i], c2 = buf[i + 1], c3 = buf[i + 2];
        b64 += table[c1 >> 2];
        b64 += table[((c1 & 3) << 4) | (c2 >> 4)];
        b64 += (i + 1 < buf.length) ? table[((c2 & 15) << 2) | (c3 >> 6)] : "=";
        b64 += (i + 2 < buf.length) ? table[c3 & 63] : "=";
    }
    return b64;
};
