"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type { Job } from "@/types/jobType";
import { Loader2, MapPin, IndianRupee, Building2 } from "lucide-react";

import publicApi from "@/api/publicApi";

//  Firebase imports
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../../utils/fireBase";

import { tokenServices } from "@/api/tokenService";
import api from "@/api/api";
import { useAuth } from "@/providers/AuthProvider";

export default function JobDetailsPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();

    const { login } = useAuth()

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const fetchJob = async () => {
            try {
                const { data } = await publicApi.get(`/jobs/public/${slug}`);
                setJob(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [slug]);

    const formatLPA = (amount: number) => (amount / 100000).toFixed(1);

    //  MAIN APPLY HANDLER
    const handleApply = async () => {
        try {
            const existingToken = await tokenServices.getAccesToken();

            if (existingToken) {
                router.push(`/dashboard/interview/${job?.id}`);
                return;
            }

            setAuthLoading(true);

            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            const res = await api.post("/auth/google", { idToken });

            await login(
                res.data.user,
                res.data.token.accessToken,
                res.data.token.refreshToken
            );

            router.push(`/dashboard/interview/${job?.id}`);
        } catch (err) {
            console.error("Auth Error:", err);
        } finally {
            setAuthLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="h-screen flex items-center justify-center text-gray-500">
                Job not found
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-black min-h-screen">

            {/* HERO */}
            <div className="border-b border-gray-200 dark:border-zinc-800">
                <div className="max-w-5xl mx-auto px-6 py-10">

                    <h1 className="text-4xl font-bold mb-4">{job.title}</h1>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {job.company.name}
                        </span>

                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                        </span>

                        <span className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {formatLPA(job.salaryMin)} - {formatLPA(job.salaryMax)} LPA
                        </span>
                    </div>

                    {/* SKILLS */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {job.skills.map((skill) => (
                            <span
                                key={skill}
                                className="bg-gray-100 dark:bg-zinc-800 px-3 py-1 text-sm rounded-md"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>

                    {/*  APPLY BUTTON */}
                    <button
                        onClick={handleApply}
                        disabled={authLoading}
                        className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2 disabled:opacity-60"
                    >
                        {authLoading && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        {authLoading
                            ? "Starting Interview..."
                            : "Apply & Start Interview"}
                    </button>
                </div>
            </div>

            {/* DESCRIPTION */}
            <div className="max-w-5xl mx-auto px-6 py-10">

                <h2 className="text-2xl font-semibold mb-6">Job Description</h2>

                <div className="prose max-w-none dark:prose-invert">
                    {job.fullDescription.split("\n").map((line, i) => {
                        if (line.startsWith("###")) {
                            return <h3 key={i}>{line.replace("###", "").trim()}</h3>;
                        }
                        if (line.startsWith("**")) {
                            return <h4 key={i}>{line.replace(/\*\*/g, "")}</h4>;
                        }
                        if (line.startsWith("*")) {
                            return <li key={i}>{line.replace("*", "")}</li>;
                        }
                        return <p key={i}>{line}</p>;
                    })}
                </div>
            </div>
        </div>
    );
}