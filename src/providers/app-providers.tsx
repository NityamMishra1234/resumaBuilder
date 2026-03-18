'use client';

import { AppProvider } from '@/contexts/app-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
           
                {children}
           
        </AppProvider>
    )
}