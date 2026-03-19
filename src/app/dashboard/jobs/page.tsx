// app/dashboard/jobs/page.tsx
import React from 'react'
import { JobsList } from '@/components/jobs/JobsList'

export default function DashboardJobsPage() {
  return (
    <div className="p-4 sm:p-6">
      

      <JobsList />
    </div>
  )
}