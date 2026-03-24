"use client";
import React, { useState } from 'react';
import CodeEditor from '@/components/dashboard/CodeEditor';
import { Terminal, Bug, Play, RefreshCcw } from 'lucide-react';

export default function EditorTestPage() {
    const [code, setCode] = useState("// Type your code here to test the input...");
    const [lang, setLang] = useState("javascript");
    const [logs, setLogs] = useState<string[]>([]);

    const handleRunTest = () => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Executing ${lang} test...`]);
        setLogs(prev => [...prev, `Capture Content: ${code.substring(0, 30)}...`]);
    };

    const handleReset = () => {
        setCode("// Editor reset successful.");
        setLogs([]);
    };

    return (
        <div className="min-h-screen  p-8 flex flex-col items-center">
            <div className="max-w-5xl w-full space-y-6">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                            <Bug className="text-blue-500" /> Editor Debugger
                        </h1>
                        <p className="text-zinc-500 text-sm">Verify Monaco Input & State Sync</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            title='button'
                            onClick={handleReset}
                            className="p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:text-white transition-colors"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleRunTest}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Play className="w-4 h-4" /> Run Test
                        </button>
                    </div>
                </div>

                {/* The Editor Component */}
                <div className=" shadow-2xl">
                    <CodeEditor
                        key="test-editor-instance" // Static key for testing isolation
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        language={lang}
                        setLanguage={setLang}
                    />
                </div>

                {/* State Debugger Output */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                        <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                            <Terminal className="w-3 h-3" /> Live State
                        </h3>
                        <pre className="text-[10px] text-blue-400 font-mono bg-black/40 p-4 rounded-xl overflow-x-auto max-h-[150px]">
                            {JSON.stringify({ language: lang, contentLength: code.length, content: code }, null, 2)}
                        </pre>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                        <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-4">Event Logs</h3>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto">
                            {logs.length === 0 && <p className="text-zinc-700 text-xs italic">No actions recorded yet...</p>}
                            {logs.map((log, i) => (
                                <div key={i} className="text-[10px] font-mono text-zinc-400 py-1 border-b border-zinc-800/50 italic">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}