import { z } from 'zod';
import { resumeProfileSchema } from './schema';

export type ResumeProfile = z.infer<typeof resumeProfileSchema>;

export type GeneratedResume = {
  id: string;
  jobTitle: string;
  companyName: string;
  createdAt: Date;
  content: string;
  jobDescription: string;
};
