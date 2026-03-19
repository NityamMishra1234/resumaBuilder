import { z } from 'zod';


const optionalString = z
  .string()
  .nullable()
  .optional()
  .transform((val) => val ?? '');


const optionalUrl = z
  .string()
  .nullable()
  .optional()
  .transform((val) => val ?? '')
  .refine(
    (val) => val === '' || /^https?:\/\/.+/.test(val),
    'Must be a valid URL'
  );

export const resumeProfileSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),

  phone: optionalString,
  location: optionalString,

 
  linkedin: optionalUrl,
  github: optionalUrl,
  portfolio: optionalUrl,
  twitter: optionalUrl,

  summary: optionalString,

  experiences: z.array(
    z.object({
      id: z.string().optional(), 
      company: optionalString, 
      role: optionalString,
      description: optionalString,
      startDate: optionalString,
      endDate: optionalString,
    })
  ),

  education: z.array(
    z.object({
      id: z.string().optional(),
      institution: optionalString,
      degree: optionalString,
      field: optionalString,
      startDate: optionalString,
      endDate: optionalString,
    })
  ),

  projects: z.array(
    z.object({
      id: z.string().optional(),
      title: optionalString,
      description: optionalString,
      githubUrl: optionalUrl,
      projectUrl: optionalUrl,
    })
  ),

  certifications: z.array(
    z.object({
      id: z.string().optional(), 
      title: optionalString,
      description: optionalString,
      certificateUrl: optionalUrl,
    })
  ),

  skills: z.array(
    z.object({
      id: z.string().optional(), 
      name: optionalString,
      category: optionalString,
    })
  ),
});

export type ResumeProfile = z.infer<typeof resumeProfileSchema>;