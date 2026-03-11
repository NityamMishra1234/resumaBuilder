'use server';
/**
 * @fileOverview An AI agent that customizes a user's master resume based on a given job description.
 *
 * - customizeResumeForJob - A function that handles the resume customization process.
 * - CustomizeResumeForJobInput - The input type for the customizeResumeForJob function.
 * - CustomizeResumeForJobOutput - The return type for the customizeResumeForJob function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Zod schema for personal information section of the resume profile.
 */
const ResumeProfilePersonalInfoSchema = z.object({
  fullName: z.string().describe("The user's full name."),
  email: z.string().email().describe("The user's email address."),
  phone: z.string().optional().describe("The user's phone number."),
  location: z.string().optional().describe("The user's current city and state/country."),
});

/**
 * Zod schema for links section of the resume profile.
 */
const ResumeProfileLinksSchema = z.object({
  linkedIn: z.string().url().optional().describe("URL to the user's LinkedIn profile."),
  github: z.string().url().optional().describe("URL to the user's GitHub profile."),
  portfolio: z.string().url().optional().describe("URL to the user's online portfolio."),
  website: z.string().url().optional().describe("URL to the user's personal website."),
  other: z.array(z.string().url()).optional().describe("Other relevant links."),
});

/**
 * Zod schema for a single experience entry in the resume profile.
 */
const ResumeProfileExperienceEntrySchema = z.object({
  companyName: z.string().describe("The name of the company."),
  role: z.string().describe("The user's role at the company."),
  duration: z.string().describe("The duration of employment (e.g., 'Jan 2020 - Dec 2022' or 'Jan 2020 - Present')."),
  keyAchievements: z.array(z.string()).describe("A list of key achievements in this role, using action verbs."),
  responsibilities: z.array(z.string()).describe("A list of daily responsibilities in this role."),
});

/**
 * Zod schema for a single education entry in the resume profile.
 */
const ResumeProfileEducationEntrySchema = z.object({
  university: z.string().describe("The name of the university or institution."),
  degree: z.string().describe("The degree obtained (e.g., 'Bachelor of Science', 'Master of Arts')."),
  field: z.string().describe("The field of study (e.g., 'Computer Science', 'Business Administration')."),
  graduationYear: z.string().describe("The year of graduation."),
});

/**
 * Zod schema for skills section of the resume profile.
 */
const ResumeProfileSkillsSchema = z.object({
  technicalSkills: z.array(z.string()).describe("A list of technical skills (e.g., 'JavaScript', 'Python', 'React')."),
  tools: z.array(z.string()).describe("A list of tools used (e.g., 'Docker', 'Figma', 'Jira')."),
  frameworks: z.array(z.string()).describe("A list of frameworks used (e.g., 'Next.js', 'Spring Boot', 'TensorFlow')."),
  softSkills: z.array(z.string()).describe("A list of soft skills (e.g., 'Communication', 'Teamwork', 'Problem-solving')."),
});

/**
 * Zod schema for a single project entry in the resume profile.
 */
const ResumeProfileProjectEntrySchema = z.object({
  projectName: z.string().describe("The name of the project."),
  description: z.string().describe("A brief description of the project."),
  technologies: z.array(z.string()).describe("A list of technologies used in the project."),
  links: z.array(z.string().url()).optional().describe("Links related to the project (e.g., GitHub repo, live demo)."),
});

/**
 * Zod schema for a single certification entry in the resume profile.
 */
const ResumeProfileCertificationsEntrySchema = z.string().describe("Name of a certification (e.g., 'AWS Certified Solutions Architect').");

/**
 * Zod schema representing the complete master resume profile data.
 */
const ResumeProfileSchema = z.object({
  personalInformation: ResumeProfilePersonalInfoSchema.describe("Personal contact and location information."),
  links: ResumeProfileLinksSchema.describe("Professional and personal links."),
  professionalSummary: z.string().describe("A concise professional summary or objective statement."),
  experience: z.array(ResumeProfileExperienceEntrySchema).describe("A list of professional work experiences."),
  education: z.array(ResumeProfileEducationEntrySchema).describe("A list of educational background entries."),
  skills: ResumeProfileSkillsSchema.describe("A categorized list of user skills."),
  projects: z.array(ResumeProfileProjectEntrySchema).optional().describe("A list of personal or professional projects."),
  certifications: z.array(ResumeProfileCertificationsEntrySchema).optional().describe("A list of professional certifications."),
}).describe("The user's complete master resume profile data.");

/**
 * Input schema for the customizeResumeForJob flow.
 */
export const CustomizeResumeForJobInputSchema = z.object({
  masterResume: ResumeProfileSchema.describe("The user's master resume profile data."),
  jobDescription: z.string().describe("The full text of the job description to tailor the resume for."),
});

/**
 * Type definition for the input of the customizeResumeForJob function.
 */
export type CustomizeResumeForJobInput = z.infer<typeof CustomizeResumeForJobInputSchema>;

/**
 * Output schema for the customizeResumeForJob flow.
 */
export const CustomizeResumeForJobOutputSchema = z.object({
  customizedResume: z.string().describe("The ATS-optimized, professional, and human-sounding resume tailored to the job description."),
});

/**
 * Type definition for the output of the customizeResumeForJob function.
 */
export type CustomizeResumeForJobOutput = z.infer<typeof CustomizeResumeForJobOutputSchema>;

/**
 * Defines the prompt for customizing a resume based on a job description.
 */
const customizeResumePrompt = ai.definePrompt({
  name: 'customizeResumePrompt',
  input: {schema: CustomizeResumeForJobInputSchema},
  output: {schema: CustomizeResumeForJobOutputSchema},
  prompt: `You are an expert AI resume optimization assistant. Your task is to customize the provided master resume to best match the given job description.

**Crucial Rules:**
1.  **DO NOT fabricate ANY information.** Only reframe, reorder, or highlight existing information from the master resume.
2.  Maintain a natural, human-written tone. Avoid common AI-detection patterns.
3.  Ensure the output is highly optimized for Applicant Tracking Systems (ATS).
4.  The output must be a clean, professional, and structured text-based resume. Use markdown for clear section separation and bullet points.

**Job Description:**
{{{jobDescription}}}

---

**Master Resume Data:**

**Personal Information:**
*   Full Name: {{{masterResume.personalInformation.fullName}}}
*   Email: {{{masterResume.personalInformation.email}}}
{{#if masterResume.personalInformation.phone}}*   Phone: {{{masterResume.personalInformation.phone}}}{{/if}}
{{#if masterResume.personalInformation.location}}*   Location: {{{masterResume.personalInformation.location}}}{{/if}}

**Links:**
{{#if masterResume.links.linkedIn}}*   LinkedIn: {{{masterResume.links.linkedIn}}}{{/if}}
{{#if masterResume.links.github}}*   GitHub: {{{masterResume.links.github}}}{{/if}}
{{#if masterResume.links.portfolio}}*   Portfolio: {{{masterResume.links.portfolio}}}{{/if}}
{{#if masterResume.links.website}}*   Website: {{{masterResume.links.website}}}{{/if}}
{{#if masterResume.links.other.length}}*   Other: {{#each masterResume.links.other}}- {{{this}}} {{/each}}{{/if}}

**Professional Summary:**
{{{masterResume.professionalSummary}}}

**Experience:**
{{#each masterResume.experience}}
*   **Company:** {{{this.companyName}}}
*   **Role:** {{{this.role}}}
*   **Duration:** {{{this.duration}}}
    *   **Achievements:**
    {{#each this.keyAchievements}}
        *   {{{this}}}
    {{/each}}
    *   **Responsibilities:**
    {{#each this.responsibilities}}
        *   {{{this}}}
    {{/each}}
{{/each}}

**Education:**
{{#each masterResume.education}}
*   **University:** {{{this.university}}}
*   **Degree:** {{{this.degree}}}
*   **Field:** {{{this.field}}}
*   **Graduation Year:** {{{this.graduationYear}}}
{{/each}}

**Skills:**
*   **Technical Skills:** {{#each masterResume.skills.technicalSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
*   **Tools:** {{#each masterResume.skills.tools}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
*   **Frameworks:** {{#each masterResume.skills.frameworks}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
*   **Soft Skills:** {{#each masterResume.skills.softSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

{{#if masterResume.projects.length}}
**Projects:**
{{#each masterResume.projects}}
*   **Project Name:** {{{this.projectName}}}
*   **Description:** {{{this.description}}}
*   **Technologies:** {{#each this.technologies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if this.links.length}}
*   **Links:** {{#each this.links}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{/each}}
{{/if}}

{{#if masterResume.certifications.length}}
**Certifications:**
{{#each masterResume.certifications}}
*   {{{this}}}
{{/each}}
{{/if}}

---

Now, based on the job description and the master resume provided above, create a highly optimized resume.

**Instructions for AI Resume Customization:**
1.  **Analyze Job Description:** Identify key responsibilities, required skills, keywords, and experience levels mentioned in the job description.
2.  **Reorder Sections:** Prioritize and reorder sections (e.g., Experience, Projects, Skills) to highlight the most relevant information for this specific job, placing the most impactful sections higher up.
3.  **Optimize Bullet Points:** Rewrite, condense, or expand existing bullet points in the "Experience" and "Projects" sections to directly align with the keywords and requirements extracted from the job description. Use strong action verbs and quantify achievements where possible.
4.  **Align Skills:** Emphasize and re-present skills from the "Skills" section that are directly relevant to the job description. Consider including a "Key Skills" or "Technical Skills" section prominently.
5.  **Integrate Keywords:** Naturally weave relevant keywords from the job description into the professional summary, experience descriptions, and project details without keyword stuffing.
6.  **Improve Readability:** Ensure clear headings, consistent formatting, and appropriate use of white space.
7.  **Maintain Professional Tone:** Keep the language professional, concise, and impactful.
8.  **ATS Compatibility:** Output in a simple, parseable text format (markdown is good) to ensure maximum compatibility with Applicant Tracking Systems. Avoid complex formatting like multiple columns or intricate layouts.

Produce the final, customized resume below.
`,
});

/**
 * Defines a Genkit flow to customize a resume for a specific job description.
 */
const customizeResumeForJobFlow = ai.defineFlow(
  {
    name: 'customizeResumeForJobFlow',
    inputSchema: CustomizeResumeForJobInputSchema,
    outputSchema: CustomizeResumeForJobOutputSchema,
  },
  async (input) => {
    const {output} = await customizeResumePrompt(input);
    return output!;
  }
);

/**
 * Wrapper function to execute the customizeResumeForJob Genkit flow.
 * @param input The master resume profile and job description.
 * @returns The ATS-optimized, customized resume.
 */
export async function customizeResumeForJob(input: CustomizeResumeForJobInput): Promise<CustomizeResumeForJobOutput> {
  return customizeResumeForJobFlow(input);
}
