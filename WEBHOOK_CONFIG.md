# 🔗 URLs de Webhook para Configurar na Cakto

## 📍 URL Principal do Webhook

Depois de fazer deploy na Netlify, configure esta URL na sua conta Cakto:

```
https://seu-site.netlify.app/.netlify/functions/cakto-webhook
```

**⚠️ IMPORTANTE:** Substitua `seu-site` pelo domínio real do seu site.

---

## 🔧 Configuração na Cakto

### URL do Webhook a Configurar:
```
https://[SEU-DOMINIO].netlify.app/.netlify/functions/cakto-webhook
```

### Exemplo Prático:
Se seu site é `agroflow.netlify.app`, a URL será:
```
https://agroflow.netlify.app/.netlify/functions/cakto-webhook
```

---

## 📋 Configuração Rápida

1. Acesse: https://app.cakto.com.br → Configurações → Webhooks
2. Clique em "Adicionar Webhook"
3. Configure:
   - **Nome:** `AgroFlow - Pagamentos`
   - **URL:** `https://seu-site.netlify.app/.netlify/functions/cakto-webhook`
   - **Eventos:** `Pagamento Aprovado`, `Pagamento Cancelado`, `Pagamento Falhou`
   - **Método:** `POST`
4. Salvar

---

## 🧪 Testar Webhook

Após configurar, você pode testar enviando um POST manual:

```bash
curl -X POST https://seu-site.netlify.app/.netlify/functions/cakto-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.approved",
    "data": {
      "payment_id": "test-123",
      "email": "teste@exemplo.com",
      "status": "paid"
    }
  }'
```

---

## 📖 Documentação Completa

Para informações detalhadas, veja: [CAKTO_INTEGRATION.md](./CAKTO_INTEGRATION.md)

