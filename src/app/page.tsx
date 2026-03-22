import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Cpu,
  FileText,
  ScanSearch,
} from 'lucide-react';

import { PlaceHolderImages } from '@/lib/placeholder-images';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LandingHeader } from '@/components/landing/header';
import { LandingFooter } from '@/components/landing/footer';

const features = [
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: 'Master Resume Profile',
    description:
      'Create a single, comprehensive profile with all your details. Your one source of truth for all applications.',
  },
  {
    icon: <ScanSearch className="h-8 w-8 text-primary" />,
    title: 'AI Job Description Analyzer',
    description:
      'Our AI extracts key skills and requirements from any job description to identify what recruiters are looking for.',
  },
  {
    icon: <Cpu className="h-8 w-8 text-primary" />,
    title: 'AI Resume Customization',
    description:
      'Leverage AI to tailor your resume for each specific job, optimizing keywords and highlighting relevant experience.',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Instant Professional Resumes',
    description:
      'Generate and download professional, ATS-friendly resumes in web and PDF formats in just a few clicks.',
  },
];

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <section className="bg-background py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Land Your Dream Job with an{' '}
              <span className="text-primary">AI-Powered</span> Resume
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
              JobPilot AI helps you create tailored, professional resumes that
              get past automated screeners and impress hiring managers.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="link" size="lg">
                <Link href="#features">
                  Learn More <span aria-hidden="true">→</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={1200}
                height={600}
                className="rounded-xl shadow-2xl"
                data-ai-hint={heroImage.imageHint}
              />
            )}
          </div>
        </section>

        <section id="features" className="bg-background py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How JobPilot AI Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A simple, powerful process to optimize your job applications.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <Card className="bg-primary text-primary-foreground">
              <div className="flex flex-col items-center justify-between gap-8 p-10 md:flex-row md:p-16">
                <div className="max-w-xl text-center md:text-left">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Ready to Get Started?
                  </h2>
                  <p className="mt-4 text-lg opacity-80">
                    Stop manually editing your resume for every application.
                    Let JobPilot AI do the heavy lifting and start getting more
                    interviews.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  >
                    <Link href="/signup">
                      Create Your AI Resume Now{' '}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
