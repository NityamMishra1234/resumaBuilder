'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import api from '@/api/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';

export default function ResumePreviewPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id as string;

  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH FROM API
  useEffect(() => {
    if (!id) return;

    const fetchResume = async () => {
      try {
        const res = await api.get(`/resume/${id}`);
        setResume(res.data);
      } catch (err) {
        console.error(err);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  // ✅ LOADING
  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!resume) return notFound();

  // ✅ DOWNLOAD (REAL PDF)
  const handleDownload = () => {
    window.open(resume.resumeUrl, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold">{resume.jobTitle}</h1>
          <p className="text-muted-foreground">{resume.companyName}</p>
        </div>

        <div className="ml-auto flex gap-2">
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* 🔥 PDF PREVIEW (REAL) */}
      <Card>
        <CardContent className="p-0">
          <iframe
            src={resume.resumeUrl}
            className="w-full h-[800px] rounded"
          />
        </CardContent>
      </Card>
    </div>
  );
}