'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Demo user para desenvolvimento - pula autenticação
  const [user] = useState<User | null>({
    id: 'demo-user',
    email: 'demo@agroflow.com',
    user_metadata: { name: 'Usuário Demo' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as User)
  const [loading] = useState(false)

  // Comentado temporariamente para desenvolvimento
  // useEffect(() => {
  //   const getSession = async () => {
  //     const { data: { session } } = await supabase.auth.getSession()
  //     setUser(session?.user ?? null)
  //     setLoading(false)
  //   }

  //   getSession()

  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(
  //     (event, session) => {
  //       setUser(session?.user ?? null)
  //       setLoading(false)
  //     }
  //   )

  //   return () => subscription.unsubscribe()
  // }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
