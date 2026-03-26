// app/login/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import api from '@/api/api'
import { useAuth } from '@/providers/AuthProvider'
import { useApp } from '@/contexts/app-provider'

export default function LoginPage() {
  const { login, user, isLoading } = useAuth()
  const { showFlag } = useApp()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard/job-list')
    }
  }, [isLoading, router, user])

  const redirectAfterAuth = async () => {
    try {
      await api.get("/profile/master");
      router.replace('/dashboard/jobs');
    } catch {
      router.replace('/dashboard/profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic client-side validation
    if (!email.trim() || !password) {
      setError('Please enter email and password.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/login", {
        email: email,
        password: password,
      })
        .then(async (res) => {
          const { token, user } = res.data
          await login(
            user,
            token.accessToken,
            token.refreshToken
          )
          await redirectAfterAuth()
          showFlag("Login sucess", "success")
        })
        .catch((err) => showFlag(err.response?.data?.message || "Something went wrong", "error")
        )

    } catch (err) {
      console.error(err)
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-6xl rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT: FORM */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-background/80 p-8 md:p-12 flex flex-col justify-center"
        >
          <div className="mb-6 flex items-center gap-4">
            <Logo className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-semibold">JobPilot AI</h2>
              <p className="text-sm text-muted-foreground">Find your next role — faster.</p>
            </div>
          </div>

          <Card className="shadow-none ring-0">
            <CardHeader className="pb-1">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to continue to JobPilot</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="mt-1"
                    aria-label="Email"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="mt-1"
                    aria-label="Password"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className={cn('w-full', loading && 'opacity-80')} disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <Link href="/forgot" className="underline">Forgot password?</Link>
                  <Link href="/signup" className="underline">Create account</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* RIGHT: ANIMATION / HERO */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-primary/90 to-secondary/80 p-8 md:p-12 flex flex-col justify-center text-white"
        >
          {/* Top-right decorative blob */}
          <motion.div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-40 filter blur-3xl"
            animate={{ rotate: [0, 45, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0.06))' }}
          />

          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-2">Find jobs you'll love</h3>
            <p className="mb-6 text-sm text-white/90">
              Get matched with roles that fit your skills. Practice AI-powered interviews and keep track of your applications.
            </p>

            {/* Small animated cards carousel */}
            <div className="flex gap-4">
              <motion.div
                className="bg-white/10 rounded-xl p-4 w-40"
                whileHover={{ scale: 1.02 }}
                initial={{ y: 10, opacity: 0.9 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="font-semibold">Frontend Engineer</div>
                <div className="text-xs text-white/80">Acme • Remote</div>
              </motion.div>

              <motion.div
                className="bg-white/10 rounded-xl p-4 w-40"
                whileHover={{ scale: 1.02 }}
                initial={{ y: 10, opacity: 0.9 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.4, repeat: Infinity }}
              >
                <div className="font-semibold">AI Researcher</div>
                <div className="text-xs text-white/80">Nova Labs • SF</div>
              </motion.div>

              <motion.div
                className="bg-white/10 rounded-xl p-4 w-40 hidden md:block"
                whileHover={{ scale: 1.02 }}
                initial={{ y: 10, opacity: 0.9 }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity }}
              >
                <div className="font-semibold">Product Designer</div>
                <div className="text-xs text-white/80">Studio • London</div>
              </motion.div>
            </div>

            <div className="mt-6 text-sm text-white/90">
              <strong>Pro tip:</strong> Use a modern resume and practice interviews to increase your chances.
            </div>
          </div>

          {/* small footer note */}
          <div className="absolute bottom-4 right-6 text-xs text-white/70">Secure · Fast · AI-driven</div>
        </motion.div>
      </div>
    </div>
  )
}
