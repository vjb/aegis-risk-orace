/**
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │                    AEGIS MISSION CONTROL - CHAT COMPONENT                    │
 * │                                                                              │
 * │  The primary UI component for the Aegis Risk Oracle demo.                   │
 * │  This component visualizes the parallel data acquisition process of the      │
 * │  Chainlink CRE workflow with real-time scanning indicators.                  │
 * └──────────────────────────────────────────────────────────────────────────────┘
 *
 * 🎯 KEY FEATURES:
 * 1. Parallel Scanning Visualization - All indicators start simultaneously
 * 2. Staggered Completion - Market → Security → Entropy (different timings)
 * 3. Signed Verdicts - Visual distinction for DON-signed risk assessments
 * 4. Scam Protection - Immediate rejection for known malicious patterns
 *
 * 📡 BACKEND CONNECTION:
 * - Connects to ElizaOS agent at http://localhost:3011/message
 * - Agent uses character.json persona (Aegis: robotic compliance architect)
 */
"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Lock, Zap, ArrowRight, Loader2, Check, Brain, Search, AlertTriangle, FileText, Twitter, ShieldAlert, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/moving-border";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    isVerdict?: boolean;
    isScanReport?: boolean;
    txHash?: string;
}

interface ChatProps {
    onIntent?: (intent: string) => void;
}

const VerdictHeader = ({ type }: { type: 'APPROVE' | 'DENIED' | 'REJECT' }) => {
    const isApprove = type === 'APPROVE';
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "mb-4 p-3 rounded-xl flex items-center gap-3 border shadow-lg overflow-hidden relative group",
                isApprove
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5"
                    : "bg-red-500/10 border-red-500/30 text-red-500 shadow-red-500/5"
            )}
        >
            {/* Background Glow */}
            <div className={cn(
                "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500",
                isApprove ? "bg-gradient-to-r from-emerald-500/20 to-transparent" : "bg-gradient-to-r from-red-500/20 to-transparent"
            )} />

            <div className={cn(
                "p-2 rounded-lg relative z-10",
                isApprove ? "bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            )}>
                {isApprove ? <Shield className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
            </div>
            <div className="relative z-10 flex-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-60 font-bold">
                    Aegis Protocol Verdict
                </div>
                <div className="text-sm font-black tracking-tight uppercase">
                    {isApprove ? "Transaction Approved" : "Threat Detected / Reject"}
                </div>
            </div>

            <div className="relative z-10 ml-auto flex flex-col items-end gap-1">
                {isApprove ? (
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-[8px] font-bold border border-emerald-500/30"
                    >
                        <div className="w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,1)]" />
                        SECURE
                    </motion.div>
                ) : (
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-[8px] font-bold border border-red-500/30"
                    >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        CRITICAL
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

const RiskCheckItem = ({ label, status }: { label: string, status: 'passed' | 'failed' | 'idle' }) => (
    <div className="flex justify-between items-center text-[9px]">
        <span className={cn("font-medium", status === 'idle' ? "text-zinc-600" : (status === 'passed' ? "text-zinc-500" : "text-white"))}>{label}</span>
        <div className={cn(
            "w-2 h-2 rounded-full",
            status === 'idle' ? "bg-zinc-800 shadow-none border border-white/5" : (status === 'passed' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]")
        )} />
    </div>
);

type ScanningStatus = 'idle' | 'detecting' | 'scanning' | 'analyzing' | 'complete' | 'locked' | 'settled';

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'CONSENSUS' | 'AI';
    message: string;
}

export default function Chat({ onIntent }: ChatProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [scanningStatus, setScanningStatus] = useState<ScanningStatus>('idle');
    const [activeSteps, setActiveSteps] = useState<boolean[]>([false, false, false]); // [Market, Security, AI]
    const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);
    const [mounted, setMounted] = useState(false);
    const [logsExpanded, setLogsExpanded] = useState(false); // Start collapsed
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'agent', content: "Dispatcher Online. Secure Uplink Established. Awaiting Intent." },
    ]);
    const [scanAnalysis, setScanAnalysis] = useState<{ logic: number, ai: number, modelResults?: any[] } | null>(null);
    const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
    const [auditStartedInMessages, setAuditStartedInMessages] = useState<Record<string, boolean>>({});
    const terminalEndRef = useRef<HTMLDivElement>(null);

    const [targetSymbol, setTargetSymbol] = useState<string>("ETH"); // Default to ETH

    // Fix hydration error: Initialize logs only on client
    useEffect(() => {
        setMounted(true);
        setLogs(prev => prev.length > 0 ? prev : [
            { id: '1', timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'AEGIS DISPATCHER INITIALIZED' },
            { id: '2', timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'VAULT ENFORCEMENT CORE: ACTIVE' },
        ]);
    }, []);

    const TOKEN_METRICS: Record<string, { price: string, change: string, liquidity: string, volume: string }> = {
        "ETH": { price: "$2,501.20", change: "+2.3%", liquidity: "$8.2M", volume: "$142K" },
        "WETH": { price: "$2,501.20", change: "+2.3%", liquidity: "$8.2M", volume: "$142K" },
        "BTC": { price: "$64,230.50", change: "+1.1%", liquidity: "$42.5M", volume: "$850K" },
        "WBTC": { price: "$64,230.50", change: "+1.1%", liquidity: "$42.5M", volume: "$850K" },
        "BRETT": { price: "$0.072", change: "+15.4%", liquidity: "$1.2M", volume: "$320K" },
        "PEPE": { price: "$0.0000084", change: "-5.2%", liquidity: "$4.1M", volume: "$1.1M" },
        "USDC": { price: "$1.00", change: "0.0%", liquidity: "$125M", volume: "$5.4M" },
        "FAKE_USDC": { price: "$0.0001", change: "-99.9%", liquidity: "$12.00", volume: "$0.00" },
        "HONEYPOT": { price: "$420.69", change: "+100%", liquidity: "$1.00", volume: "$0.00" },
        "UNKNOWN": { price: "---", change: "---", liquidity: "---", volume: "---" }
    };

    const getMetrics = (sym: string) => {
        const key = Object.keys(TOKEN_METRICS).find(k => k === sym) || "UNKNOWN";
        return TOKEN_METRICS[key];
    };

    const addLog = (level: LogEntry['level'], message: string) => {
        setLogs(prev => [...prev.slice(-49), {
            id: Date.now().toString() + Math.random(),
            timestamp: new Date().toLocaleTimeString(),
            level,
            message
        }]);
    };

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scanningStatus]);

    // Maintain focus after load
    useEffect(() => {
        if (!isLoading && scanningStatus === 'idle') {
            inputRef.current?.focus();
        }
    }, [isLoading, scanningStatus]);

    // Polling Logic for Pending Audits
    useEffect(() => {
        if (!pendingRequestId) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch('http://localhost:3011/audit-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requestId: pendingRequestId })
                });
                const data = await response.json();

                if (data.status === 'COMPLIANT' || data.status === 'REJECTED') {
                    clearInterval(pollInterval);
                    // setPendingRequestId(null); // Keep ID until dismissed if needed, but we clear it in dismiss
                    setScanningStatus('settled'); // PERSISTENT STATE - DO NOT RESET TO IDLE
                    setCompletedSteps([true, true, true]);

                    // Helper to synthesize reasoning from flags if missing
                    const getReasoningFromFlags = (flags: number[]) => {
                        if (!flags || flags.length === 0) return "No risk vectors detected. Asset appears clean.";
                        const reasons = [];
                        if (flags.includes(1)) reasons.push("Contract contains honeypot mechanisms.");
                        if (flags.includes(16)) reasons.push("Abnormal trading volume detected.");
                        if (flags.includes(32)) reasons.push("Wash trading patterns identified.");
                        if (flags.includes(256)) reasons.push("Known phishing signatures matched.");
                        if (flags.includes(65535)) reasons.push("Critical security vulnerability found.");
                        return reasons.join(" ") || "Risk factors identified by neural cluster.";
                    };

                    // Capture detailed results for the settled view
                    if (data.report) {
                        const rawModels = data.report.details?.modelResults || [];
                        // Inject reasoning if missing
                        const processedModels = rawModels.map((m: any) => ({
                            ...m,
                            reasoning: m.reasoning || getReasoningFromFlags(m.flags)
                        }));

                        setScanAnalysis({
                            logic: data.report.logicFlags || 0,
                            ai: data.report.aiFlags || 0,
                            modelResults: processedModels
                        });
                    }

                    const isRejected = data.status === 'REJECTED';
                    addLog(isRejected ? 'WARN' : 'CONSENSUS', `ORACLE VERDICT RECEIVED: ${data.status}`);

                    setMessages(prev => {
                        const newMessages = [...prev];
                        // Find the "AUDIT INITIATED" message and stop the consensus text
                        const auditMsgIndex = newMessages.findLastIndex(m => m.id && auditStartedInMessages[m.id]);
                        if (auditMsgIndex !== -1) {
                            newMessages[auditMsgIndex] = {
                                ...newMessages[auditMsgIndex],
                                content: newMessages[auditMsgIndex].content.replace('Consensus in progress...', 'Consensus Achieved.')
                            };
                        }

                        const report = data.report || {};
                        const riskCode = (report.logicFlags || 0) | (report.aiFlags || 0);

                        return [...newMessages, {
                            id: Date.now().toString(),
                            role: 'agent',
                            content: isRejected
                                ? `❌ [AEGIS_REJECT] Security scan complete. Verdict: THREAT_DETECTED.\n\n**FORENSIC AUDIT SUMMARY**\n- **Risk Code**: ${riskCode}\n- **Risk Score**: ${report.riskScore || riskCode}\n\n**FLAG BREAKDOWN**\n${(report.flagBreakdown || []).map((f: string) => `- ${f}`).join('\n') || '- Neural Anomaly Detected'}\n\n**FORENSIC REASONING**\n${report.reason || 'Critical security threat identified.'}\n\nAssets have been safely refunded to your wallet.`
                                : "✅ [AEGIS_APPROVE] Compliance verified. Settlement authorized.",
                            isVerdict: true
                        }];
                    });
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [pendingRequestId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
        setIsLoading(true);

        // Set focus immediately after clear to prevent loss
        inputRef.current?.focus();

        const isScamToken = userMsg.toLowerCase().includes('scam') ||
            userMsg.toLowerCase().includes('reject') ||
            userMsg.toLowerCase().includes('block') ||
            userMsg.toLowerCase().includes('threat') ||
            userMsg.toLowerCase().includes('rug');
        const isRiskQuery = isScamToken ||
            userMsg.toLowerCase().includes('swap') ||
            userMsg.toLowerCase().includes('risk') ||
            userMsg.toLowerCase().includes('analyze') ||
            userMsg.toLowerCase().includes('check');

        try {
            if (isRiskQuery) {
                setScanningStatus('detecting');
                addLog('INFO', `INTERCEPTED INTENT: ${userMsg.slice(0, 30)}...`);
                setCompletedSteps([false, false, false]);
            }

            const response = await fetch('http://localhost:3011/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userMsg })
            });

            const data = await response.json();

            // Handle real transaction hash from Eliza
            if (data.content?.hash) {
                addLog('WARN', '🔒 LOCKING ASSETS IN ESCROW...');
                addLog('INFO', `🚀 TRANSACTION BROADCASTED: ${data.content.hash.slice(0, 10)}...`);
                addLog('INFO', '📡 WAITING FOR CHAINLINK CRE AUDIT...');
                setScanningStatus('scanning');
                setActiveSteps([true, true, false]);

                // Set target symbol from backend if available, or default to ETH
                if (data.content?.token) {
                    setTargetSymbol(data.content.token);
                }

                // Allow a small delay for dramatic effect/oracle processing
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            // Capture Split-Brain Data if available
            const verdict = data.content?.aegisVerdict || data.content;
            if (verdict?.logicFlags !== undefined) {
                setScanAnalysis({
                    logic: verdict.logicFlags,
                    ai: verdict.aiFlags,
                    modelResults: verdict.modelResults || []
                });
            }

            const messageId = Date.now().toString();
            if (isRiskQuery && data?.text?.includes('PENDING')) {
                setAuditStartedInMessages(prev => ({ ...prev, [messageId]: true }));
            }

            setMessages(prev => [...prev, {
                id: messageId,
                role: 'agent',
                content: data.text,
                isVerdict: isRiskQuery && (
                    data.text.includes('VERDICT') ||
                    data.text.includes('AEGIS_APPROVE') ||
                    data.text.includes('AEGIS_REJECT') ||
                    data.text.includes('AEGIS_PENDING') ||
                    data.text.includes('REJECT') ||
                    (data.content?.riskCode !== undefined)
                ),
                txHash: data.content?.hash
            }]);

            if (data.content?.requestId) {
                setPendingRequestId(data.content.requestId);
                setScanningStatus('analyzing');
            }

        } catch (err) {
            console.error("Backend Error:", err);
            addLog('ERROR', 'Backend communication failed.');
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'agent',
                content: "⚠️ SYSTEM ALERT: Secure Uplink Failed. Check Server Connection."
            }]);
        } finally {
            setIsLoading(false);
            // Only reset scanningStatus if we're not waiting for an oracle audit
            if (!isRiskQuery || messages[messages.length - 1]?.content?.includes('FAILED')) {
                setScanningStatus('idle');
            }
            inputRef.current?.focus();
        }
    };

    return (
        <div className="w-full flex flex-col gap-3 h-[92vh] max-h-[92vh] overflow-hidden pb-2">
            {/* MAIN AREA: 2-Column Layout */}
            <div className="flex gap-3 flex-1 overflow-hidden min-h-0">
                {/* LEFT PANE: USER/AGENT CHAT (Dispatcher) - Wider for readability */}
                <div className="flex-[1.4] flex flex-col min-h-0">
                    <Card className="flex-1 bg-black/40 border-white/5 shadow-2xl flex flex-col overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-black/20 py-3 shrink-0">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                    <CardTitle className="text-xs font-black tracking-widest text-cyan-400 uppercase">Aegis Dispatcher</CardTitle>
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 px-2 py-0.5 rounded border border-white/5">
                                    AES-256 E2EE ACTIVE
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-4 overflow-hidden min-h-0">
                            <div className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent min-h-0 pr-2">
                                <AnimatePresence mode="popLayout">
                                    {messages.map((m) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex flex-col gap-1"
                                        >
                                            <div
                                                className={cn(
                                                    "px-4 py-3 rounded-lg text-sm leading-relaxed border",
                                                    m.role === 'user'
                                                        ? "bg-blue-900/20 border-blue-500/30 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.05)]"
                                                        : m.isVerdict && m.content.includes('REJECT')
                                                            ? "bg-red-900/20 border-red-500/30 text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                                                            : m.isVerdict && m.content.includes('PENDING')
                                                                ? "bg-amber-900/20 border-amber-500/30 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.05)]"
                                                                : m.isVerdict
                                                                    ? "bg-green-900/20 border-green-500/30 text-green-100 shadow-[0_0_10px_rgba(34,197,94,0.05)]"
                                                                    : "bg-zinc-900/50 border-white/5 text-zinc-300 shadow-[0_0_10px_rgba(255,255,255,0.01)]"
                                                )}>
                                                {m.isScanReport ? "Forensic Audit Executed." : (
                                                    <>
                                                        {m.isVerdict && m.content.includes('REJECT') && (
                                                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-red-500/30">
                                                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                                                    <span className="text-red-400 text-xl font-black">✕</span>
                                                                </div>
                                                                <span className="text-red-400 font-bold tracking-wider text-base">TRANSACTION REJECTED</span>
                                                            </div>
                                                        )}
                                                        {m.isVerdict && m.content.includes('PENDING') && (
                                                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-amber-500/30">
                                                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                                    <Clock className="w-4 h-4 text-amber-400" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-amber-400 font-bold tracking-wider text-base">AUDIT INITIATED</span>
                                                                    {!m.content.includes('Consensus Achieved') && (
                                                                        <span className="text-[10px] text-amber-500/60 font-mono">Consensus in progress...</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {m.isVerdict && m.content.includes('APPROVE') && (
                                                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-green-500/30">
                                                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                    <span className="text-green-400 text-xl font-black">✓</span>
                                                                </div>
                                                                <span className="text-green-400 font-bold tracking-wider text-base">TRANSACTION APPROVED</span>
                                                            </div>
                                                        )}
                                                        <div className="space-y-2">
                                                            {m.content.replace(/\[AEGIS_(APPROVE|DENIED|REJECT|PENDING)\]\s*/g, '').split('\n\n').map((section, i) => (
                                                                <div key={i} className="leading-relaxed text-zinc-300">
                                                                    {section.split('\n').map((line, j) => {
                                                                        // List Items
                                                                        if (line.trim().startsWith('- ')) {
                                                                            return (
                                                                                <div key={j} className="flex gap-2 ml-2 mt-1">
                                                                                    <span className="text-zinc-500">•</span>
                                                                                    <span dangerouslySetInnerHTML={{
                                                                                        __html: line.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-zinc-100">$1</span>')
                                                                                    }} />
                                                                                </div>
                                                                            );
                                                                        }
                                                                        // Headers / Bold Lines
                                                                        if (line.includes(':') && !line.startsWith(' ')) {
                                                                            return (
                                                                                <div key={j} className="font-bold text-zinc-100 mt-2" dangerouslySetInnerHTML={{
                                                                                    __html: line.replace(/\*\*(.*?)\*\*/g, '<span class="text-white">$1</span>')
                                                                                }} />
                                                                            );
                                                                        }
                                                                        // Standard Text
                                                                        const displayedLine = (line.includes('Consensus in progress...') && scanningStatus === 'settled')
                                                                            ? line.replace('Consensus in progress...', 'Consensus Achieved.')
                                                                            : line;

                                                                        return (
                                                                            <div key={j} className={cn(
                                                                                displayedLine.startsWith('  [!]') ? 'ml-2 mt-2 text-amber-200 font-semibold' :
                                                                                    displayedLine.startsWith('      ') ? 'ml-6 text-zinc-400 text-xs italic' :
                                                                                        'mt-1'
                                                                            )}>
                                                                                {displayedLine}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ))}

                                                            {m.txHash && (
                                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                                    <a
                                                                        href={`https://dashboard.tenderly.co/aegis/project/testnet/71828c3f-65cb-42ba-bc2a-3938c16ca878/tx/${m.txHash}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                                                                    >
                                                                        <Search className="w-3 h-3" />
                                                                        VIEW ON VIRTUAL TESTNET
                                                                        <ArrowRight className="w-2.5 h-2.5 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSubmit} className="flex items-center gap-2 shrink-0 bg-black/40 p-2 rounded-lg border border-white/5">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={!isLoading ? "State your intent... (e.g. 'Swap 1 ETH for PEPE')" : "Processing..."}
                                    className="flex-1 bg-zinc-900/50 border-white/10 text-zinc-200 placeholder:text-zinc-500 text-sm focus:border-cyan-500/50 transition h-11"
                                    disabled={isLoading}
                                />
                                {/* QUICK TOKEN PICKER */}
                                <select
                                    className="h-11 bg-zinc-900/50 border border-white/10 text-zinc-400 text-xs rounded-lg px-2 focus:border-cyan-500/50 outline-none cursor-pointer hover:bg-zinc-800/50 transition-colors"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            setInput(`Swap 0.1 ETH for ${e.target.value}`);
                                            inputRef.current?.focus();
                                        }
                                    }}
                                    value=""
                                >
                                    <option value="" disabled>QUICK FILL</option>
                                    <option value="BRETT">BRETT (Risky)</option>
                                    <option value="0x532f27101965dd16442E59d40670FaF5eBB142E4">BRETT (Raw Addr)</option>
                                    <option value="PEPE">PEPE (Safe)</option>
                                    <option value="FAKE_USDC">Fake USDC</option>
                                    <option value="WBTC">WBTC</option>
                                </select>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!input.trim() || isLoading}
                                    borderRadius="0.5rem"
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed h-11 w-14"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <ArrowRight className="w-4 h-4 ml-1" />}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* CENTER PANE: VAULT VISUALIZATION - Centered and larger */}
                <div className="rounded-xl flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
                    {/* VAULT CORE CARD */}
                    <Card className="h-full bg-black/40 border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent pointer-events-none" />
                        {/* VAULT GLOW EFFECT */}
                        <div className={cn(
                            "absolute inset-0 opacity-10 transition-all duration-1000",
                            scanningStatus === 'idle' ? "bg-purple-500/5" :
                                scanningStatus === 'scanning' ? "bg-amber-500/10" :
                                    scanningStatus === 'analyzing' ? "bg-cyan-500/10" : "bg-red-500/5"
                        )} />

                        <CardHeader className="border-b border-white/5 bg-black/40 py-4 relative z-10 shrink-0">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Shield className={cn(
                                            "w-8 h-8 transition-all duration-700",
                                            scanningStatus !== 'idle' ? "text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" : "text-purple-500"
                                        )} />
                                        {scanningStatus !== 'idle' && (
                                            <motion.div
                                                animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute inset-0 bg-cyan-400/30 rounded-full -z-10"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <CardTitle className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-zinc-500 tracking-tighter">
                                            AEGIS VAULT
                                        </CardTitle>
                                        <span className="text-[9px] font-mono text-zinc-500 tracking-[0.4em] uppercase">Sovereign Enforcer</span>
                                    </div>
                                </div>

                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border flex items-center gap-2 transition-all duration-700",
                                    scanningStatus === 'idle' && "bg-zinc-500/5 border-zinc-500/20 text-zinc-500",
                                    scanningStatus === 'detecting' && "bg-zinc-500/5 border-zinc-500/20 text-zinc-500",
                                    scanningStatus === 'scanning' && "bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
                                    scanningStatus === 'analyzing' && "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]",
                                    scanningStatus === 'settled' && ((scanAnalysis?.logic || 0) + (scanAnalysis?.ai || 0) > 0
                                        ? "bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                        : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]")
                                )}>
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        scanningStatus === 'idle' ? "bg-zinc-600" :
                                            (scanningStatus === 'scanning' || scanningStatus === 'analyzing') ? "bg-amber-500" :
                                                ((scanAnalysis?.logic || 0) + (scanAnalysis?.ai || 0) > 0 ? "bg-red-500" : "bg-emerald-400")
                                    )} />
                                    {
                                        (scanningStatus === 'idle') ? "VAULT STANDBY" :
                                            (scanningStatus === 'detecting') ? "LOCKING ASSETS..." :
                                                (scanningStatus === 'scanning') ? "DISPATCHING REQUEST" :
                                                    (scanningStatus === 'analyzing') ? "AWAITING CONSENSUS" :
                                                        ((scanAnalysis?.logic || 0) + (scanAnalysis?.ai || 0) > 0 ? "THREAT BLOCKED" : "VERIFIED SAFE")
                                    }
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto relative z-10 min-h-0 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                {scanningStatus === 'idle' ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="p-6 rounded-full bg-white/5 border border-white/5 relative group-hover:border-purple-500/20 transition-colors">
                                            <Lock className="w-12 h-12 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-zinc-400">VAULT ENGAGED</h3>
                                            <p className="text-zinc-600 text-xs max-w-xs px-4">Waiting for Dispatcher intent. Capital protection is active.</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="w-full max-w-md space-y-6">
                                        {/* UNIFIED DETAILED GRID VIEW */}
                                        {(scanningStatus === 'scanning' || scanningStatus === 'analyzing' || scanningStatus === 'detecting' || scanningStatus === 'settled') && (
                                            <div className="space-y-4">
                                                {/* BRAIN SPLIT HEADER (Traffic Light Edition) */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="grid grid-cols-2 gap-4"
                                                >
                                                    {/* LEFT BRAIN */}
                                                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                                                        <div className="relative z-10 space-y-3">
                                                            <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                                                                <div className="text-[10px] font-bold text-purple-400 tracking-wider">LEFT BRAIN (LOGIC)</div>
                                                                {scanAnalysis?.logic === 0 ? <Check className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-red-500" />}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <RiskCheckItem label="HONEYPOT CHECK" status={!scanAnalysis ? 'idle' : ((scanAnalysis.logic | scanAnalysis.ai) & 16) ? 'failed' : 'passed'} />
                                                                <RiskCheckItem label="OWNERSHIP" status={!scanAnalysis ? 'idle' : ((scanAnalysis.logic | scanAnalysis.ai) & 8) ? 'failed' : 'passed'} />
                                                                <RiskCheckItem label="LIQUIDITY DEPTH" status={!scanAnalysis ? 'idle' : ((scanAnalysis.logic | scanAnalysis.ai) & 1) ? 'failed' : 'passed'} />
                                                                <RiskCheckItem label="VOLATILITY" status={!scanAnalysis ? 'idle' : ((scanAnalysis.logic | scanAnalysis.ai) & 2) ? 'failed' : 'passed'} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* RIGHT BRAIN */}
                                                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
                                                        <div className="relative z-10 space-y-3">
                                                            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                                                                <div className="text-[10px] font-bold text-cyan-400 tracking-wider">RIGHT BRAIN (AI)</div>
                                                                {scanAnalysis?.ai === 0 ? <Brain className="w-3 h-3 text-cyan-400" /> : <ShieldAlert className="w-3 h-3 text-amber-500" />}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <RiskCheckItem label="IMPERSONATION" status={!scanAnalysis ? 'idle' : ((scanAnalysis.logic | scanAnalysis.ai) & 32) ? 'failed' : 'passed'} />
                                                                <RiskCheckItem label="PHISHING PATTERN" status={!scanAnalysis ? 'idle' : ((scanAnalysis.logic | scanAnalysis.ai) & 256) ? 'failed' : 'passed'} />
                                                                <RiskCheckItem label="WASH TRADING" status={!scanAnalysis ? 'idle' : ((scanAnalysis.logic | scanAnalysis.ai) & 64) ? 'failed' : 'passed'} />
                                                                <RiskCheckItem label="DEV ACTIVITY" status={!scanAnalysis ? 'idle' : ((scanAnalysis.logic | scanAnalysis.ai) & 128) ? 'failed' : 'passed'} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* LIVE METRICS DISPLAY */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="space-y-3"
                                                >
                                                    {/* CoinGecko Market Data */}
                                                    <div className="p-3 bg-zinc-900/50 border border-white/5 rounded-lg space-y-2">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {activeSteps[0] ? <Activity className="w-3 h-3 text-green-400" /> : <Loader2 className="w-3 h-3 animate-spin text-zinc-600" />}
                                                            <span className={cn("text-[9px] font-bold tracking-wider", activeSteps[0] ? "text-green-400" : "text-zinc-600")}>COINGECKO MARKET DATA</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 text-[9px]">
                                                            <div>
                                                                <div className="text-zinc-500">Price (24h)</div>
                                                                <div className="text-white font-mono">{activeSteps[0] ? getMetrics(targetSymbol).price : <span className="animate-pulse bg-zinc-800 rounded h-3 w-12 inline-block" />} {activeSteps[0] && <span className={getMetrics(targetSymbol).change.startsWith("-") ? "text-red-400" : "text-green-400"}>{getMetrics(targetSymbol).change}</span>}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-zinc-500">Liquidity</div>
                                                                <div className="text-white font-mono">{activeSteps[0] ? getMetrics(targetSymbol).liquidity : <span className="animate-pulse bg-zinc-800 rounded h-3 w-12 inline-block" />}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-zinc-500">Volume</div>
                                                                <div className="text-white font-mono">{activeSteps[0] ? getMetrics(targetSymbol).volume : <span className="animate-pulse bg-zinc-800 rounded h-3 w-12 inline-block" />}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* GoPlus Security Audit */}
                                                    <div className="p-3 bg-zinc-900/50 border border-white/5 rounded-lg space-y-2">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {activeSteps[1] ? <Shield className="w-3 h-3 text-blue-400" /> : <Loader2 className="w-3 h-3 animate-spin text-zinc-600" />}
                                                            <span className={cn("text-[9px] font-bold tracking-wider", activeSteps[1] ? "text-blue-400" : "text-zinc-600")}>GOPLUS SECURITY SCAN</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 text-[9px]">
                                                            <div>
                                                                <div className="text-zinc-500">Honeypot</div>
                                                                <div className="text-green-400 font-mono">{activeSteps[1] ? "CLEAR ✓" : <span className="animate-pulse bg-zinc-800 rounded h-3 w-8 inline-block" />}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-zinc-500">Ownership</div>
                                                                <div className="text-green-400 font-mono">{activeSteps[1] ? "RENOUNCED ✓" : <span className="animate-pulse bg-zinc-800 rounded h-3 w-10 inline-block" />}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-zinc-500">Trading</div>
                                                                <div className="text-green-400 font-mono">{activeSteps[1] ? "OPEN ✓" : <span className="animate-pulse bg-zinc-800 rounded h-3 w-8 inline-block" />}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* AI Model Analysis & Reasoning */}
                                                    <div className="p-3 bg-zinc-900/50 border border-purple-500/10 rounded-lg space-y-2">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {scanAnalysis?.modelResults ? <Brain className="w-3 h-3 text-purple-400" /> : <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
                                                            <span className="text-[10px] font-bold text-purple-400 tracking-wider">AI FORENSIC ANALYSIS (Multi-Model)</span>
                                                        </div>
                                                        <div className="space-y-3 text-[10px]">
                                                            {scanAnalysis?.modelResults && scanAnalysis.modelResults.length > 0 ? (
                                                                scanAnalysis.modelResults.map((model: any, idx: number) => (
                                                                    <div key={idx} className="border-l-2 border-purple-500/20 pl-2">
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <span className="text-zinc-400 font-bold">{model.name}</span>
                                                                            <span className={model.status === 'Success' && (!model.flags || model.flags.length === 0 || (model.flags.length === 1 && model.flags[0] === 0)) ? "text-cyan-400 font-mono" : "text-amber-400 font-mono"}>
                                                                                {model.status === 'Success' && (!model.flags || model.flags.length === 0 || (model.flags.length === 1 && model.flags[0] === 0)) ? 'SAFE' : 'FLAGGED'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-zinc-500 italic leading-relaxed text-left">
                                                                            "{model.reasoning || "Analysis complete. No specific reasoning provided."}"
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2 text-zinc-500 italic">
                                                                        <Loader2 className="w-3 h-3 animate-spin" /> Querying Neural Consensus Layer...
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* DISMISS BUTTON */}
                                                {(scanningStatus === 'settled') && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.5 }}
                                                    >
                                                        <Button
                                                            onClick={() => {
                                                                setScanningStatus('idle');
                                                                setPendingRequestId(null);
                                                                setScanAnalysis(null);
                                                                setCompletedSteps([false, false, false]);
                                                                setActiveSteps([false, false, false]);
                                                            }}
                                                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold tracking-widest text-[10px] py-4 border border-white/10"
                                                        >
                                                            ACKNOWLEDGE & CLEAR
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* BOTTOM TRAY: COLLAPSIBLE SYSTEM LOGS */}
            <motion.div
                initial={false}
                animate={{ height: logsExpanded ? '320px' : '48px' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative overflow-hidden shrink-0"
            >
                <Card className="h-full bg-zinc-950 border-white/5 shadow-2xl relative flex flex-col">
                    {/* Header Bar - Always Visible */}
                    <button
                        onClick={() => setLogsExpanded(!logsExpanded)}
                        className="w-full py-3 px-5 border-b border-white/5 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors flex items-center justify-between group shrink-0"
                    >
                        <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-cyan-500/70" />
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">AEGIS x elizaOS: System Logs</span>
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500/30" />
                                <div className="w-2 h-2 rounded-full bg-amber-500/30" />
                                <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-6 text-[10px] font-mono font-bold tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500">NETWORK:</span>
                                    <span className="text-purple-400">TENDERLY VIRTUAL TESTNET</span>
                                    <span className="text-green-500/70">● ONLINE</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500">ORACLE:</span>
                                    <span className="text-cyan-400">AEGIS_DON_01</span>
                                    <span className="text-green-500/70">● CONNECTED</span>
                                </div>
                            </div>
                            <motion.div
                                animate={{ rotate: logsExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-zinc-500 group-hover:text-zinc-300"
                            >
                                ▼
                            </motion.div>
                        </div>
                    </button>

                    {/* Logs Content - Shown when expanded */}
                    <CardContent className={cn(
                        "p-5 overflow-hidden font-mono text-xs flex-1 min-h-0",
                        !logsExpanded && "hidden"
                    )}>
                        <div className="h-full overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                            <AnimatePresence>
                                {logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex gap-3 group hover:bg-zinc-900/30 px-2 py-1 rounded transition-colors"
                                    >
                                        <span className="text-zinc-600 select-none font-bold">[{log.timestamp}]</span>
                                        <span className={cn(
                                            "font-bold min-w-[80px]",
                                            log.level === 'INFO' && "text-zinc-400",
                                            log.level === 'WARN' && "text-amber-500",
                                            log.level === 'ERROR' && "text-red-500",
                                            log.level === 'CONSENSUS' && "text-cyan-400",
                                            log.level === 'AI' && "text-purple-400",
                                        )}>{log.level}:</span>
                                        <span className="text-zinc-300 group-hover:text-zinc-100 transition-colors flex-1">{log.message}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={terminalEndRef} />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

function SubTask({ label, delay }: { label: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="flex items-center gap-2 text-[10px] text-cyan-300/70"
        >
            <Loader2 className="w-3 h-3 animate-spin" /> {label}
        </motion.div>
    );
}

function InlinePipelineStep({ active, completed, icon, label }: { active: boolean, completed: boolean, icon: React.ReactNode, label: string }) {
    return (
        <div className={cn(
            "flex items-center gap-3 transition-opacity duration-300",
            active ? "opacity-100" : "opacity-30"
        )}>
            <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500",
                completed
                    ? "bg-green-500/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] text-green-400"
                    : active
                        ? "bg-cyan-500/20 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)] text-cyan-400"
                        : "bg-white/5 border-white/10 text-zinc-600"
            )}>
                {completed ? <Check className="w-3 h-3" /> : icon}
            </div>
            <div className="flex flex-col">
                <span className={cn(
                    "text-[10px] font-bold tracking-wider uppercase",
                    completed ? "text-green-400" : active ? "text-cyan-400" : "text-zinc-600"
                )}>
                    {label}
                </span>
                {active && !completed && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        className="h-[1px] bg-cyan-500/50 mt-0.5"
                    />
                )}
                {completed && (
                    <div className="h-[1px] bg-green-500/50 mt-0.5 w-full" />
                )}
            </div>
            {active && !completed && (
                <div className="ml-auto">
                    <Loader2 className="w-3 h-3 animate-spin text-cyan-500/50" />
                </div>
            )}
            {completed && (
                <div className="ml-auto">
                    <Check className="w-3 h-3 text-green-500" />
                </div>
            )}
        </div>
    );
}
