"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/api/api';
import { useToast } from '@/hooks/use-toast';
import CodeEditor from '@/components/dashboard/CodeEditor';
import {
    Timer, ShieldAlert, ChevronRight, FileText,
    Link as LinkIcon, Loader2, Sparkles, BrainCircuit,
    AlertTriangle, Camera
} from 'lucide-react';

interface Question {
    question: string;
    type: 'text' | 'coding';
    difficulty: string;
}

const MOTIVATIONAL_TEXTS = [
    "Securing your environment...",
    "Calibrating the proctoring AI...",
    "Get ready to show your skills!",
    "The best engineers are born under pressure.",
    "Deep breaths. You've got this."
];

export default function InterviewPage() {
    const { jobId } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const floatingVideoRef = useRef<HTMLVideoElement>(null);

    // Flow State
    const [step, setStep] = useState<'lobby' | 'loading' | 'exam' | 'final'>('lobby');
    const [loadingText, setLoadingText] = useState(MOTIVATIONAL_TEXTS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Interview Data
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState(300);
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");

    // Security/Proctoring
    const [strikes, setStrikes] = useState(0);
    const MAX_STRIKES = 3;

    // Form Data
    const [resumeUrl, setResumeUrl] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");

    // --- 1. Hardware Initialization (Camera) ---
    useEffect(() => {
        async function enableStream() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(() => { });
                }

                if (floatingVideoRef.current) {
                    floatingVideoRef.current.srcObject = stream;
                    floatingVideoRef.current.play().catch(() => { });
                }
            } catch (err) {
                console.error("Camera access denied", err);
            }
        }
        enableStream();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (!streamRef.current) return;

        if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => { });
        }

        if (floatingVideoRef.current) {
            floatingVideoRef.current.srcObject = streamRef.current;
            floatingVideoRef.current.play().catch(() => { });
        }
    }, [step]);

    useEffect(() => {
        const detectDevTools = () => {
            const threshold = 160;

            if (
                window.outerWidth - window.innerWidth > threshold ||
                window.outerHeight - window.innerHeight > threshold
            ) {
                disqualify("DevTools opened");
            }
        };

        const interval = setInterval(detectDevTools, 1000);

        return () => clearInterval(interval);
    });

    // --- 2. Security Logic ---
    const disqualify = useCallback((reason: string) => {
        if (step !== 'exam') return;

        // Use a safe toast trigger to avoid the render-phase error
        setTimeout(() => {
            toast({
                title: "INTERVIEW TERMINATED",
                description: `Security Breach: ${reason}`,
                variant: "destructive"
            });
        }, 0);

        sessionStorage.removeItem(`interview_answers_${jobId}`);
        router.push('/dashboard/jobs');
    }, [step, router, toast, jobId]);

    useEffect(() => {
        if (step !== 'exam') return;

        const handleVisibility = () => { if (document.hidden) disqualify("Tab Switching"); };
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                disqualify("Exited Fullscreen Mode");
            }
        };

        window.addEventListener("visibilitychange", handleVisibility);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            window.removeEventListener("visibilitychange", handleVisibility);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [disqualify, step]);

    // --- 3. Persistence & Logic ---
    useEffect(() => {
        const savedAnswers = sessionStorage.getItem(`interview_answers_${jobId}`);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    }, [jobId]);

    const startExamFlow = async () => {
        setStep('loading');
        let textIdx = 0;
        const interval = setInterval(() => {
            textIdx = (textIdx + 1) % MOTIVATIONAL_TEXTS.length;
            setLoadingText(MOTIVATIONAL_TEXTS[textIdx]);
        }, 1500);

        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }

            const { data } = await api.post(`/interview/start/${jobId}`);
            setQuestions(data.questions);

            const firstType = data.questions[0].type;
            setTimeLeft(firstType === 'coding' ? 1200 : 300);

            const saved = sessionStorage.getItem(`interview_answers_${jobId}`);
            const initialAnswers = saved ? JSON.parse(saved) : new Array(data.questions.length).fill("");
            setAnswers(initialAnswers);
            setCurrentAnswer(initialAnswers[0] || "");

            setTimeout(() => {
                clearInterval(interval);
                setStep('exam');
            }, 4000);
        } catch (err) {
            setStep('lobby');
            toast({ title: "Setup Error", description: "Failed to load questions.", variant: "destructive" });
        }
    };

    const handleNext = () => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentIdx] = currentAnswer;
        setAnswers(updatedAnswers);
        sessionStorage.setItem(`interview_answers_${jobId}`, JSON.stringify(updatedAnswers));

        if (currentIdx < questions.length - 1) {
            const nextIdx = currentIdx + 1;
            const nextType = questions[nextIdx].type;

            setCurrentIdx(nextIdx);
            setCurrentAnswer(updatedAnswers[nextIdx] || "");
            setTimeLeft(nextType === 'coding' ? 1200 : 300);
        } else {
            setStep('final');
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    useEffect(() => {
        if (step !== 'exam') return;
        if (timeLeft <= 0) { handleNext(); return; }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, step]);

    const submitFinalApplication = async () => {
        setIsSubmitting(true);
        try {

            const questionStrings = questions.map(q => q.question);


            const finalAnswers = [...answers];
            finalAnswers[currentIdx] = currentAnswer;


            const payload = {
                jobId,
                questions: questionStrings,
                answers: finalAnswers,
                resumeUrl,
                portfolioUrl
            };

            console.log(" FINAL PAYLOAD:", payload);

            await api.post('/interview/complete', payload);
            sessionStorage.removeItem(`interview_answers_${jobId}`);
            toast({ title: "Success", description: "Application submitted successfully!" });
            router.push('/dashboard/jobs');
        } catch (err: any) {
            console.log("❌ BACKEND ERROR:", err?.response?.data);
            toast({ title: "Submission Error", description: "Could not submit application.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 overflow-y-auto selection:bg-blue-500 selection:text-white">

            {/* LOADING SCREEN */}
            {step === 'loading' && (
                <div className="h-screen w-full flex flex-col items-center justify-center space-y-8 bg-zinc-950 animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="w-24 h-24 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-white text-2xl font-bold animate-pulse">{loadingText}</h2>
                    </div>
                </div>
            )}

            <div className="min-h-screen flex flex-col items-center p-6">

                {/* LOBBY */}
                {step === 'lobby' && (
                    <div className="max-w-4xl w-full mt-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-2">
                            <ShieldAlert className="mx-auto text-blue-500 w-12 h-12 mb-4" />
                            <h1 className="text-5xl font-black tracking-tighter">Ready for the Challenge?</h1>
                            <p className="text-zinc-500 text-lg">Verification complete. Camera is live.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            <div className="bg-black rounded-[32px] overflow-hidden shadow-2xl relative">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale-[0.3]" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-white text-xs font-bold uppercase tracking-widest">Live Monitoring</span>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                                <div className="space-y-4 text-sm font-medium">
                                    <h3 className="font-bold text-xl">System Integrity</h3>
                                    <p>• Tab switching will end the session.</p>
                                    <p>• Exiting fullscreen will end the session.</p>
                                    <p>• Your face must be visible to the AI.</p>
                                </div>
                                <button onClick={startExamFlow} className="mt-8 w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg hover:scale-105 transition-all">
                                    START INTERVIEW
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EXAM STEP */}
                {step === 'exam' && questions.length > 0 && (
                    <div className="w-full max-w-6xl space-y-6 animate-in fade-in duration-500">
                        <div className="fixed bottom-6 right-6 w-40 h-32 rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg z-50 bg-black">
                            <video
                                ref={floatingVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center gap-4 px-4">
                                <div className="flex items-center gap-2 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full">
                                    <BrainCircuit className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase">{questions[currentIdx].type}</span>
                                </div>

                            </div>

                            <div className={`px-6 py-2 rounded-xl flex items-center gap-3 ${timeLeft < 60 ? 'bg-red-500/10 text-red-500' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                <Timer className="w-4 h-4" />
                                <span className="font-mono font-bold text-lg">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 lg:p-12 shadow-2xl border border-zinc-200 min-h-[750px] flex flex-col">
                            <div className="flex justify-between items-start mb-10">
                                <h2 className="text-2xl lg:text-3xl font-bold max-w-3xl leading-snug">
                                    {questions[currentIdx].question}
                                </h2>
                                <span className="text-zinc-100 dark:text-zinc-800 font-black text-6xl italic leading-none">{String(currentIdx + 1).padStart(2, '0')}</span>
                            </div>

                            <div className="flex-1 flex flex-col">
                                {questions[currentIdx].type === 'coding' ? (
                                    <CodeEditor
                                        key={`editor-${currentIdx}`} // KEY IS VITAL FOR UPDATING
                                        value={currentAnswer}
                                        onChange={(val) => setCurrentAnswer(val || "")}
                                        language={selectedLanguage}
                                        setLanguage={setSelectedLanguage}
                                    />
                                ) : (
                                    <textarea
                                        autoFocus
                                        className="flex-1 w-full p-8 bg-zinc-50 dark:bg-zinc-950/50 rounded-[32px] outline-none border-2 border-transparent focus:border-blue-500/20 text-xl font-medium resize-none transition-all"
                                        placeholder="Type your explanation here..."
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 shadow-lg tracking-widest text-xs uppercase">
                                    {currentIdx === questions.length - 1 ? "Complete Interview" : "Next Question"} <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FINAL SUBMISSION */}
                {step === 'final' && (
                    <div className="max-w-xl w-full mt-20 animate-in slide-in-from-bottom-12 duration-700">
                        <div className="bg-white dark:bg-zinc-900 rounded-[48px] p-12 shadow-2xl text-center border border-zinc-100 dark:border-zinc-800">
                            <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-6" />
                            <h2 className="text-4xl font-black tracking-tight mb-4">Interview Complete!</h2>
                            <p className="text-zinc-500 mb-10">Verification ended. Please add your professional links to submit.</p>

                            <div className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-4">Resume Link</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input className="w-full pl-12 pr-4 py-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl outline-none" placeholder="https://..." value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-4">Portfolio Link (Optional)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input className="w-full pl-12 pr-4 py-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl outline-none" placeholder="https://..." value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={isSubmitting || !resumeUrl}
                                onClick={submitFinalApplication}
                                className="w-full mt-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : "SUBMIT APPLICATION"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}