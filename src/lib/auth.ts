"use client"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function signIn({ loginId, password }: { loginId: string; password: string }) {
  const { error } = await supabase.auth.signInWithPassword({
    email: loginId,
    password,
  })
  
  if (error) throw error
}

export async function signUp({ email, password, companyName }: { email: string; password: string; companyName: string }) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) throw error
}