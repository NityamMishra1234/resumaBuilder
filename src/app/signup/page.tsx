"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { OtpInput } from "@/components/ui/otp-input";

import { useApp } from "@/contexts/app-provider";
import api from "@/api/api";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const { showFlag } = useApp();

  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { login } = useAuth();
  const router = useRouter()

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const redirectAfterAuth = async () => {
    try {
      await api.get("/profile/master");
      router.replace('/dashboard/jobs');
    } catch {
      router.replace('/dashboard/profile');
    }
  };

  const sendOtp = async () => {
    setOtpLoading(true);

    await api
      .post("/auth/send-otp", { email: formData.email.trim() })
      .then(() => {
        setOtpSent(true);
        showFlag(`Verification code sent to ${formData.email}`, "success");
      })
      .catch((err) => { 
        showFlag(err.response?.data?.message || "Something went wrong", "error");
      })
      .finally(() => setOtpLoading(false));
  };

  const verifyOtp = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      showFlag("Enter complete 6 digit code", "error");
      return;
    }

    setVerifyLoading(true);

    await api
      .post("/auth/veriy-email", { email: formData.email, otp: code })
      .then(() => {
        setVerified(true);
        showFlag("Email verified successfully", "success");
      })
      .catch((err) => {
        showFlag(err.response?.data?.message || "Something went wrong", "error");
      })
      .finally(() => setVerifyLoading(false));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verified) {
      showFlag("Please verify your email first", "error");
      return;
    }

    await api
      .post("/auth/register", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      })
      .then(async (res) => {
        showFlag("Account created successfully!", "success");
        const { user, token } = res.data
        await login(
          user,
          token.accessToken,
          token.refreshToken
        )
        await redirectAfterAuth()
      })

      .catch((err) => {
        showFlag(err.response?.data?.message || "Something went wrong", "error");
      })
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 md:grid-cols-2 overflow-hidden rounded-xl shadow-xl">

        {/* LEFT SIDE — ANIMATION */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative hidden md:flex flex-col justify-center bg-gradient-to-br from-primary to-indigo-600 p-12 text-white"
        >
          <Logo className="mb-8 h-10 w-10" />

          <h2 className="text-3xl font-bold mb-4">
            Build your AI Resume in minutes
          </h2>

          <p className="text-sm opacity-90 mb-8">
            Create powerful resumes, track job applications and practice AI
            interviews — all in one platform.
          </p>

          {/* Floating cards */}
          <div className="flex gap-4">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-white/10 p-4 rounded-xl w-40"
            >
              <p className="font-semibold">AI Resume</p>
              <p className="text-xs opacity-80">Auto optimized</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.2, repeat: Infinity }}
              className="bg-white/10 p-4 rounded-xl w-40"
            >
              <p className="font-semibold">Job Tracker</p>
              <p className="text-xs opacity-80">Track applications</p>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT SIDE — FORM */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center bg-background p-6 md:p-10"
        >
          <Card className="w-full max-w-md border shadow-none">
            <CardHeader className="text-center">
              <Logo className="mb-3 justify-center" />

              <CardTitle className="text-2xl font-bold">
                Create your account
              </CardTitle>

              <CardDescription>
                Start building resumes with AI today.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSignup} className="space-y-5">

                {/* Name */}
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input name="name" required onChange={handleChange} />
                </div>

                {/* Email + OTP */}
                <div className="space-y-2">
                  <Label>Email</Label>

                  <div className="flex gap-2">
                    <Input
                      name="email"
                      type="email"
                      disabled={otpSent}
                      required
                      onChange={handleChange}
                    />

                    <Button type="button" onClick={sendOtp} disabled={otpSent}>
                      {otpLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </div>
                </div>

                {/* OTP */}
                {otpSent && (
                  <div className="space-y-4">
                    <Label>Verification Code</Label>

                    <OtpInput value={otp} onChange={setOtp} />

                    <Button
                      type="button"
                      className="w-full"
                      onClick={verifyOtp}
                    >
                      {verifyLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying
                        </>
                      ) : (
                        "Verify Email"
                      )}
                    </Button>

                    {verified && (
                      <p className="text-sm text-green-600 text-center">
                        Email verified ✓
                      </p>
                    )}
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    name="password"
                    type="password"
                    required
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Create Account
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Log in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
