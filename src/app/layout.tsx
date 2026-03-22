import { AppProviders } from '@/providers/app-providers';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';


export const metadata = {
  title: "HIREWISE",
  description: "AI POWERED CAREER AND HIRING PLATFORM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <AuthProvider>
          <AppProviders>
            {children}
          </AppProviders>
        </AuthProvider>

        <Toaster />
      </body>
    </html>
  );
}