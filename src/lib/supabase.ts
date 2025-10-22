import { createClient } from '@supabase/supabase-js'

// Configuração temporária para desenvolvimento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cqdjokflpvnfptmqgwoj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZGpva2ZscHZuZnB0bXFnd29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4OTQ4NzYsImV4cCI6MjA1MDQ3MDg3Nn0.placeholder_key_replace_with_real_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
