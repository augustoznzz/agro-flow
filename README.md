# AgroFlow - Gestão Rural Inteligente

SaaS completo projetado para auxiliar pequenos produtores rurais na gestão financeira, planejamento de safra e controle de fluxo de caixa.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Autenticação Segura**: Login e registro com Supabase Auth
- **Dashboard Interativo**: Métricas financeiras e gráficos de fluxo de caixa
- **Planejamento de Safra**: Gestão de ciclos produtivos e culturas
- **Controle de Caixa**: Registro de receitas e despesas
- **Gestão Multi-Propriedade**: Administração de múltiplas propriedades rurais
- **Interface Responsiva**: Design moderno e otimizado para mobile
- **PWA**: Funcionamento offline com sincronização automática

### 🔄 Em Desenvolvimento
- Integração com APIs externas (INMET, EMBRAPA)
- Relatórios automáticos em PDF
- Assistente IA para sugestões financeiras
- Análise preditiva de safras

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd agro-flow
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. Execute o projeto:
```bash
npm run dev
```

## 🗄️ Configuração do Banco de Dados

### Tabelas Necessárias no Supabase:

```sql
-- Tabela de propriedades
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  area_hectares DECIMAL NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ciclos de cultivo
CREATE TABLE crop_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  crop_type TEXT NOT NULL,
  planting_date DATE NOT NULL,
  harvest_date DATE,
  area_hectares DECIMAL NOT NULL,
  estimated_cost DECIMAL NOT NULL,
  estimated_revenue DECIMAL NOT NULL,
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  crop_cycle_id UUID REFERENCES crop_cycles(id),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de RLS (Row Level Security)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para propriedades
CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para ciclos de cultivo
CREATE POLICY "Users can view own crop cycles" ON crop_cycles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = crop_cycles.property_id 
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own crop cycles" ON crop_cycles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = crop_cycles.property_id 
      AND properties.user_id = auth.uid()
    )
  );

-- Políticas para transações
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 📱 PWA

O AgroFlow funciona como Progressive Web App, permitindo:
- Instalação no dispositivo
- Funcionamento offline
- Notificações push
- Acesso direto via ícone na tela inicial

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto, entre em contato através dos issues do GitHub.

---

**AgroFlow** - Transformando a gestão rural com tecnologia 🚜💚