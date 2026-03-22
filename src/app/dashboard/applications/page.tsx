"use client";

import { useEffect, useState } from "react";
// Assuming api is exported from your utility file
import api from "@/api/api";
import { formatDistanceToNow } from "date-fns";

// --- Types ---
interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    salaryMin: number;
    salaryMax: number;
}

interface Company {
    id: string;
    name: string;
}

interface Application {
    applicationId: string;
    status: string;
    appliedAt: string;
    resumeUrl: string;
    portfolioUrl: string;
    score: number;
    job: Job;
    company: Company;
}

// --- Utility Functions ---
const formatSalaryToLPA = (min: number, max: number) => {
    const minLPA = (min / 100000).toFixed(1);
    const maxLPA = (max / 100000).toFixed(1);
    return `₹${minLPA} - ${maxLPA} LPA`;
};

const formatTimeAgo = (dateString: string) => {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
        return "Recently";
    }
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending': return 'text-yellow-600';
        case 'accepted': return 'text-green-600';
        case 'rejected': return 'text-red-600';
        default: return 'text-gray-600';
    }
};

// --- Components ---
const ApplicationCard = ({ app }: { app: Application }) => {
    const companyInitial = app.company.name.charAt(0).toUpperCase();

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 w-full max-w-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
            {/* Top Section: Logo & Status */}
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-xl text-blue-600 font-bold text-xl border border-gray-100">
                    {companyInitial}
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className={`text-sm font-medium capitalize flex items-center gap-1 ${getStatusColor(app.status)}`}>
                        {/* Simple dot indicator for status */}
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {app.status}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(app.appliedAt)}
                    </span>
                </div>
            </div>

            {/* Title & Company Info */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                    {app.job.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    {app.company.name} • <span className="text-gray-400">{app.job.location}</span>
                </p>
            </div>

            {/* Tags (Fallback to job type if specific tech tags aren't in this endpoint) */}
            <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 capitalize">
                    {app.job.type.replace("-", " ")}
                </span>
                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">
                    Score: {app.score}
                </span>
            </div>

            <div className="flex-grow"></div>

            {/* Divider */}
            <hr className="border-t border-gray-100 my-5" />

            {/* Footer: Salary & Action Button */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Package</p>
                    <p className="text-sm font-semibold text-gray-900">
                        {formatSalaryToLPA(app.job.salaryMin, app.job.salaryMax)}
                    </p>
                </div>


            </div>
        </div>
    );
};

// --- Main Page ---
export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get("/applications/my");
                const data = response.data || response;
                setApplications(data);
            } catch (error) {
                console.error("Failed to fetch applications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50/50">
                <p className="text-gray-500 font-medium animate-pulse">Loading applications...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Applications</h1>
                    <p className="text-gray-500 mt-1">Track the status of your recent job applications.</p>
                </div>

                {applications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((app) => (
                            <ApplicationCard key={app.applicationId} app={app} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}