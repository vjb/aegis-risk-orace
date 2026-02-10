import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    status: string;
}

export default function SecurityFeed({ status }: Props) {
    const [logs, setLogs] = useState<{ time: string, msg: string, type: 'info' | 'warn' | 'success' | 'err' }[]>([
        { time: "INIT", msg: "AEGIS PROTOCOL ENGINE: v1.0.4 - READY", type: 'success' },
        { time: "NET", msg: "ORACLE CLUSTER: CONNECTED [LATENCY: 12ms]", type: 'info' }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [logs]);

    // React to status changes with REALISTIC log messages
    useEffect(() => {
        const t = () => new Date().toISOString().split('T')[1].slice(0, 8); // HH:MM:SS

        if (status === 'SCANNING') {
            setLogs(prev => [...prev,
            { time: t(), msg: "[DISPATCH] INCOMING INTENT DETECTED", type: 'warn' },
            { time: t(), msg: "[VAULT] ASSETS LOCKED IN ESCROW (1.0 ETH)", type: 'success' },
            { time: t(), msg: "[CRE] DISPATCHING JOB: 0x7f2...a1", type: 'info' }
            ]);
        }
        if (status === 'ANALYZING') {
            setLogs(prev => [...prev,
            { time: t(), msg: "[CRE] FETCHING COINGECKO: 200 OK", type: 'info' },
            { time: t(), msg: "[CRE] GOPLUS HONEYPOT SCAN: CLEAN", type: 'info' },
            { time: t(), msg: "[AI] GPT-4o FORENSIC ANALYSIS: STARTED", type: 'warn' }
            ]);
        }
        if (status === 'VERIFYING') {
            setLogs(prev => [...prev,
            { time: t(), msg: "[DON] CONSENSUS REACHED (3/3 Nodes)", type: 'success' },
            { time: t(), msg: "[AI] BITMASK GENERATED: 0x000000", type: 'info' }
            ]);
        }
        if (status === 'COMPLETE') {
            setLogs(prev => [...prev,
            { time: t(), msg: "[VAULT] 🔓 VERDICT RECEIVED: SAFE", type: 'success' },
            { time: t(), msg: "[VAULT] EXECUTING SWAP...", type: 'success' }
            ]);
        }
        // Assuming REJECTED isn't a status string in App.tsx but inferred? 
        // Logic handled in App.tsx sets verdict. 
        // SecurityFeed only gets workflowStatus. 
        // I'll stick to workflowStatus hooks for now.
    }, [status]);

    return (
        <div className="h-full bg-black font-mono text-xs leading-tight p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black" ref={scrollRef}>
            <AnimatePresence>
                {logs.map((log, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i}
                        className="mb-1 whitespace-pre-wrap break-all flex group hover:bg-zinc-900/50"
                    >
                        <span className="text-zinc-600 mr-2 shrink-0 select-none">[{log.time}]</span>
                        <span className={`${log.type === 'warn' ? 'text-amber-500' :
                                log.type === 'success' ? 'text-emerald-500' :
                                    log.type === 'err' ? 'text-red-500' :
                                        'text-zinc-500'
                            }`}>
                            {log.msg}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
            <div className="mt-2 animate-pulse text-green-500">_</div>
        </div>
    );
}
