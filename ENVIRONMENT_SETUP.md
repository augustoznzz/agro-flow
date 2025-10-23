# Configuração de Variáveis de Ambiente

## Para Desenvolvimento Local

1. Copie o arquivo `env.example` para `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edite o arquivo `.env.local` com suas credenciais reais do Supabase.

## Para Deploy na Netlify

1. Acesse o painel da Netlify: https://app.netlify.com/
2. Vá para o seu site
3. Navegue para: Site settings > Environment variables
4. Adicione as seguintes variáveis:

### Variáveis Obrigatórias:
- `NEXT_PUBLIC_SUPABASE_URL` - URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase (opcional, para operações server-side)

### Exemplo de Configuração:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_aqui
```

## Segurança

- **NUNCA** commite arquivos `.env.local` ou `.env` com credenciais reais
- Use sempre o `env.example` como template
- As variáveis `NEXT_PUBLIC_*` são expostas no cliente
- As variáveis sem `NEXT_PUBLIC_` são apenas para o servidor
