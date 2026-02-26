"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    // Simulate network delay
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern flex flex-col">
      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-lime font-serif text-xl font-semibold tracking-tight cursor-pointer">
              BharatZero
            </span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest hover:text-lime transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </nav>

      {/* ═══════════ FORM SECTION ═══════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Label */}
          <p className="text-lime text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Password Recovery
          </p>

          {/* Heading */}
          <h1 className="font-serif text-5xl md:text-6xl font-light leading-[0.95] tracking-tight text-white mb-2">
            Reset Your
            <br />
            <span className="text-lime">Password.</span>
          </h1>
          <p className="text-white/40 text-sm mt-4 mb-10">
            Enter your registered email and we'll send you a reset link.
          </p>

          {/* ── Form Card ── */}
          <div className="bg-cream border border-foreground/10 p-8">
            {submitted ? (
              /* ── Success State ── */
              <div className="text-center py-4 space-y-5">
                <div className="flex justify-center">
                  <div className="h-14 w-14 border-2 border-cbam-green bg-cbam-green/10 flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-cbam-green" />
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-dark-bg uppercase tracking-wide text-sm mb-2">
                    Check Your Inbox
                  </h2>
                  <p className="text-foreground/60 text-sm leading-relaxed">
                    If <span className="font-semibold text-dark-bg">{email}</span> is registered,
                    you'll receive a reset link shortly. Check your spam folder if it doesn't arrive.
                  </p>
                </div>
                <div className="pt-2 space-y-3">
                  <Button
                    variant="lime"
                    size="default"
                    className="w-full"
                    onClick={() => { setSubmitted(false); setEmail("") }}
                  >
                    Try a Different Email
                  </Button>
                  <Link href="/login">
                    <Button variant="outline" size="default" className="w-full mt-2">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* ── Email Form ── */
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-dark-bg">
                    Registered Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <p className="text-foreground/40 text-xs leading-relaxed">
                    Enter the email associated with your BharatZero account.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-cbam-red text-xs font-semibold uppercase tracking-wide border border-cbam-red/30 bg-cbam-red/5 px-4 py-3">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  variant="lime"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Sending Reset Link..." : "Send Reset Link"}
                </Button>

                {/* Divider + Back to login */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1 h-px bg-foreground/10" />
                  <span className="text-foreground/30 text-xs uppercase tracking-widest font-bold">
                    or
                  </span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>

                <p className="text-center text-foreground/50 text-xs uppercase tracking-widest font-bold">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-dark-bg hover:underline underline-offset-4 transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
            )}
          </div>

          {/* Bottom note */}
          <p className="text-white/20 text-xs text-center mt-6 leading-relaxed">
            Reset links expire after 24 hours. Contact support if you need further assistance.
          </p>
        </div>
      </div>

      {/* ═══════════ FOOTER BAR ═══════════ */}
      <div className="bg-lime px-6 py-3">
        <p className="text-dark-bg text-xs font-semibold text-center tracking-wide">
          © 2025 BharatZero Lite. All rights reserved. Reports are AI-assisted drafts — verify with a qualified professional.
        </p>
      </div>
    </div>
  )
}
