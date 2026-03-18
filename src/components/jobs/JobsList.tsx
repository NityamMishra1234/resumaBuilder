// components/jobs/JobsList.tsx
'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Job = {
  id: string
  title: string
  company: string
  location: string
  postedAt: string // ISO
  summary?: string
}

const demoJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Engineer (React/Next.js)',
    company: 'Acme Inc.',
    location: 'Remote',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    summary: 'Build UI components for our web platform.'
  },
  {
    id: '2',
    title: 'Machine Learning Engineer',
    company: 'Nova Labs',
    location: 'San Francisco, CA',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    summary: 'Work on recommendation and ranking models.'
  },
  {
    id: '3',
    title: 'Product Designer',
    company: 'Studio Co.',
    location: 'London, UK (Hybrid)',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    summary: 'Design delightful product experiences.'
  }
]

export function JobsList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {demoJobs.map((job) => (
        <Card key={job.id}>
          <CardHeader>
            <CardTitle className="text-base">{job.title}</CardTitle>
            <div className="text-sm text-muted-foreground">{job.company} • {job.location}</div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{job.summary}</p>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
              </div>
              <Link href={`/dashboard/jobs/${job.id}`}>
                <Button size="sm">View</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}