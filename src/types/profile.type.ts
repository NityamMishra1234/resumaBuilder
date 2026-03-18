// Generic API Response
export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Profile Types
export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  twitter: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  skills: Skill[];
}

// Experience
export interface Experience {
  id: string;
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string;
}

// Education
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

// Project
export interface Project {
  id: string;
  title: string;
  description: string;
  githubUrl: string;
  projectUrl: string;
}

// Certification
export interface Certification {
  id: string;
  title: string;
  description: string;
  certificateUrl: string;
}

// Skill
export interface Skill {
  id: string;
  name: string;
  category: string;
}

// Final Type for your API
export type GetProfileResponse = ApiResponse<Profile>;