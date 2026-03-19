"use client";

import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  IndianRupee,
  ArrowRight,
  Sparkles,
  Clock,
  Loader2,
} from "lucide-react";

export const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ location: "", skills: "" });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchJobs();
    }, 400);
    return () => clearTimeout(timeout);
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const params: any = {};
      if (filters.skills) params.skills = filters.skills;
      if (filters.location) params.location = filters.location;

      const { data } = await api.get("/jobs", { params });
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const formatLPA = (amount: number) => (amount / 100000).toFixed(1);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4">

      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-10 md:p-12 text-white border border-zinc-800">

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Find your{" "}
            <span className="text-blue-400">
              Dream Career
            </span>{" "}
            in India’s top startups.
          </h2>

          <p className="text-zinc-400 text-base mb-8">
            Curated opportunities for engineers who build the future.
          </p>

          <div className="flex flex-col md:flex-row gap-3 p-2 bg-zinc-800 rounded-xl border border-zinc-700">

            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input
                placeholder="Search roles, skills..."
                className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-white placeholder:text-zinc-500"
                onChange={(e) =>
                  setFilters({ ...filters, skills: e.target.value })
                }
              />
            </div>

            <select
              title="select"
              className="bg-transparent text-zinc-300 px-4 py-3 outline-none cursor-pointer"
              onChange={(e) => {
                const value = e.target.value;
                setFilters({
                  ...filters,
                  location: value === "ALL" ? "" : value,
                });
              }}
            >
              <option className="text-black" value="ALL">All India</option>
              <option className="text-black" value="Remote">Remote</option>
              <option className="text-black" value="Delhi">Delhi</option>
              <option className="text-black" value="Bengaluru">Bengaluru</option>
            </select>

            <button className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition">
              Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          No jobs found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: any) => (
            <div
              key={job.id}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl transition-all duration-200 hover:border-blue-400"
            >
              <div className="flex justify-between mb-5">
                <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-semibold text-blue-500">
                  {job.company.name.charAt(0)}
                </div>

                <div className="text-right text-xs text-zinc-400">
                  <div className="flex items-center gap-1 text-emerald-500 font-medium">
                    <Sparkles className="w-3 h-3" /> Featured
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> 2h ago
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-500 transition">
                {job.title}
              </h3>

              <p className="text-sm text-zinc-500 flex items-center gap-2 mb-4">
                {job.company.name}
                <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                <MapPin className="w-3 h-3" />
                {job.location || "India"}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills.slice(0, 3).map((skill: string) => (
                  <span
                    key={skill}
                    className="text-xs bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="text-xs text-zinc-400">Package</p>
                  <div className="font-semibold text-base flex items-center">
                    <IndianRupee className="w-4 h-4" />
                    {formatLPA(job.salaryMin)} - {formatLPA(job.salaryMax)}
                    <span className="text-xs ml-1 text-zinc-400">LPA</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(`/dashboard/interview/${job.id}`)
                  }
                  className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
                >
                  Apply
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};