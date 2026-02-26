"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase"

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  email: string
  name: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>
  loginWithGoogle: () => Promise<{ error?: string }>
  logout: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => ({}),
  register: async () => ({}),
  loginWithGoogle: async () => ({}),
  logout: () => {},
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setIsAuthenticated(true)
        setUser({
          email: session.user.email!,
          name: session.user.user_metadata.name || session.user.user_metadata.full_name || "User",
        })
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      setUser(session ? {
        email: session.user.email!,
        name: session.user.user_metadata.name || session.user.user_metadata.full_name || "User",
      } : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Email / Password Login ────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    setIsAuthenticated(true)
    setUser({
      email: data.user.email!,
      name: data.user.user_metadata.name || "User",
    })
    return {}
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────

  const loginWithGoogle = async (): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/calculator`,
      },
    })
    if (error) return { error: error.message }
    return {}
  }

  // ── Register ──────────────────────────────────────────────────────────────

  const register = async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    // Use backend to create user via service role key (bypasses email confirmation)
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const resp = await fetch(`${apiBase}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!resp.ok) {
      const data = await resp.json()
      return { error: data.detail || "Registration failed" }
    }

    // Sign in immediately after account creation
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    setIsAuthenticated(true)
    setUser({ email: data.user.email!, name })
    return {}
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
