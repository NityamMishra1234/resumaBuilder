// app/dashboard/jobs/page.tsx
import React from 'react'
import { JobsList } from '@/components/jobs/JobsList'

export default function DashboardJobsPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Job Board</h1>
        <p className="text-sm text-muted-foreground">Explore curated opportunities</p>
      </div>

      <JobsList />
    </div>
  )
}