'use client';

import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateCustomizedResumeAction } from '@/app/actions';
import { mapToAiSchema } from '@/lib/schema';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function GenerateResumeDialog() {
  const { profile, addGeneratedResume } = useApp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleGenerate = async () => {
    if (!profile) {
      toast({
        variant: 'destructive',
        title: 'Profile Not Found',
        description: 'Please create your master profile first.',
      });
      return;
    }
    if (!jobDescription.trim() || !jobTitle.trim() || !companyName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all fields.',
      });
      return;
    }
    setIsLoading(true);

    try {
      const aiInput = {
        ...mapToAiSchema(profile),
        jobDescription,
      };
      // @ts-ignore
      const result = await generateCustomizedResumeAction(aiInput);

      if (result.success) {
        addGeneratedResume({
          id: new Date().toISOString(),
          jobTitle,
          companyName,
          createdAt: new Date(),
          content: result.data,
          jobDescription,
        });
        toast({
          title: 'Resume Generated!',
          description: 'Your new tailored resume is ready.',
        });
        setIsOpen(false);
        setJobDescription('');
        setJobTitle('');
        setCompanyName('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          'There was an error generating your resume. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={!profile}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Generate New Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate a New Resume</DialogTitle>
          <DialogDescription>
            Provide the job details and paste the full job description below to
            get an AI-tailored resume.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Inc."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="min-h-[250px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !jobDescription.trim() || !jobTitle.trim() || !companyName.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Resume'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
