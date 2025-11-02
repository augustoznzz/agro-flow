'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  hasActiveSubscription: boolean
  subscriptionStatus: 'active' | 'expired' | 'none'
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasActiveSubscription: false,
  subscriptionStatus: 'none',
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'expired' | 'none'>('none')

  useEffect(() => {
    // Se Supabase não está configurado, apenas marca como carregado
    if (!supabase) {
      setLoading(false)
      return
    }

    // TypeScript agora sabe que supabase não é null dentro deste bloco
    const client = supabase

    const checkSubscription = async (userId: string) => {
      try {
        const { data: subscription, error } = await client
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (subscription && !error) {
          const now = new Date()
          const expiresAt = new Date(subscription.expires_at)
          const isActive = subscription.payment_status === 'paid' && expiresAt > now
          
          setHasActiveSubscription(isActive)
          setSubscriptionStatus(isActive ? 'active' : 'expired')
        } else {
          setHasActiveSubscription(false)
          setSubscriptionStatus('none')
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
        setHasActiveSubscription(false)
        setSubscriptionStatus('none')
      }
    }

    const getSession = async () => {
      const { data: { session } } = await client.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await checkSubscription(session.user.id)
      }
      
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await checkSubscription(session.user.id)
        } else {
          setHasActiveSubscription(false)
          setSubscriptionStatus('none')
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, hasActiveSubscription, subscriptionStatus }}>
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
