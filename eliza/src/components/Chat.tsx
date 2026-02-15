import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Hammer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
}

interface ChatProps {
    messages: Message[];
    isProcessing: boolean;
}

export default function Chat({ messages, isProcessing }: ChatProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing]);

    return (
        <Card className="w-full bg-black/50 border-white/10 backdrop-blur-xl h-full flex flex-col overflow-hidden shadow-2xl shadow-purple-500/20">
            <CardHeader className="border-b border-white/5 bg-black/40">
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-purple-400" />
                    AEGIS MISSION CONTROL
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-purple-900/50 scrollbar-track-transparent">
                    <AnimatePresence>
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-4 rounded-2xl relative overflow-hidden backdrop-blur-md ${m.role === 'agent'
                                    ? 'bg-zinc-900/80 border border-purple-500/30 text-zinc-100 rounded-tl-none shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                                    : 'bg-indigo-600/20 border border-indigo-500/30 text-white rounded-tr-none'
                                    }`}>
                                    {m.role === 'agent' && <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50" />}
                                    <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline" />
                                            }}
                                        >
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-zinc-900/50 border border-purple-500/20 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <Hammer className="w-4 h-4 text-purple-400 animate-pulse" />
                                <span className="text-xs text-purple-400/70 font-mono animate-pulse">
                                    USING TOOL: CHECK_RISK
                                </span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </CardContent>
        </Card>
    );
}

