import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://cqdjokflpvnfptmqgwoj.supabase.co'
const supabaseAnonKey = 'sb_publishable_zz-MJnXHYqwm4tJ25OwApQ_lEy3FcK_'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
