import { z } from 'zod';

export const resumeProfileSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url('Must be a valid URL').or(z.literal('')),
  github: z.string().url('Must be a valid URL').or(z.literal('')),
  portfolio: z.string().url('Must be a valid URL').or(z.literal('')),
  twitter: z.string().url('Must be a valid URL').or(z.literal('')),
  summary: z.string().optional(),
  
  experiences: z.array(z.object({
    company: z.string().min(1, 'Company is required'),
    role: z.string().min(1, 'Role is required'),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })),

  education: z.array(z.object({
    institution: z.string().min(1, 'Institution is required'),
    degree: z.string().min(1, 'Degree is required'),
    field: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })),

  projects: z.array(z.object({
    title: z.string().min(1, 'Project title is required'),
    description: z.string().optional(),
    githubUrl: z.string().url('Must be a valid URL').or(z.literal('')),
    projectUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  })),

  certifications: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    certificateUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  })),

  skills: z.array(z.object({
    name: z.string().min(1, 'Skill name is required'),
    category: z.string().optional(),
  }))
});

export type ResumeProfile = z.infer<typeof resumeProfileSchema>;