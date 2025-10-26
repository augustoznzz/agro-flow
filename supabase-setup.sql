-- =====================================================
-- AgroFlow - Configuração do Banco de Dados Supabase
-- =====================================================
-- Execute este script no SQL Editor do seu projeto Supabase
-- Para acessar: https://supabase.com/dashboard → seu projeto → SQL Editor

-- =====================================================
-- 1. CRIAÇÃO DAS TABELAS
-- =====================================================

-- Tabela de propriedades rurais
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  area_hectares DECIMAL NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ciclos de cultivo/safras
CREATE TABLE IF NOT EXISTS crop_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  planting_date DATE NOT NULL,
  harvest_date DATE,
  area_hectares DECIMAL NOT NULL,
  estimated_cost DECIMAL NOT NULL,
  estimated_revenue DECIMAL NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'planted', 'harvested')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações financeiras
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  status TEXT,
  project TEXT,
  client TEXT,
  isRecurring BOOLEAN DEFAULT false,
  recurrenceType TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_property_id ON crop_cycles(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3.1. POLÍTICAS PARA TABELA PROPERTIES
-- =====================================================

-- Usuários podem visualizar suas próprias propriedades
CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias propriedades
CREATE POLICY "Users can insert own properties" ON properties
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias propriedades
CREATE POLICY "Users can update own properties" ON properties
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias propriedades
CREATE POLICY "Users can delete own properties" ON properties
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- 3.2. POLÍTICAS PARA TABELA CROP_CYCLES
-- =====================================================

-- Usuários podem visualizar ciclos de suas propriedades
CREATE POLICY "Users can view own crop cycles" ON crop_cycles
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = crop_cycles.property_id 
      AND properties.user_id = auth.uid()
    )
  );

-- Usuários podem inserir ciclos em suas propriedades
CREATE POLICY "Users can insert own crop cycles" ON crop_cycles
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = crop_cycles.property_id 
      AND properties.user_id = auth.uid()
    )
  );

-- Usuários podem atualizar ciclos de suas propriedades
CREATE POLICY "Users can update own crop cycles" ON crop_cycles
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = crop_cycles.property_id 
      AND properties.user_id = auth.uid()
    )
  );

-- Usuários podem deletar ciclos de suas propriedades
CREATE POLICY "Users can delete own crop cycles" ON crop_cycles
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = crop_cycles.property_id 
      AND properties.user_id = auth.uid()
    )
  );

-- =====================================================
-- 3.3. POLÍTICAS PARA TABELA TRANSACTIONS
-- =====================================================

-- Usuários podem visualizar suas próprias transações
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias transações
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias transações
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias transações
CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. FUNÇÕES AUXILIARES (OPCIONAL)
-- =====================================================

-- Função para calcular o saldo total de um usuário
CREATE OR REPLACE FUNCTION get_user_balance(user_uuid UUID)
RETURNS DECIMAL AS $$
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
  FROM transactions
  WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- 5. CONFIGURAÇÕES DE AUTENTICAÇÃO (OPCIONAL)
-- =====================================================

-- Para permitir cadastro de novos usuários via email
-- Vá em: Authentication → Settings
-- Habilite: "Enable email confirmations" (se quiser confirmação por email)
-- Configure: "Site URL" com a URL do seu app na Netlify

-- =====================================================
-- PRONTO! 🎉
-- =====================================================
-- Após executar este script, sua aplicação estará configurada
-- com isolamento completo de dados por usuário.
--
-- Cada usuário só terá acesso aos seus próprios dados:
-- - Suas propriedades
-- - Seus ciclos de cultivo
-- - Suas transações
--
-- O Supabase garantirá isso automaticamente através do RLS!

