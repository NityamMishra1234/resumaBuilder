'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Settings,
  Briefcase,
  Bot,
  ClipboardList,
  DockIcon,
  User2,
} from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

import { Logo } from '../logo'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/dashboard/resuma', icon: DockIcon, label: "resuma" },
  { href: '/dashboard/applications', icon: ClipboardList, label: 'Applications' },
  { href: '/dashboard/practice', icon: Bot, label: 'AI Interviews' },
  { href: '/dashboard/profile', icon: User2, label: 'Profile' },
]

export function DashboardSidebarNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href)

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-4 px-2 py-5">

            {/* Logo */}
            <Link
              href="/dashboard/jobs"
              className="mb-6 flex items-center justify-center"
            >
              <Logo className="h-8 w-8 transition-transform hover:scale-110" />
              <span className="sr-only">JobPilot AI</span>
            </Link>

            {/* Main Navigation */}
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:text-foreground",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>

                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>

          {/* Settings bottom */}
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>

              <TooltipContent side="right">
                Settings
              </TooltipContent>
            </Tooltip>
          </nav>
        </TooltipProvider>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background py-2 sm:hidden">

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center text-xs text-muted-foreground transition-colors",
              isActive(item.href) && "text-primary"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            {item.label}
          </Link>
        ))}

      </nav>
    </>
  )
}