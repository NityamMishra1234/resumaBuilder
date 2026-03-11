'use client';

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/app-provider';
import { GeneratedResume } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ResumePreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const { getResumeById } = useApp();
  const [resume, setResume] = useState<GeneratedResume | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const foundResume = getResumeById(params.id);
    if (foundResume) {
      setResume(foundResume);
    }
  }, [getResumeById, params.id]);

  useEffect(() => {
    // This is a workaround for when the page is loaded directly
    // and the context might not be populated yet. A real app would fetch this data.
    if (!resume && getResumeById(params.id)) {
      setResume(getResumeById(params.id));
    }
  }, [getResumeById, params.id, resume]);

  if (!resume) {
    // In a real app, you'd show a loading spinner and fetch the data.
    // For this context-based approach, if it's not found, it's a "404".
    // A brief delay before showing not found to allow context to populate.
    const [isChecking, setIsChecking] = useState(true);
    useEffect(() => {
      const timer = setTimeout(() => setIsChecking(false), 500);
      return () => clearTimeout(timer);
    }, []);

    if (isChecking) return <div>Loading...</div>;
    return notFound();
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{resume.jobTitle}</h1>
          <p className="text-muted-foreground">{resume.companyName}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-8 print:p-0">
          <div
            className="prose prose-sm sm:prose-base max-w-none print:prose-sm"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {resume.content}
          </div>
        </CardContent>
      </Card>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <div className="printable-area" style={{ display: 'none' }}>
        <div style={{ whiteSpace: 'pre-wrap' }}>{resume.content}</div>
      </div>
    </div>
  );
}
