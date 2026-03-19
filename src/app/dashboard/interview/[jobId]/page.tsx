"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/api/api';
import { useToast } from '@/hooks/use-toast';
import {
    Timer, ShieldAlert, ChevronRight, FileText,
    Link as LinkIcon, Loader2, Info, Sparkles
} from 'lucide-react';

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

    // Flow State
    const [step, setStep] = useState<'lobby' | 'loading' | 'exam' | 'final'>('lobby');
    const [loadingText, setLoadingText] = useState(MOTIVATIONAL_TEXTS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Interview Data
    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState(300);

    // Form Data
    const [resumeUrl, setResumeUrl] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");

    // 1. Initial State Restoration (On accidental refresh)
    useEffect(() => {
        const savedAnswers = sessionStorage.getItem(`interview_answers_${jobId}`);
        if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
            // Optional: Check if they were already in exam mode and punish/warn
        }
    }, [jobId]);

    // 2. Security: The "Iron-Clad" Disqualification
    const disqualify = useCallback((reason: string) => {
        if (step !== 'exam') return;
        toast({
            title: "INTERVIEW TERMINATED",
            description: `Security Breach: ${reason}`,
            variant: "destructive"
        });
        // Clean up session so they can't resume
        sessionStorage.removeItem(`interview_answers_${jobId}`);
        router.push('/dashboard/jobs');
    }, [step, router, toast, jobId]);

    useEffect(() => {
        const handleVisibility = () => { if (document.hidden) disqualify("Tab Switching"); };

        // Check if user manually exits fullscreen
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && step === 'exam') {
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

    // 3. Start Flow with Motivation Loader
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

            // Initialize or Restore answers
            const saved = sessionStorage.getItem(`interview_answers_${jobId}`);
            setAnswers(saved ? JSON.parse(saved) : new Array(data.questions.length).fill(""));

            setTimeout(() => {
                clearInterval(interval);
                setStep('exam');
            }, 4000); // Forced 4s for premium feel
        } catch (err) {
            setStep('lobby');
            toast({ title: "Setup Error", description: "Could not initialize proctoring.", variant: "destructive" });
        }
    };

    // 4. Persistence & Navigation
    const handleNext = () => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentIdx] = currentAnswer;
        setAnswers(updatedAnswers);
        sessionStorage.setItem(`interview_answers_${jobId}`, JSON.stringify(updatedAnswers));

        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setCurrentAnswer(answers[currentIdx + 1] || "");
            setTimeLeft(300);
        } else {
            setStep('final');
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    // 5. Timer Logic
    useEffect(() => {
        if (step !== 'exam') return;
        if (timeLeft <= 0) { handleNext(); return; }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, step]);

    const submitFinalApplication = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/interview/complete', { jobId, questions, answers, resumeUrl, portfolioUrl });
            sessionStorage.removeItem(`interview_answers_${jobId}`);
            toast({ title: "Submitted", description: "Good luck with the results!" });
            router.push('/dashboard/jobs');
        } catch (err) {
            toast({ title: "API Error", description: "Submission failed.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 overflow-y-auto selection:bg-blue-500 selection:text-white">

            {/* GLOBAL MOTIVATION LOADER */}
            {step === 'loading' && (
                <div className="h-screen w-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500 bg-zinc-950">
                    <div className="relative">
                        <div className="w-24 h-24 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 w-8 h-8" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-white text-2xl font-bold tracking-tight animate-pulse">{loadingText}</h2>
                        <p className="text-zinc-500 text-sm">Please do not refresh or close the window.</p>
                    </div>
                </div>
            )}

            <div className="min-h-screen flex flex-col items-center p-6">

                {/* LOBBY */}
                {step === 'lobby' && (
                    <div className="max-w-4xl w-full mt-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-2">
                            <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl mb-4">
                                <ShieldAlert className="text-blue-500 w-8 h-8" />
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter">Ready for the Challenge?</h1>
                            <p className="text-zinc-500 text-lg">Your technical interview with Scratchnest is about to begin.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            <div className="bg-black rounded-[32px] overflow-hidden shadow-2xl relative">
                                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover grayscale-[0.5]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-1 h-4 bg-blue-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-1 h-6 bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-1 h-3 bg-blue-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                                    </div>
                                    <span className="text-white text-xs font-bold uppercase tracking-widest">Mic Active</span>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-xl tracking-tight">System Integrity</h3>
                                    <div className="space-y-3">
                                        {[
                                            "Camera & Microphone Access Granted",
                                            "Fullscreen Lockdown Authorization",
                                            "Automatic Disqualification Protocol Active",
                                            "Real-time Audio/Video Monitoring"
                                        ].map((rule, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {rule}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={startExamFlow} className="mt-8 w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-xl">
                                    INITIATE INTERVIEW
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EXAM */}
                {step === 'exam' && (
                    <div className="w-full max-w-5xl space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        {/* Minimalist Top Nav */}
                        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center gap-4 px-4">
                                <div className="relative">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                                    <div className="absolute inset-0 w-3 h-3 bg-red-600 rounded-full" />
                                </div>
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400">Live Session</span>
                            </div>

                            <div className="bg-zinc-100 dark:bg-zinc-800 px-6 py-2 rounded-xl flex items-center gap-3">
                                <Timer className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-500' : 'text-zinc-400'}`} />
                                <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-500' : ''}`}>
                                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Question Workspace */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            <div className="lg:col-span-12 bg-white dark:bg-zinc-900 rounded-[40px] p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800 min-h-[600px] flex flex-col">
                                <div className="flex justify-between items-start mb-8">
                                    <h2 className="text-3xl font-bold tracking-tight max-w-3xl leading-tight">
                                        {questions[currentIdx]}
                                    </h2>
                                    <span className="text-zinc-200 dark:text-zinc-800 font-black text-7xl italic select-none">
                                        {String(currentIdx + 1).padStart(2, '0')}
                                    </span>
                                </div>
                                <textarea
                                    autoFocus
                                    className="flex-1 w-full p-8 bg-zinc-50 dark:bg-zinc-950/50 rounded-[32px] outline-none border-2 border-transparent focus:border-blue-500/20 text-xl resize-none font-medium leading-relaxed transition-all"
                                    placeholder="Describe your approach and write the code..."
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                />
                                <div className="mt-8 flex justify-end">
                                    <button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest text-xs">
                                        {currentIdx === questions.length - 1 ? "Complete Interview" : "Next Question"} <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FINAL */}
                {step === 'final' && (
                    <div className="max-w-xl w-full mt-20 animate-in slide-in-from-bottom-12 duration-700">
                        <div className="bg-white dark:bg-zinc-900 rounded-[48px] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] text-center border border-zinc-100 dark:border-zinc-800">
                            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Sparkles className="w-10 h-10" />
                            </div>
                            <h2 className="text-4xl font-black tracking-tight mb-4">You Nailed It!</h2>
                            <p className="text-zinc-500 mb-10">Lockdown is off. Add your profile links to submit the final application to the HR team.</p>

                            <div className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-4">Resume URL</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl outline-none focus:ring-2 ring-blue-500" placeholder="https://..." value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-4">Portfolio URL (Optional)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl outline-none focus:ring-2 ring-blue-500" placeholder="https://..." value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={isSubmitting || !resumeUrl}
                                onClick={submitFinalApplication}
                                className="w-full mt-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:opacity-90 disabled:opacity-50"
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