"use client";

import { useEffect } from "react";

export default function MonacoProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        if (typeof window !== "undefined") {
            (window as any).MonacoEnvironment = {
                getWorker: function (_: any, label: string) {
                    if (label === "json") {
                        return new Worker(
                            new URL("monaco-editor/esm/vs/language/json/json.worker", import.meta.url)
                        );
                    }
                    if (label === "css") {
                        return new Worker(
                            new URL("monaco-editor/esm/vs/language/css/css.worker", import.meta.url)
                        );
                    }
                    if (label === "html") {
                        return new Worker(
                            new URL("monaco-editor/esm/vs/language/html/html.worker", import.meta.url)
                        );
                    }
                    if (label === "typescript" || label === "javascript") {
                        return new Worker(
                            new URL("monaco-editor/esm/vs/language/typescript/ts.worker", import.meta.url)
                        );
                    }
                    return new Worker(
                        new URL("monaco-editor/esm/vs/editor/editor.worker", import.meta.url)
                    );
                },
            };
        }
    }, []);

    return <>{children}</>;
}