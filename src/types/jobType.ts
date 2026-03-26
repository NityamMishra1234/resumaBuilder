export interface Company {
    id: string;
    name: string;
    email: string;
    website?: string | null;
    description?: string | null;
    location?: string | null;
    logo?: string | null;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    location: string;
    type: "full-time" | "part-time" | "internship" | "contract";
    salaryMin: number;
    salaryMax: number;
    skills: string[];
    slug: string;
    interviewSlug: string;
    interviewLink: string;
    linkedinMessage: string;
    fullDescription: string;
    company: Company;
    createdAt: string;
}