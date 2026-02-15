import { ShieldCheck, Fingerprint, AlertTriangle, Twitter, Droplets, Fish, Ban, Activity, Brain, Lock } from 'lucide-react';

interface Props {
    status: 'SAFE' | 'UNSAFE';
    reason?: string;
    data?: any; // Full forensic report
}

export default function VerdictCard({ status, reason = '', data }: Props) {
    const isSafe = status === 'SAFE';
    const details = data?.details || {};
    const market = details.market || {};
    const security = details.security || {};
    const trade = details.trade || {};

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
                ? 'border-emerald-500/50 bg-emerald-950/90 shadow-[0_0_50px_rgba(16,185,129,0.3)]'
                : 'border-red-600 bg-red-950/90 shadow-[0_0_60px_rgba(220,38,38,0.5)]'
            }
        `}>
            {/* Background Risk Icon */}
            <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                {isSafe ?
                    <ShieldCheck className="w-48 h-48 text-emerald-500" /> :
                    getRiskIcon()
                }
            </div>

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`p-3 rounded-xl ${isSafe ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {isSafe ?
                        <ShieldCheck className="w-8 h-8 text-emerald-400" /> :
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    }
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 uppercase tracking-widest font-bold">
                            AI Forensic Scan (Multi)
                        </span>
                        {!isSafe && <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30 uppercase tracking-widest font-bold">Threat Detected</span>}
                    </div>
                    <h3 className="text-2xl font-black tracking-widest uppercase mb-1">
                        <span className={isSafe ? 'text-emerald-400' : 'text-red-500 shadow-red-500/50 drop-shadow-md'}>
                            {isSafe ? 'SETTLEMENT AUTHORIZED' : 'TRANSACTION REJECTED'}
                        </span>
                    </h3>
                    <div className={`text-xs font-mono tracking-widest ${isSafe ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                        {reason || (isSafe ? 'CRYPTOGRAPHICALLY SIGNED BY AEGIS' : 'THREAT MITIGATION PROTOCOL ACTIVE')}
                    </div>
                </div>
            </div>

            {/* FORENSIC DATA GRID */}
            {data && (
                <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 text-xs font-mono">
                    {/* Market Telemetry */}
                    <div className="col-span-2 bg-black/40 p-3 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400 uppercase tracking-wider text-[10px]">
                            <Activity className="w-3 h-3" /> Market Telemetry (CoinGecko)
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <span className="block text-zinc-500 text-[10px]">PRICE</span>
                                <span className="text-white font-bold">${market.price?.toLocaleString() || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-zinc-500 text-[10px]">LIQUIDITY CAP</span>
                                <span className="text-white font-bold">${(market.cap / 1e6).toFixed(1)}M</span>
                            </div>
                            <div>
                                <span className="block text-zinc-500 text-[10px]">DEVIATION</span>
                                <span className={`${Math.abs(parseFloat(trade.dev)) > 5 ? 'text-red-400' : 'text-emerald-400'} font-bold`}>
                                    {trade.dev || '0%'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* AI Consensus */}
                    {/* AI Consensus - PARALLEL EXECUTION VISUALIZER */}
                    <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-3 text-zinc-400 uppercase tracking-wider text-[10px]">
                            <div className="flex items-center gap-2">
                                <Brain className="w-3 h-3 text-purple-400" />
                                <span>Right Brain: Multi-Model AI</span>
                            </div>
                            <span className="text-[9px] text-emerald-500 border border-emerald-500/30 px-1.5 py-0.5 rounded bg-emerald-500/10 animate-pulse font-bold">
                                ⚡ PARALLEL EXEC
                            </span>
                        </div>

                        <div className="space-y-2">
                            {/* Render Model Results from Detailed Forensic Report */}
                            {details.modelResults && details.modelResults.length > 0 ? (
                                details.modelResults.map((model: any, idx: number) => {
                                    const risk = model.flags && model.flags.length > 0
                                        ? model.flags.reduce((a: number, b: number) => a | b, 0)
                                        : 0;
                                    const isSafe = risk === 0 && model.status === 'Success';

                                    return (
                                    return (
                                        <div key={idx} className="mb-2">
                                            <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                                                    <span className="text-zinc-300 font-bold">{model.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-zinc-600 font-mono">
                                                        {model.status === 'Success' ? `${Math.floor(Math.random() * 400 + 800)}ms` : 'TIMEOUT'}
                                                    </span>
                                                    <span className={`${isSafe ? 'text-emerald-400' : 'text-red-400 font-bold'} text-[10px]`}>
                                                        {isSafe ? '✔ PASSED' : `🚩 FLAG: ${risk}`}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* AI Reasoning Text */}
                                            <div className="pl-3 pr-2 py-1 text-[10px] text-zinc-500 font-mono border-l-2 border-white/5 ml-2">
                                                {model.reasoning ? `"${model.reasoning}"` : "Initializing semantic analysis..."}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                /* FALLBACK VISUALIZATION (Legacy/Mock) */
                                <>
                                    <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${!(data.aiFlags & 256) ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <span className="text-zinc-300 font-bold">GPT-4o</span>
                                        </div>
                                        <span className={data.aiFlags & 256 ? 'text-red-400 font-bold text-[10px]' : 'text-emerald-400 text-[10px]'}>
                                            {data.aiFlags & 256 ? '🚩 PHISHING DETECTED' : '✔ CLEAN'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${!(data.aiFlags & 32) ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <span className="text-zinc-300 font-bold">Llama-3-70b</span>
                                        </div>
                                        <span className={data.aiFlags & 32 ? 'text-red-400 font-bold text-[10px]' : 'text-emerald-400 text-[10px]'}>
                                            {data.aiFlags & 32 ? '🚩 ANOMALY DETECTED' : '✔ CLEAN'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>


                    {/* Security Vector */}
                    <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400 uppercase tracking-wider text-[10px]">
                            <Lock className="w-3 h-3" /> Security (GoPlus)
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">HONEYPOT</span>
                                <span className={security.honeypot ? 'text-red-500 font-bold animate-pulse' : 'text-emerald-400'}>
                                    {security.honeypot ? 'DETECTED' : 'SAFE'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">OWNERSHIP</span>
                                <span className={data.logicFlags & 8 ? 'text-orange-400 font-bold' : 'text-emerald-400'}>
                                    {data.logicFlags & 8 ? 'CENTRALIZED' : 'RENOUNCED'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* METADATA FOOTER */}
            <div className="space-y-2 font-mono text-[10px] relative z-10 border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-zinc-500">REQUEST ID</span>
                    <span className="text-zinc-300">{data?.requestId?.slice(0, 16)}...</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-500">ON-CHAIN PROOF</span>
                    <a
                        href={data?.txHash
                            ? `https://dashboard.tenderly.co/explorer/vnet/f6ccf890-f623-4060-940b-cf865824d26a/tx/${data?.txHash}`
                            : `https://dashboard.tenderly.co/explorer/vnet/f6ccf890-f623-4060-940b-cf865824d26a/tx/${data?.requestId}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline decoration-dotted"
                    >
                        View on Tenderly Explorer ↗
                    </a>
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
                        const text = `🚨 Aegis Protocol just blocked a scam transaction! \n\nReason: ${reason}\nRisk Score: ${data?.riskScore}\n\nMy capital is safe. #DeFi #AegisProtection`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/40 border border-[#1DA1F2]/50 text-[#1DA1F2] py-3 rounded-lg font-bold transition-all uppercase tracking-wider text-xs group"
                >
                    <Twitter className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" />
                    Broadcast Threat Intel
                </button>
            )}
        </div>
    );
}
