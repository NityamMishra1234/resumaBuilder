'use client';

import Link from 'next/link';
import { PlusCircle, FileText, Trash2, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useApp } from '@/contexts/app-provider';
import { GenerateResumeDialog } from '@/components/dashboard/generate-resume-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DashboardPage() {
  const { generatedResumes, profile, deleteGeneratedResume } = useApp();

  const handleDownload = (content: string, title: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const EmptyState = () => (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-2 text-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">
          No Resumes Generated
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {profile
            ? 'You have not generated any resumes yet. Paste a job description to start.'
            : 'You need to create your master profile before you can generate a resume.'}
        </p>
        {profile ? (
          <GenerateResumeDialog />
        ) : (
          <Button className="mt-4" asChild>
            <Link href="/dashboard/profile">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Profile
            </Link>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Generated Resumes</h1>
        {generatedResumes.length > 0 && <GenerateResumeDialog />}
      </div>
      {generatedResumes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generatedResumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader>
                <CardTitle>{resume.jobTitle}</CardTitle>
                <CardDescription>{resume.companyName}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generated{' '}
                  {formatDistanceToNow(resume.createdAt, { addSuffix: true })}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/resumes/${resume.id}`}>View</Link>
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDownload(
                        resume.content,
                        `${resume.jobTitle}_${resume.companyName}`
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this generated resume.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteGeneratedResume(resume.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
