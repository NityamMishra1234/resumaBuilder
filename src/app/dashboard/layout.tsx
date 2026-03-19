'use client'

import { Loader2 } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebarNav } from '@/components/dashboard/sidebar-nav';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation'
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const {user , isLoading} = useAuth();
  const router = useRouter();

  useEffect(()=>{
    if (!isLoading && !user) {
      router.replace('/login')
    }
  } , [isLoading, router, user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardSidebarNav />

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <DashboardHeader />

        <main className="flex-1 p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </div>
    </div>
  );
}
