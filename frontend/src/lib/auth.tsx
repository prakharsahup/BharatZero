"use client"

/**
 * Auth module — currently uses localStorage for demo.
 *
 * TO SWITCH TO SUPABASE:
 *  1. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 *  2. Replace the localStorage calls in login/register/logout with the
 *     commented-out Supabase equivalents below each block.
 *  3. Remove the localStorage user-store logic entirely.
 */

import { createContext, useContext, useEffect, useState } from "react"

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
  logout: () => void
}

// ─── Helpers (localStorage user store) ───────────────────────────────────────

const USERS_KEY = "bz_users"
const AUTH_KEY  = "bz_auth"
const USER_KEY  = "bz_user"

interface StoredUser { name: string; email: string; password: string }

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") } catch { return [] }
}

function saveStoredUser(u: StoredUser) {
  const users = getStoredUsers()
  users.push(u)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => ({}),
  register: async () => ({}),
  logout: () => {},
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Rehydrate session on mount
    const auth = localStorage.getItem(AUTH_KEY)
    if (auth === "true") {
      try {
        const u = JSON.parse(localStorage.getItem(USER_KEY) || "null")
        if (u) { setIsAuthenticated(true); setUser(u) }
      } catch { /* ignore */ }
    }

    // ── Supabase equivalent:
    // const { data: { session } } = await supabase.auth.getSession()
    // if (session?.user) { setIsAuthenticated(true); setUser({ email: session.user.email!, name: session.user.user_metadata.name }) }
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    //   setIsAuthenticated(!!session); setUser(session ? { email: session.user.email!, name: session.user.user_metadata.name } : null)
    // })
    // return () => subscription.unsubscribe()
  }, [])

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const users = getStoredUsers()
    const match = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!match) return { error: "Invalid email or password." }

    const u: User = { email: match.email, name: match.name }
    localStorage.setItem(AUTH_KEY, "true")
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setIsAuthenticated(true)
    setUser(u)
    return {}

    // ── Supabase equivalent:
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    // if (error) return { error: error.message }
    // setIsAuthenticated(true); setUser({ email: data.user.email!, name: data.user.user_metadata.name })
    // return {}
  }

  // ── Register ──────────────────────────────────────────────────────────────

  const register = async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    const users = getStoredUsers()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: "An account with this email already exists." }
    }

    saveStoredUser({ name, email, password })

    const u: User = { email, name }
    localStorage.setItem(AUTH_KEY, "true")
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setIsAuthenticated(true)
    setUser(u)
    return {}

    // ── Supabase equivalent:
    // const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    // if (error) return { error: error.message }
    // setIsAuthenticated(true); setUser({ email: data.user!.email!, name })
    // return {}
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = () => {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(USER_KEY)
    setIsAuthenticated(false)
    setUser(null)

    // ── Supabase equivalent:
    // await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
