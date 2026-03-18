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

export default function ForgotPasswordPage() {
  const { showFlag } = useApp();

  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // SEND OTP
  const sendOtp = async () => {
    setLoading(true);

    await api
      .post("/auth/send-reset-otp", { email })
      .then(() => {
        setOtpSent(true);
        showFlag(`OTP sent to ${email}`, "success");
      })
      .catch(() => {
        showFlag("Failed to send OTP", "error");
      })
      .finally(() => setLoading(false));
  };

  // VERIFY OTP
  const verifyOtp = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      showFlag("Enter the full 6 digit code", "error");
      return;
    }

    setLoading(true);

    await api
      .post("/auth/verify-reset-otp", { email, otp: code })
      .then(() => {
        setVerified(true);
        showFlag("OTP verified", "success");
      })
      .catch(() => {
        showFlag("Invalid OTP", "error");
      })
      .finally(() => setLoading(false));
  };

  // RESET PASSWORD
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showFlag("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    await api
      .post("/auth/reset-password", {
        email,
        password,
      })
      .then(() => {
        showFlag("Password updated successfully", "success");
      })
      .catch(() => {
        showFlag("Failed to reset password", "error");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 md:grid-cols-2 overflow-hidden rounded-xl shadow-xl">

        {/* LEFT SIDE — PRODUCT VISUAL */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative hidden md:flex flex-col justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white"
        >
          <Logo className="mb-8 h-10 w-10" />

          <h2 className="text-3xl font-bold mb-4">
            Secure your account
          </h2>

          <p className="text-sm opacity-90 mb-8">
            Reset your password and continue building your professional
            resume with AI assistance.
          </p>

          <div className="flex gap-4">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-white/10 p-4 rounded-xl w-40"
            >
              <p className="font-semibold">Secure Login</p>
              <p className="text-xs opacity-80">OTP verification</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.2, repeat: Infinity }}
              className="bg-white/10 p-4 rounded-xl w-40"
            >
              <p className="font-semibold">Fast Recovery</p>
              <p className="text-xs opacity-80">Reset instantly</p>
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
                Reset your password
              </CardTitle>

              <CardDescription>
                Enter your email to receive a verification code.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={resetPassword} className="space-y-5">

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label>Email</Label>

                  <div className="flex gap-2">
                    <Input
                      type="email"
                      required
                      disabled={otpSent}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <Button
                      type="button"
                      onClick={sendOtp}
                      disabled={otpSent}
                    >
                      {loading ? (
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
                {otpSent && !verified && (
                  <div className="space-y-4">
                    <Label>Verification Code</Label>

                    <OtpInput value={otp} onChange={setOtp} />

                    <Button
                      type="button"
                      className="w-full"
                      onClick={verifyOtp}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>
                )}

                {/* PASSWORD FIELDS */}
                {verified && (
                  <>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </>
                )}
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}