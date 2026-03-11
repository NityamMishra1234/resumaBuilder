import { Logo } from '@/components/logo';

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <Logo />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} JobPilot AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
