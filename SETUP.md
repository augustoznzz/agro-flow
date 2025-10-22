# Configuração do AgroFlow

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cqdjokflpvnfptmqgwoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Database URL
DATABASE_URL=postgresql://postgres:Guto0307!@@db.cqdjokflpvnfptmqgwoj.supabase.co:5432/postgres
```

## Como obter a chave anônima do Supabase:

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em Settings > API
4. Copie a "anon public" key
5. Cole no arquivo .env.local

## Executar o projeto:

```bash
npm run dev
```

O projeto estará disponível em http://localhost:3000
