"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    Timer, ShieldAlert, ChevronRight, Loader2, Sparkles, BrainCircuit,
    CheckCircle2, XCircle, Play, BookOpen, Plus, ArrowLeft, Target, FolderHeart
} from 'lucide-react';

// --- Types ---
interface Feedback {
    score: number;
    aiSuggestion: string;
    keyConceptsMissed: string[];
}

interface Topic {
    id: string;
    title: string;
    status: 'pending' | 'completed';
    lastScore?: number;
}

interface PracticeSession {
    id: string;
    goal: string;
    createdAt: string;
    topics: Topic[];
}

// --- Mock Data ---
const INITIAL_SESSIONS: PracticeSession[] = [
    {
        id: "sess_1",
        goal: "Senior Frontend Engineer Interview",
        createdAt: "2026-03-20T10:00:00Z",
        topics: [
            { id: "t_1", title: "React Hooks Deep Dive", status: "completed", lastScore: 8 },
            { id: "t_2", title: "Next.js App Router API", status: "pending" },
            { id: "t_3", title: "System Design: Scalability", status: "pending" },
        ]
    }
];

const MOCK_QUESTIONS = [
    "Explain the difference between useEffect and useLayoutEffect.",
    "How does React handle state batching in version 18?",
];

const MOTIVATIONAL_TEXTS = [
    "Configuring secure practice room...",
    "Activating AI Proctor...",
    "Loading daily topic challenges...",
    "Focus mode engaged. You've got this."
];

export default function PracticePlatform() {
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);

    // Flow State
    const [step, setStep] = useState<'sessions' | 'topics' | 'lobby' | 'loading' | 'exam' | 'analyzing' | 'review'>('sessions');
    const [loadingText, setLoadingText] = useState(MOTIVATIONAL_TEXTS[0]);

    // Data State
    const [sessions, setSessions] = useState<PracticeSession[]>(INITIAL_SESSIONS);
    const [activeSession, setActiveSession] = useState<PracticeSession | null>(null);
    const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
    const [newGoalInput, setNewGoalInput] = useState("");
    const [isCreatingSession, setIsCreatingSession] = useState(false);

    // Exam State
    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState(300);

    // --- 1. Session Management ---
    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoalInput.trim()) return;

        setIsCreatingSession(true);
        // SIMULATE API CALL: api.post('/practice/sessions', { goal: newGoalInput })
        // Gemini generates topics based on the goal
        setTimeout(() => {
            const newSession: PracticeSession = {
                id: `sess_${Date.now()}`,
                goal: newGoalInput,
                createdAt: new Date().toISOString(),
                topics: [
                    { id: `t_${Date.now()}_1`, title: "Core Fundamentals", status: "pending" },
                    { id: `t_${Date.now()}_2`, title: "Advanced Problem Solving", status: "pending" },
                ]
            };
            setSessions([newSession, ...sessions]);
            setNewGoalInput("");
            setIsCreatingSession(false);
            openSession(newSession);
        }, 2000);
    };

    const openSession = (session: PracticeSession) => {
        setActiveSession(session);
        setStep('topics');
    };

    // --- 2. Security & Lockdown ---
    const disqualify = useCallback((reason: string) => {
        if (step !== 'exam') return;
        toast({
            title: "PRACTICE INTERRUPTED",
            description: `Focus lost: ${reason}.`,
            variant: "destructive"
        });
        setStep('topics');
    }, [step, toast]);

    useEffect(() => {
        const handleVisibility = () => { if (document.hidden) disqualify("Tab Switching"); };
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && step === 'exam') disqualify("Exited Fullscreen Mode");
        };
        window.addEventListener("visibilitychange", handleVisibility);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            window.removeEventListener("visibilitychange", handleVisibility);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [disqualify, step]);

    // --- 3. Exam Flow ---
    const selectTopicAndStart = (topic: Topic) => {
        setActiveTopic(topic);
        setStep('lobby');
    };

    const viewPastResults = (topic: Topic) => {
        setActiveTopic(topic);
        // Simulate loading past results
        setQuestions(MOCK_QUESTIONS);
        setAnswers(["My old answer 1", "My old answer 2"]);
        setFeedbacks([
            { score: topic.lastScore || 7, aiSuggestion: "Previously generated feedback.", keyConceptsMissed: [] },
            { score: 8, aiSuggestion: "Previously generated feedback 2.", keyConceptsMissed: [] }
        ]);
        setStep('review');
    };

    const startPracticeExam = async () => {
        setStep('loading');
        let textIdx = 0;
        const interval = setInterval(() => {
            textIdx = (textIdx + 1) % MOTIVATIONAL_TEXTS.length;
            setLoadingText(MOTIVATIONAL_TEXTS[textIdx]);
        }, 1500);

        try {
            if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();

            setTimeout(() => {
                setQuestions(MOCK_QUESTIONS);
                setAnswers(new Array(MOCK_QUESTIONS.length).fill(""));
                setCurrentIdx(0);
                setCurrentAnswer("");
                clearInterval(interval);
                setStep('exam');
            }, 3000);
        } catch (err) {
            setStep('topics');
            toast({ title: "Setup Error", description: "Could not initialize secure mode.", variant: "destructive" });
        }
    };

    const handleNext = () => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentIdx] = currentAnswer;
        setAnswers(updatedAnswers);

        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setCurrentAnswer(answers[currentIdx + 1] || "");
            setTimeLeft(300);
        } else {
            finishExam(updatedAnswers);
        }
    };

    const finishExam = async (finalAnswers: string[]) => {
        if (document.exitFullscreen) document.exitFullscreen();
        setStep('analyzing');

        setTimeout(() => {
            setFeedbacks([
                { score: 7, aiSuggestion: "Good understanding of useEffect. Mention useLayoutEffect is synchronous.", keyConceptsMissed: ["Synchronous execution"] },
                { score: 9, aiSuggestion: "Excellent. You identified React 18 automatic batching.", keyConceptsMissed: [] }
            ]);

            // Update topic status to completed in local state
            if (activeSession && activeTopic) {
                const updatedSessions = sessions.map(s => {
                    if (s.id === activeSession.id) {
                        return {
                            ...s,
                            topics: s.topics.map(t => t.id === activeTopic.id ? { ...t, status: 'completed', lastScore: 8 } as Topic : t)
                        };
                    }
                    return s;
                });
                setSessions(updatedSessions);
                setActiveSession(updatedSessions.find(s => s.id === activeSession.id) || null);
            }

            setStep('review');
        }, 4000);
    };

    // Timer
    useEffect(() => {
        if (step !== 'exam') return;
        if (timeLeft <= 0) { handleNext(); return; }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, step]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-blue-500 selection:text-white pb-20">

            {/* --- SESSIONS DASHBOARD (Level 1) --- */}
            {step === 'sessions' && (
                <div className="max-w-5xl mx-auto p-8 animate-in fade-in duration-500">
                    <header className="mb-12 mt-10">
                        <h1 className="text-4xl font-black tracking-tight">Practice Hub</h1>
                        <p className="text-zinc-500 mt-2 text-lg">Define your goal, and let AI build your interview curriculum.</p>
                    </header>

                    {/* Create New Session Card */}
                    <form onSubmit={handleCreateSession} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[32px] shadow-sm mb-12">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 block ml-2">Start New Track</label>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
                                <input
                                    autoFocus
                                    disabled={isCreatingSession}
                                    value={newGoalInput}
                                    onChange={(e) => setNewGoalInput(e.target.value)}
                                    className="w-full pl-16 pr-6 py-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl outline-none focus:ring-2 ring-blue-500 text-lg transition-all"
                                    placeholder="e.g., UPSC Prelims 2026, or React JS Frontend..."
                                />
                            </div>
                            <button
                                disabled={isCreatingSession || !newGoalInput.trim()}
                                type="submit"
                                className="bg-blue-600 text-white px-10 py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                                {isCreatingSession ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-5 h-5" /> Generate</>}
                            </button>
                        </div>
                    </form>

                    {/* Active Sessions Grid */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 ml-2">Your Active Tracks</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {sessions.map((session) => {
                                const completed = session.topics.filter(t => t.status === 'completed').length;
                                const total = session.topics.length;
                                const progress = Math.round((completed / total) * 100);

                                return (
                                    <div
                                        key={session.id}
                                        onClick={() => openSession(session)}
                                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[32px] cursor-pointer hover:shadow-xl hover:border-blue-500/50 transition-all group flex flex-col justify-between min-h-[200px]"
                                    >
                                        <div>
                                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                <FolderHeart className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold leading-tight line-clamp-2">{session.goal}</h3>
                                        </div>
                                        <div className="mt-8">
                                            <div className="flex justify-between text-sm mb-2 font-medium">
                                                <span className="text-zinc-500">{completed} of {total} Topics</span>
                                                <span className="text-blue-500">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* --- TOPICS VIEW (Level 2) --- */}
            {step === 'topics' && activeSession && (
                <div className="max-w-5xl mx-auto p-8 animate-in slide-in-from-right-8 duration-500">
                    <button
                        onClick={() => setStep('sessions')}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Practice Hub
                    </button>

                    <header className="mb-12">
                        <h1 className="text-4xl font-black tracking-tight">{activeSession.goal}</h1>
                        <p className="text-zinc-500 mt-2 text-lg">Select a topic to begin your secure practice session.</p>
                    </header>

                    <div className="grid gap-4">
                        {activeSession.topics.map((topic) => (
                            <div key={topic.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${topic.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'}`}>
                                        {topic.status === 'completed' ? <CheckCircle2 className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{topic.title}</h3>
                                        {topic.status === 'completed' ? (
                                            <p className="text-sm font-medium text-green-600 mt-1">Completed • Score: {topic.lastScore}/10</p>
                                        ) : (
                                            <p className="text-sm text-zinc-500 mt-1">Pending • Needs Attention</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full sm:w-auto">
                                    {topic.status === 'completed' ? (
                                        <>
                                            <button onClick={() => viewPastResults(topic)} className="flex-1 sm:flex-none bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                                Results
                                            </button>
                                            <button onClick={() => selectTopicAndStart(topic)} className="flex-1 sm:flex-none bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                                                Re-attempt
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => selectTopicAndStart(topic)} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                                            Start <Play className="w-4 h-4 fill-current" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- LOBBY STEP --- */}
            {step === 'lobby' && activeTopic && (
                <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col items-center p-6 overflow-y-auto">
                    <div className="max-w-4xl w-full mt-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <button onClick={() => setStep('topics')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Cancel
                        </button>
                        <div className="text-center space-y-2">
                            <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl mb-4">
                                <ShieldAlert className="text-blue-500 w-8 h-8" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter">Secure Practice Mode</h1>
                            <p className="text-zinc-500 text-lg">Topic: <span className="font-bold text-zinc-900 dark:text-white">{activeTopic.title}</span></p>
                        </div>
                        {/* Video & Rules Grid remains identical */}
                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            <div className="bg-black rounded-[32px] overflow-hidden shadow-2xl relative min-h-[300px]">
                                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover grayscale-[0.5]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                    <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Camera Active
                                    </span>
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-xl tracking-tight">Rules of Engagement</h3>
                                    <div className="space-y-3">
                                        {["Fullscreen will be enforced", "Tab switching will terminate the session", "AI will evaluate your answers post-exam"].map((rule, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {rule}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={startPracticeExam} className="mt-8 w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-xl">
                                    ENTER SECURE ENVIRONMENT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LOADING STEP --- */}
            {step === 'loading' && (
                <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="w-24 h-24 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                        <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 w-8 h-8" />
                    </div>
                    <h2 className="text-white text-2xl font-bold tracking-tight animate-pulse">{loadingText}</h2>
                </div>
            )}

            {/* --- EXAM STEP --- */}
            {step === 'exam' && (
                <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col items-center p-6 overflow-y-auto">
                    <div className="w-full max-w-5xl space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center gap-4 px-4">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400">Secure Practice</span>
                            </div>
                            <div className="bg-zinc-100 dark:bg-zinc-800 px-6 py-2 rounded-xl flex items-center gap-3">
                                <Timer className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-500' : 'text-zinc-400'}`} />
                                <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-500' : ''}`}>
                                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800 min-h-[600px] flex flex-col">
                            <div className="flex justify-between items-start mb-8">
                                <h2 className="text-3xl font-bold tracking-tight max-w-3xl leading-tight">{questions[currentIdx]}</h2>
                                <span className="text-zinc-200 dark:text-zinc-800 font-black text-7xl italic select-none">{String(currentIdx + 1).padStart(2, '0')}</span>
                            </div>
                            <textarea
                                autoFocus
                                className="flex-1 w-full p-8 bg-zinc-50 dark:bg-zinc-950/50 rounded-[32px] outline-none border-2 border-transparent focus:border-blue-500/20 text-xl resize-none font-medium leading-relaxed transition-all"
                                placeholder="Type your answer here..."
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                            />
                            <div className="mt-8 flex justify-end">
                                <button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest text-xs">
                                    {currentIdx === questions.length - 1 ? "Submit for Analysis" : "Next Question"} <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- AI ANALYZING STEP --- */}
            {step === 'analyzing' && (
                <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                    <div className="relative">
                        <Sparkles className="w-16 h-16 text-blue-500 animate-pulse" />
                        <div className="absolute inset-0 blur-xl bg-blue-500/30 rounded-full animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">Gemini is analyzing your responses...</h2>
                    <p className="text-zinc-500">Evaluating technical accuracy and communication clarity.</p>
                </div>
            )}

            {/* --- AI REVIEW STEP --- */}
            {step === 'review' && (
                <div className="max-w-5xl mx-auto p-8 animate-in slide-in-from-bottom-12 duration-700 mt-10">
                    <div className="mb-12 text-center">
                        <div className="inline-flex p-4 bg-green-500/10 text-green-500 rounded-3xl mb-6">
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter mb-4">Assessment Complete</h1>
                        <p className="text-zinc-500 text-lg">Review your performance for: <span className="font-bold text-zinc-900 dark:text-white">{activeTopic?.title}</span></p>
                    </div>

                    <div className="space-y-12">
                        {questions.map((q, idx) => (
                            <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-lg">
                                <div className="bg-zinc-50 dark:bg-zinc-950/50 p-8 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-start gap-6">
                                    <div>
                                        <span className="text-sm font-black text-blue-500 uppercase tracking-widest mb-2 block">Question {idx + 1}</span>
                                        <h3 className="text-2xl font-bold leading-snug">{q}</h3>
                                    </div>
                                    <div className={`shrink-0 px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2 ${feedbacks[idx].score >= 8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        Score: {feedbacks[idx].score}/10
                                    </div>
                                </div>
                                <div className="p-8 grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Your Answer</h4>
                                        <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl italic">
                                            "{answers[idx] || "No answer provided."}"
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> Gemini Suggestion
                                        </h4>
                                        <p className="text-zinc-900 dark:text-white bg-blue-50 dark:bg-blue-500/10 p-6 rounded-2xl font-medium leading-relaxed border border-blue-100 dark:border-blue-500/20">
                                            {feedbacks[idx].aiSuggestion}
                                        </p>
                                        {feedbacks[idx].keyConceptsMissed.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                <span className="text-xs font-bold text-red-500 uppercase">Concepts Missed:</span>
                                                <ul className="mt-2 space-y-1">
                                                    {feedbacks[idx].keyConceptsMissed.map((concept, i) => (
                                                        <li key={i} className="text-sm flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                                            <XCircle className="w-3 h-3 text-red-400" /> {concept}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={() => setStep('topics')}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-black px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" /> Back to Topics
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}