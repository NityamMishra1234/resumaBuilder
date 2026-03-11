import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  location: z.string().optional(),
});

export const linksSchema = z.object({
  linkedIn: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

export const experienceEntrySchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  role: z.string().min(1, 'Role is required.'),
  duration: z.string().min(1, 'Duration is required.'),
  keyAchievements: z.array(z.object({ value: z.string() })),
  responsibilities: z.array(z.object({ value: z.string() })),
});

export const educationEntrySchema = z.object({
  university: z.string().min(1, 'University is required.'),
  degree: z.string().min(1, 'Degree is required.'),
  field: z.string().min(1, 'Field of study is required.'),
  graduationYear: z.string().min(4, 'Invalid year.').max(4, 'Invalid year.'),
});

export const skillsSchema = z.object({
  technicalSkills: z.string().min(1, 'Please list at least one skill.'),
  tools: z.string(),
  frameworks: z.string(),
  softSkills: z.string().min(1, 'Please list at least one skill.'),
});

export const projectEntrySchema = z.object({
  projectName: z.string().min(1, 'Project name is required.'),
  description: z.string().min(1, 'Description is required.'),
  technologies: z.string().min(1, 'Technologies are required.'),
  links: z
    .string()
    .url('Please enter a valid URL.')
    .optional()
    .or(z.literal('')),
});

export const resumeProfileSchema = z.object({
  personalInformation: personalInfoSchema,
  links: linksSchema,
  professionalSummary: z
    .string()
    .min(10, 'Summary should be at least 10 characters.'),
  experience: z.array(experienceEntrySchema),
  education: z.array(educationEntrySchema),
  skills: skillsSchema,
  projects: z.array(projectEntrySchema),
  certifications: z.string().optional(),
});

// For mapping form values to AI flow input
export const mapToAiSchema = (data: z.infer<typeof resumeProfileSchema>) => {
  return {
    masterResume: {
      personalInformation: data.personalInformation,
      links: {
        ...data.links,
        other: [],
      },
      professionalSummary: data.professionalSummary,
      experience: data.experience.map((exp) => ({
        ...exp,
        keyAchievements: exp.keyAchievements.map((a) => a.value).filter(Boolean),
        responsibilities: exp.responsibilities.map((r) => r.value).filter(Boolean),
      })),
      education: data.education,
      skills: {
        technicalSkills: data.skills.technicalSkills.split(',').map((s) => s.trim()).filter(Boolean),
        tools: data.skills.tools.split(',').map((s) => s.trim()).filter(Boolean),
        frameworks: data.skills.frameworks.split(',').map((s) => s.trim()).filter(Boolean),
        softSkills: data.skills.softSkills.split(',').map((s) => s.trim()).filter(Boolean),
      },
      projects: data.projects.map((proj) => ({
        ...proj,
        technologies: proj.technologies.split(',').map((s) => s.trim()).filter(Boolean),
        links: proj.links ? [proj.links] : [],
      })),
      certifications: data.certifications?.split(',').map((s) => s.trim()).filter(Boolean) || [],
    },
  };
};
