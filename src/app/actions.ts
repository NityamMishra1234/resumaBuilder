'use server';

import {
  customizeResumeForJob,
  CustomizeResumeForJobInput,
} from '@/ai/flows/customize-resume-for-job';

export async function generateCustomizedResumeAction(
  input: CustomizeResumeForJobInput
) {
  try {
    const result = await customizeResumeForJob(input);
    return { success: true, data: result.customizedResume };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Error in generateCustomizedResumeAction:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
