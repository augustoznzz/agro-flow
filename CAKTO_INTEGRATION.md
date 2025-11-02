# 💳 Integração com Cakto - Sistema de Pagamento

## 📋 Visão Geral

O AgroFlow está configurado para permitir que usuários criem contas **apenas após realizar um pagamento** através da plataforma Cakto. Este documento descreve como configurar os webhooks da Cakto no Netlify.

## 🔗 Fluxo de Pagamento

1. **Usuário clica em "Assinar Agora"** → Redirecionado para `https://pay.cakto.com.br/buk8mfi_632549`
2. **Usuário completa o pagamento** na Cakto
3. **Cakto envia webhook** para o Netlify informando o pagamento aprovado
4. **Netlify processa o webhook** e cria a conta do usuário automaticamente
5. **Usuário recebe acesso** à plataforma AgroFlow

---

## 🛠️ Configuração na Netlify

### Passo 1: Obter Credenciais do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Settings → API**
4. Copie a **Service Role Key** (esta é a chave secreta que bypassa RLS)

**⚠️ IMPORTANTE:** NUNCA exponha esta chave no frontend!

### Passo 2: Configurar Variáveis de Ambiente no Netlify

Na Netlify, configure as seguintes variáveis:

1. Acesse: **Site settings → Environment variables**
2. Adicione/atualize:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
CAKTO_WEBHOOK_SECRET=chave_secreta_opcional
```

### Passo 3: Fazer Deploy com as Funções Netlify

As funções serverless já estão configuradas em `netlify/functions/cakto-webhook.ts`. Faça o deploy:

```bash
git add .
git commit -m "feat: adiciona integração com Cakto"
git push
```

A Netlify fará o deploy automaticamente e criará o endpoint:
`https://seu-site.netlify.app/.netlify/functions/cakto-webhook`

---

## 🔔 Configuração dos Webhooks na Cakto

### Passo 1: Acessar Configurações de Webhooks

1. Faça login em: https://app.cakto.com.br
2. Vá em: **Integrações → Webhooks** (ou **Configurações → Webhooks**)

### Passo 2: Criar Novo Webhook

Clique em **"Adicionar Webhook"** ou **"Criar Webhook"** e configure:

#### **Nome do Webhook:**
```
AgroFlow - Notificação de Pagamento
```

#### **URL do Webhook:**
```
https://seu-site.netlify.app/.netlify/functions/cakto-webhook
```

Substitua `seu-site` pelo domínio real do seu site na Netlify.

#### **Eventos para Monitorar:**

Selecione os seguintes eventos:
- ✅ `Pagamento Aprovado` (ou `payment.approved`)
- ✅ `Pagamento Cancelado` (ou `payment.cancelled`)
- ✅ `Pagamento Falhou` (ou `payment.failed`)

#### **Método HTTP:**
```
POST
```

#### **Autenticação (Opcional):**

Se você configurou a variável `CAKTO_WEBHOOK_SECRET`, a Cakto deve enviar este valor no header:

**Header:**
```
X-Webhook-Secret: sua_chave_secreta_aqui
```

Configure esse header no webhook da Cakto para autenticação.

### Passo 3: Salvar Webhook

Clique em **"Salvar"** ou **"Criar"** para ativar o webhook.

---

## 📨 Formato do Payload do Webhook

A função `cakto-webhook` espera receber um JSON no seguinte formato:

```json
{
  "event": "payment.approved",
  "data": {
    "payment_id": "12345678-1234-1234-1234-123456789012",
    "email": "usuario@exemplo.com",
    "status": "paid",
    "payment_date": "2024-01-15T10:30:00Z",
    "amount": 97.00,
    "metadata": {
      // Dados adicionais (opcional)
    }
  }
}
```

### Status Aceitos:

- `pending` - Pagamento pendente
- `paid` - Pagamento aprovado ✅
- `failed` - Pagamento falhou
- `cancelled` - Pagamento cancelado
- `expired` - Pagamento expirado

---

## 🗄️ Banco de Dados

### Tabela de Assinaturas

O sistema cria automaticamente registros na tabela `subscriptions`:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  payment_id TEXT UNIQUE NOT NULL,
  payment_status TEXT NOT NULL,
  payment_date TIMESTAMP,
  expires_at TIMESTAMP,  -- Validade de 1 ano
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Executar Migration

Execute o script atualizado do Supabase:

1. Acesse: https://supabase.com/dashboard
2. Vá em: **SQL Editor**
3. Cole o conteúdo de `supabase-setup.sql`
4. Execute o script

---

## 🧪 Testar a Integração

### Modo de Teste

A Cakto geralmente oferece um ambiente de sandbox/teste. Use esse ambiente para testar antes de ir para produção.

### Verificar Logs

1. Na Netlify: **Functions → cakto-webhook → View logs**
2. Procure por:
   - ✅ "Webhook processed" - Sucesso
   - ❌ "Error" - Falha

### Verificar no Supabase

Após um webhook de sucesso, verifique:

```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 10;
```

Deveria ver um novo registro com `payment_status = 'paid'`.

---

## 🔒 Segurança

### ✅ Boas Práticas Implementadas:

1. **Autenticação de Webhook:** Validação do header `X-Webhook-Secret`
2. **Service Role Key:** Usada apenas em funções serverless (nunca no frontend)
3. **Row Level Security:** Usuários só veem suas próprias assinaturas
4. **Validação de Payload:** Verificação de campos obrigatórios
5. **Error Handling:** Logs de erros para debugging

### ⚠️ Avisos:

- **Nunca exponha** `SUPABASE_SERVICE_ROLE_KEY` no frontend
- **Configure HTTPS** para produção (Netlify já fornece)
- **Monitore os logs** regularmente para detectar tentativas de fraude

---

## 📝 Checklist de Configuração

- [ ] Obter Service Role Key do Supabase
- [ ] Configurar variáveis de ambiente na Netlify
- [ ] Fazer deploy das funções serverless
- [ ] Executar migration SQL no Supabase
- [ ] Criar webhook na Cakto com a URL correta
- [ ] Selecionar eventos corretos (`paid`, `cancelled`, `failed`)
- [ ] Configurar autenticação (se aplicável)
- [ ] Testar com pagamento de teste
- [ ] Verificar logs na Netlify
- [ ] Verificar registro no Supabase
- [ ] Testar login com usuário de pagamento aprovado

---

## 🆘 Troubleshooting

### Problema: Webhook não está sendo recebido

**Solução:**
1. Verifique a URL do webhook na Cakto
2. Verifique os logs na Netlify Functions
3. Teste manualmente com curl:
   ```bash
   curl -X POST https://seu-site.netlify.app/.netlify/functions/cakto-webhook \
     -H "Content-Type: application/json" \
     -d '{"event":"payment.approved","data":{"payment_id":"test","email":"test@test.com","status":"paid"}}'
   ```

### Problema: Usuário não está sendo criado

**Solução:**
1. Verifique `SUPABASE_SERVICE_ROLE_KEY` está configurada
2. Verifique se a tabela `subscriptions` existe
3. Verifique as políticas RLS no Supabase
4. Veja os logs de erro na Netlify

### Problema: Política RLS bloqueando inserção

**Solução:**
Execute o comando SQL no Supabase:
```sql
-- Permitir que service role gerencie assinaturas
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

---

## 📚 Recursos Adicionais

- [Documentação da Cakto](https://cakto.com.br/documentacao)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Supabase Webhooks](https://supabase.com/docs/guides/database/webhooks)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## ✅ Sucesso!

Se você seguiu todos os passos, agora:
- ✅ Usuários só podem criar contas após pagar
- ✅ Webhooks processam pagamentos automaticamente
- ✅ Assinaturas são rastreadas no banco
- ✅ Acesso é bloqueado para usuários sem assinatura

**Parabéns! Seu sistema de pagamento está funcionando! 🎉**

