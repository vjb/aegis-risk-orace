
import { Search, Cpu, Scale, CheckCircle } from 'lucide-react';

interface Props {
    status: string;
    scanData?: any;
}

const steps = [
    { icon: Search, label: "Scanning Code", id: "SCANNING" },
    { icon: Cpu, label: "AI Analysis", id: "ANALYZING" },
    { icon: Scale, label: "Compliance Check", id: "VERIFYING" },
    { icon: CheckCircle, label: "Verdict", id: "COMPLETE" }
];

export default function ScanPipeline({ status, scanData }: Props) {
    const getStepIndex = (s: string) => steps.findIndex(step => step.id === s);
    // const currentIndex = getStepIndex(status) === -1 ? (status === 'COMPLETE' ? 4 : 0) : getStepIndex(status); // Unused

    return (
        <div className="w-full bg-black/40 border border-white/5 rounded-lg p-6 backdrop-blur-sm">
            <ul className="steps steps-vertical lg:steps-horizontal w-full">
                {steps.map((Step, index) => {
                    // Simple logic: if status matches step id, it's active. If passed, it's done.
                    let isActive = false;
                    let isDone = false;

                    if (status === 'COMPLETE') isDone = true;
                    else if (status === Step.id) isActive = true;
                    else if (getStepIndex(status) > index) isDone = true;

                    return (
                        <li key={index} className={`step ${isActive ? 'step-primary' : ''} ${isDone ? 'step-primary' : ''}`}>
                            <span className={`flex items-center gap-2 ${isActive ? 'text-cyan-400 font-bold' : isDone ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                <Step.icon className="w-4 h-4" />
                                {Step.label}
                            </span>
                        </li>
                    );
                })}
            </ul>
            {/* Removed the conditional hiding block - logic moved to parent or simplified to always show if mounted? 
               User request: "Show the pipeline if status is NOT IDLE, OR if we have data". 
               But I missed passing scanData in App.tsx. 
               Correct approach: Add scanData to Props. 
            */}
            {(status !== 'IDLE' || scanData) && (
                status !== 'COMPLETE' && status !== 'IDLE' ? (
                    <div className="mt-4 text-center">
                        <span className="loading loading-infinity loading-lg text-cyan-500"></span>
                        <div className="text-xs font-mono mt-2 animate-pulse text-cyan-400">ESTABLISHING SECURE UPLINK...</div>
                    </div>
                ) : null
            )}

        </div>
    );
}
