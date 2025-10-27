import { createClient } from '@supabase/supabase-js'

// Lê as credenciais das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Cria um cliente Supabase apenas se as variáveis estiverem configuradas
// Em desenvolvimento, o app funciona sem Supabase usando apenas IndexedDB
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper para verificar se Supabase está disponível
export const isSupabaseAvailable = () => supabase !== null

// Função para validar que Supabase está configurado quando necessário
export const requireSupabase = () => {
  if (!supabase) {
    console.warn('⚠️ Supabase not configured. Running in offline mode with IndexedDB only.')
    return null
  }
  return supabase
}
