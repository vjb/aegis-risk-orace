
import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, ArrowRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/moving-border";

interface AegisInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isProcessing: boolean;
}

export default function AegisInput({ value, onChange, onSubmit, isProcessing }: AegisInputProps) {
    return (
        <div className="p-4 bg-black/40 border-t border-white/5 relative z-20">
            <form onSubmit={onSubmit} className="flex items-center gap-4">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type a command or query..."
                    className="flex-1 bg-zinc-950/50 border-purple-500/30 focus-visible:ring-purple-500/50 text-white placeholder:text-zinc-500 h-14 rounded-xl font-mono"
                    disabled={isProcessing}
                />
                <Button
                    borderRadius="1.75rem"
                    className={`font-bold transition-all duration-300 ${isProcessing
                        ? 'bg-purple-900/50 text-purple-200 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        : 'bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800'
                        }`}
                    type="submit"
                    disabled={isProcessing}
                    containerClassName="h-14 w-32"
                >
                    {isProcessing ? (
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <Hammer className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <ArrowRight className="w-6 h-6" />
                    )}
                </Button>
            </form>
        </div>
    );
}
