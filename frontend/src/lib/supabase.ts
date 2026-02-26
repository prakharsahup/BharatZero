/**
 * Supabase client — ready to use once you add env vars.
 *
 * SETUP:
 *  1. Create a project at supabase.com
 *  2. Go to Project Settings → API
 *  3. Copy "Project URL" and "anon public" key
 *  4. Add them to .env.local (see .env.local.example)
 *  5. Run the SQL schema below in Supabase SQL Editor:
 *
 * ─────────────────────────────────────────────────────
 * CREATE TABLE calculations (
 *   id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   session_id        TEXT NOT NULL,
 *   company_name      TEXT,
 *   industry          TEXT,
 *   state             TEXT,
 *   scope1_kg_co2e    REAL,
 *   scope2_kg_co2e    REAL,
 *   total_tco2e       REAL,
 *   intensity         REAL,
 *   cbam_status       TEXT,
 *   cbam_label        TEXT,
 *   percent_vs_benchmark REAL,
 *   created_at        TIMESTAMPTZ DEFAULT now()
 * );
 *
 * -- Enable Row Level Security
 * ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
 *
 * -- Users can only see their own calculations
 * CREATE POLICY "Users can read own calculations"
 *   ON calculations FOR SELECT
 *   USING (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can insert own calculations"
 *   ON calculations FOR INSERT
 *   WITH CHECK (auth.uid() = user_id);
 * ─────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
