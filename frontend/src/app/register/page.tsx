"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim())            { setError("Full name is required."); return }
    if (!email.trim())           { setError("Email address is required."); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return }
    if (password.length < 6)    { setError("Password must be at least 6 characters."); return }
    if (password !== confirmPassword) { setError("Passwords do not match."); return }

    setLoading(true)
    const { error: err } = await register(name.trim(), email.trim(), password)
    if (err) {
      setError(err)
      setLoading(false)
    } else {
      router.push("/calculator")
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern flex flex-col">
      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-lime font-serif text-xl font-semibold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
              BharatZero
            </span>
          </Link>
          <Link
            href="/login"
            className="text-white/50 text-xs font-bold uppercase tracking-widest hover:text-lime transition-colors"
          >
            Already have an account? Sign In
          </Link>
        </div>
      </nav>

      {/* ═══════════ FORM SECTION ═══════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Label */}
          <p className="text-lime text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Create Account
          </p>

          {/* Heading */}
          <h1 className="font-serif text-5xl md:text-6xl font-light leading-[0.95] tracking-tight text-white mb-2">
            Join
            <br />
            <span className="text-lime">BharatZero.</span>
          </h1>
          <p className="text-white/40 text-sm mt-4 mb-10">
            Create your free account to calculate CBAM emissions and save your reports.
          </p>

          {/* ── Form Card ── */}
          <div className="bg-cream border border-foreground/10 p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-dark-bg">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ravi Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-dark-bg">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-dark-bg">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-dark-bg">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
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
                {loading ? "Creating Account..." : (
                  <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-foreground/10" />
              <span className="text-foreground/30 text-xs uppercase tracking-widest font-bold">or</span>
              <div className="flex-1 h-px bg-foreground/10" />
            </div>

            {/* Sign in link */}
            <p className="text-center text-foreground/50 text-xs uppercase tracking-widest font-bold">
              Already have an account?{" "}
              <Link href="/login" className="text-dark-bg hover:underline underline-offset-4 transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          {/* Bottom note */}
          <p className="text-white/20 text-xs text-center mt-6 leading-relaxed">
            By creating an account you agree to our terms. Your data is stored locally and never shared.
          </p>
        </div>
      </div>

      {/* ═══════════ FOOTER BAR ═══════════ */}
      <div className="bg-lime px-6 py-3">
        <p className="text-dark-bg text-xs font-semibold text-center tracking-wide">
          © 2025 BharatZero. All rights reserved. Reports are AI-assisted drafts — verify with a qualified professional.
        </p>
      </div>
    </div>
  )
}
