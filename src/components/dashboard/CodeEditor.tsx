// components/CodeEditor.tsx
"use client";
import React from "react";
import Editor from "@monaco-editor/react";
import { Code2 } from "lucide-react";

interface CodeEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    language: string;
    setLanguage: (lang: string) => void;
}

const LANGUAGES = [
    { label: "JavaScript", value: "javascript" },
    { label: "TypeScript", value: "typescript" },
    { label: "Python", value: "python" },
    { label: "Java", value: "java" },
    { label: "C++", value: "cpp" },
];

export default function CodeEditor({ value, onChange, language, setLanguage }: CodeEditorProps) {
    return (
        <div className="flex-1 w-full min-h-[500px] flex flex-col rounded-[32px] overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-[#1e1e1e]">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Code2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Editor</span>
                </div>
                <select
                    title="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-zinc-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-all cursor-pointer"
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                </select>
            </div>

            {/* Editor */}
            <div className="h-[500px] w-full">
                <Editor
                    height="100%"
                    theme="vs-dark"
                    language={language}
                    value={value}
                    onChange={onChange}
                    options={{
                        fontSize: 15,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16 },
                        fontFamily: "'Fira Code', monospace",
                    }}
                />
            </div>
        </div>
    );
}