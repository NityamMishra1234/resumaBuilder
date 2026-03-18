'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, FileText, Trash2, Download, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import api from '@/api/api';
import { GenerateResumeDialog } from '@/components/dashboard/generate-resume-dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DashboardPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // ✅ FETCH
  const fetchResumes = async () => {
    try {
      const res = await api.get('/resume/all');
      setResumes(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // ✅ GENERATE (simple, from page)
  const handleGenerate = async (data: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
  }) => {
    try {
      setGenerating(true);

      await api.post('/resume/generate', data);

      // simulate long AI feel (2 sec instead of 2 min)
      setTimeout(() => {
        fetchResumes();
      }, 2000);

    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  // ✅ DELETE
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/resume/${id}`);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DOWNLOAD (REAL S3)
  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const EmptyState = () => (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-2xl font-bold">No Resumes Yet</h3>
        <p className="text-sm text-muted-foreground">
          Start by generating your first resume
        </p>
        <div className="mt-4">
          <GenerateResumeDialog onGenerate={handleGenerate} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">

      {/* 🔥 TOP LOADER */}
      {generating && (
        <div className="fixed top-0 left-0 w-full bg-black text-white text-center py-2 z-50 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin h-4 w-4" />
          Generating your resume... (AI working 🚀)
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">
          Generated Resumes
        </h1>

        {resumes.length > 0 && (
          <GenerateResumeDialog onGenerate={handleGenerate} />
        )}
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader>
                <CardTitle>{resume.jobTitle}</CardTitle>
                <CardDescription>{resume.companyName}</CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generated{' '}
                  {formatDistanceToNow(new Date(resume.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/resumes/${resume.id}`}>
                    View
                  </Link>
                </Button>

                <div className="flex gap-2">
                  {/* ✅ DOWNLOAD */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(resume.resumeUrl)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  {/* ✅ DELETE WITH PREVIEW */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Resume?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                          This will permanently delete this resume.
                        </AlertDialogDescription>

                        {/* 🔥 PREVIEW */}
                        <iframe
                          src={resume.resumeUrl}
                          className="w-full h-64 mt-4 border rounded"
                        />
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(resume.id)}
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