import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Send className="h-6 w-6 text-primary" />
      <span className="text-xl font-semibold text-foreground">JobPilot AI</span>
    </div>
  );
}
