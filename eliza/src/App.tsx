import { useState, useEffect } from 'react';
import Chat from './components/Chat';
import AegisVisualizer from './components/AegisVisualizer';
import WorkflowVisualizer from './components/WorkflowVisualizer';
import ScanPipeline from './components/ScanPipeline';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
    const [workflowStatus, setWorkflowStatus] = useState<"IDLE" | "SCANNING" | "ANALYZING" | "VERIFYING" | "COMPLETE">("IDLE");
    const [scanData, setScanData] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [verdict, setVerdict] = useState<'SAFE' | 'UNSAFE'>('SAFE');

    const handleIntent = async (intent: string) => {
        console.log("Intent triggered:", intent);
        setWorkflowStatus("SCANNING");
        setCurrentStep(1);

        // Determine verdict based on keywords
        const isUnsafe = intent.toLowerCase().match(/fail|scam|honey|bad|rug/);
        const finalVerdict = isUnsafe ? 'UNSAFE' : 'SAFE';
        setVerdict(finalVerdict);

        // Simulate scanning process
        setTimeout(() => {
            setWorkflowStatus("ANALYZING");
            setCurrentStep(2);
            setScanData({
                riskScore: isUnsafe ? 10 : 3,
                details: {
                    honeypot: !!isUnsafe,
                    simulation: true,
                    holderAnalysis: true
                }
            });
        }, 3000);

        setTimeout(() => {
            setWorkflowStatus("VERIFYING");
            setCurrentStep(3);
        }, 6000);

        setTimeout(() => {
            setWorkflowStatus("COMPLETE");
            setCurrentStep(4);
        }, 9000);

        // Reset after delay
        setTimeout(() => {
            setWorkflowStatus("IDLE");
            setCurrentStep(0);
            setScanData(null);
            setVerdict('SAFE');
        }, 15000);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 font-mono relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black z-0 pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 h-[calc(100vh-2rem)]">

                {/* Left Panel: Chat Interface */}
                <div className="lg:col-span-4 h-full">
                    <Chat
                        onIntent={handleIntent}
                        isProcessing={workflowStatus !== "IDLE" && workflowStatus !== "COMPLETE"}
                        workflowStatus={workflowStatus}
                        currentStep={currentStep}
                    />
                </div>

                {/* Right Panel: Mission Control Visualizers */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-full">

                    {/* Top: Workflow Steps & Pipeline */}
                    <div className="h-1/3 min-h-[250px] bg-black/50 border border-white/10 rounded-xl p-4 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                        <h3 className="text-sm font-bold text-purple-400 mb-4 tracking-widest uppercase">Target Acquisition & Analysis</h3>
                        <WorkflowVisualizer status={workflowStatus} currentStep={currentStep} />
                        <div className="mt-4">
                            <ScanPipeline status={workflowStatus} />
                        </div>
                    </div>

                    {/* Bottom: Deep Risk Visualizer (The "Brain") */}
                    <div className="flex-1 bg-black/50 border border-white/10 rounded-xl p-4 backdrop-blur-md relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                        <h3 className="text-sm font-bold text-cyan-400 mb-4 tracking-widest uppercase flex items-center gap-2">
                            <span>Deep Neural Scan</span>
                            {workflowStatus === "ANALYZING" && <span className="animate-pulse text-xs text-white">[PROCESSING]</span>}
                        </h3>

                        <div className="flex-1 relative flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {workflowStatus === "IDLE" ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center text-white/30"
                                    >
                                        <div className="text-4xl mb-4 opacity-20">🛡️</div>
                                        <p>AWAITING TARGET DISIGNATION</p>
                                        <p className="text-xs mt-2">SECURE CHANNEL ACTIVE</p>
                                    </motion.div>
                                ) : (
                                    <AegisVisualizer
                                        status={workflowStatus}
                                        scanData={scanData}
                                        verdict={verdict}
                                        currentStep={currentStep}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
