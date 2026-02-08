import { ShieldCheck, Fingerprint, AlertTriangle } from 'lucide-react';

interface Props {
    status: 'SAFE' | 'UNSAFE';
}

export default function VerdictCard({ status }: Props) {
    const isSafe = status === 'SAFE';
    const colorClass = isSafe ? 'text-emerald-400' : 'text-red-500';
    const borderClass = isSafe ? 'border-emerald-500/30' : 'border-red-500/30';
    const bgClass = isSafe ? 'bg-emerald-500/20' : 'bg-red-500/20';

    return (
        <div className={`w-full bg-black/80 border ${borderClass} rounded-xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl`}>
            <div className="absolute top-0 right-0 p-2 opacity-10">
                {isSafe ?
                    <ShieldCheck className="w-32 h-32 text-emerald-500" /> :
                    <AlertTriangle className="w-32 h-32 text-red-500" />
                }
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${bgClass}`}>
                    {isSafe ?
                        <ShieldCheck className={`w-8 h-8 ${colorClass}`} /> :
                        <AlertTriangle className={`w-8 h-8 ${colorClass}`} />
                    }
                </div>
                <div>
                    <h3 className="text-xl font-black text-white tracking-widest uppercase">
                        {isSafe ? 'VERDICT CERTIFIED' : 'THREAT DETECTED'}
                    </h3>
                    <div className={`text-xs font-mono tracking-widest ${colorClass}`}>
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
                    <span className={`font-bold ${colorClass}`}>0x8a7f...9e21</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="text-zinc-500">TIMESTAMP</span>
                    <span className="text-white">{new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            <div className={`mt-6 flex items-center justify-center gap-2 border rounded-lg p-3 ${isSafe ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-red-900/20 border-red-500/20'}`}>
                <Fingerprint className={`w-4 h-4 ${colorClass}`} />
                <span className={`text-xs font-bold tracking-widest ${isSafe ? 'text-emerald-300' : 'text-red-300'}`}>
                    SECURE ENCLAVE VERIFIED
                </span>
            </div>
        </div>
    );
}
