'use server';
/**
 * @fileOverview A Genkit flow for analyzing job descriptions to extract key requirements, skills, and keywords.
 *
 * - analyzeJobDescription - A function that handles the job description analysis process.
 * - AnalyzeJobDescriptionInput - The input type for the analyzeJobDescription function.
 * - AnalyzeJobDescriptionOutput - The return type for the analyzeJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeJobDescriptionInputSchema = z.object({
  jobDescription: z
    .string()
    .describe(
      'The full text of the job description to be analyzed. This should be a comprehensive text containing all details about the role.'
    ),
});
export type AnalyzeJobDescriptionInput = z.infer<
  typeof AnalyzeJobDescriptionInputSchema
>;

const AnalyzeJobDescriptionOutputSchema = z.object({
  keyRequirements: z
    .array(z.string())
    .describe(
      'A list of the most important responsibilities and qualifications required for the job, directly extracted from the job description.'
    ),
  requiredSkills: z
    .array(z.string())
    .describe(
      'A list of technical and soft skills explicitly mentioned as necessary or highly desirable in the job description.'
    ),
  keywords: z
    .array(z.string())
    .describe(
      'A list of important keywords and phrases from the job description that are relevant for ATS optimization and resume tailoring.'
    ),
});
export type AnalyzeJobDescriptionOutput = z.infer<
  typeof AnalyzeJobDescriptionOutputSchema
>;

export async function analyzeJobDescription(
  input: AnalyzeJobDescriptionInput
): Promise<AnalyzeJobDescriptionOutput> {
  return analyzeJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJobDescriptionPrompt',
  input: {schema: AnalyzeJobDescriptionInputSchema},
  output: {schema: AnalyzeJobDescriptionOutputSchema},
  prompt: `You are an expert job description analyzer. Your task is to carefully read the provided job description and extract specific information.

Only extract information that is explicitly stated in the job description. Do not infer, invent, or add any information that is not present in the text.

Job Description:
{{{jobDescription}}}

Based on the job description, extract the following:
1. Key Requirements: What are the primary responsibilities and essential qualifications?
2. Required Skills: What specific technical, professional, or soft skills are explicitly mentioned as needed?
3. Keywords: What are the most important terms and phrases that an Applicant Tracking System (ATS) might look for, or that are crucial for understanding the role's context?

Provide the output in a structured JSON format as described by the output schema.`,
});

const analyzeJobDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeJobDescriptionFlow',
    inputSchema: AnalyzeJobDescriptionInputSchema,
    outputSchema: AnalyzeJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
