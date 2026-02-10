import { ShieldCheck, Fingerprint, AlertTriangle, Twitter, Droplets, Fish, Ban } from 'lucide-react';

interface Props {
    status: 'SAFE' | 'UNSAFE';
    reason?: string;
}

export default function VerdictCard({ status, reason = '' }: Props) {
    const isSafe = status === 'SAFE';

    // Determine Icon based on reason
    const getRiskIcon = () => {
        const r = reason.toUpperCase();
        if (r.includes('HONEYPOT')) return <span className="text-6xl">🍯</span>; // Honey Pot
        if (r.includes('PHISHING')) return <Fish className="w-32 h-32 text-red-500" />;
        if (r.includes('LIQUIDITY')) return <Droplets className="w-32 h-32 text-red-500" />;
        return <Ban className="w-32 h-32 text-red-500" />; // Default Block
    };

    return (
        <div className={`
            relative p-6 rounded-2xl border-2 backdrop-blur-xl overflow-hidden transition-all duration-500
            ${isSafe
                ? 'border-emerald-500/50 bg-emerald-950/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                : 'border-red-600 bg-red-950/50 shadow-[0_0_40px_rgba(220,38,38,0.4)] animate-pulse'
            }
        `}>
            <div className="absolute top-0 right-0 p-2 opacity-10">
                {isSafe ?
                    <ShieldCheck className="w-32 h-32 text-emerald-500" /> :
                    getRiskIcon()
                }
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${isSafe ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {isSafe ?
                        <ShieldCheck className="w-8 h-8 text-emerald-400" /> :
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    }
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-widest uppercase mb-2">
                        <span className={isSafe ? 'text-emerald-400' : 'text-red-500'}>
                            {isSafe ? 'SETTLEMENT AUTHORIZED' : 'TRANSACTION REJECTED'}
                        </span>
                    </h3>
                    <div className={`text-xs font-mono tracking-widest ${isSafe ? 'text-emerald-400' : 'text-red-500'}`}>
                        {isSafe ? 'CRYPTOGRAPHICALLY SIGNED BY AEGIS' : 'TRANSACTION BLOCKED BY PROTOCOL'}
                    </div>
                </div>
            </div>

            <div className="space-y-3 font-mono text-xs relative z-10">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-zinc-500">SIGNER ID</span>
                    <span className="text-white font-bold">0xf39F...2266</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-zinc-500">VERDICT HASH</span>
                    <span className={`font-bold ${isSafe ? 'text-emerald-400' : 'text-red-500'}`}>0x8a7f...9e21</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="text-zinc-500">TIMESTAMP</span>
                    <span className="text-white">{new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            <div className={`mt-6 flex items-center justify-center gap-2 border rounded-lg p-3 ${isSafe ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-red-900/20 border-red-500/20'}`}>
                <Fingerprint className={`w-4 h-4 ${isSafe ? 'text-emerald-400' : 'text-red-500'}`} />
                <span className={`text-xs font-bold tracking-widest ${isSafe ? 'text-emerald-300' : 'text-red-300'}`}>
                    SECURE ENCLAVE VERIFIED
                </span>
            </div>

            {!isSafe && (
                <button
                    onClick={() => {
                        const text = "🚨 Aegis Protocol just blocked a scam transaction! My capital is safe. #DeFi #AegisProtection";
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/40 border border-[#1DA1F2]/50 text-[#1DA1F2] py-3 rounded-lg font-bold transition-all uppercase tracking-wider text-xs group"
                >
                    <Twitter className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" />
                    Broadcast Threat Intel
                </button>
            )}
        </div>
    );
}
