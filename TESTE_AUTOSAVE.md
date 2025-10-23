# 🧪 Guia de Testes - Sistema de Auto-Save

## Como Testar o Sistema de Salvamento Automático

### 🚀 Passo 1: Iniciar o Projeto

```bash
# Instalar dependências (se necessário)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Aguarde o servidor iniciar e acesse: `http://localhost:3000`

---

## ✅ Teste 1: Auto-Save em Transações

### Objetivo
Verificar se transações são salvas automaticamente ao editar

### Passos

1. **Login** no sistema (se necessário)
2. Navegue para **"Transações"** no menu lateral
3. Clique no botão **"Editar"** (ícone de lápis) em uma transação existente
4. **Modifique** o valor ou descrição
5. **Aguarde 1 segundo** sem digitar

### ✅ Resultado Esperado

- Deve aparecer "🔵 Salvando..." no canto superior direito
- Após ~1 segundo, deve mudar para "✅ Salvo automaticamente"
- O indicador desaparece após 2 segundos
- A transação foi atualizada

### ✅ Validação

1. Feche o modal (sem clicar em "Salvar")
2. Reabra o mesmo item para editar
3. Verifique se as alterações foram mantidas

---

## ✅ Teste 2: Auto-Save em Safras

### Objetivo
Verificar se safras são salvas automaticamente

### Passos

1. Navegue para **"Planejamento de Safra"**
2. Clique em **"Editar"** em uma safra existente
3. Altere o **tipo de cultura** ou **área**
4. Aguarde o indicador de auto-save

### ✅ Resultado Esperado

- Indicador mostra "Salvando..." e depois "Salvo"
- Alterações são persistidas
- Pode fechar modal sem clicar em botão

---

## ✅ Teste 3: Auto-Save em Propriedades

### Objetivo
Verificar auto-save em propriedades

### Passos

1. Navegue para **"Gestão de Propriedades"**
2. Clique em **"Editar"** em uma propriedade
3. Altere o **nome** ou **localização**
4. Observe o indicador

### ✅ Resultado Esperado

- Auto-save funciona corretamente
- Dados são salvos automaticamente

---

## ✅ Teste 4: Criação Manual (Sem Auto-Save)

### Objetivo
Verificar que ao criar novo item, auto-save está desativado

### Passos

1. Clique em **"Nova Transação"** (ou safra/propriedade)
2. Preencha alguns campos
3. **Observe**: NÃO deve aparecer indicador de auto-save

### ✅ Resultado Esperado

- **Nenhum** indicador de auto-save aparece
- Precisa clicar em "Adicionar" para salvar
- Previne criação de registros vazios

---

## ✅ Teste 5: Persistência Offline

### Objetivo
Verificar que dados são salvos localmente

### Passos

1. Edite uma transação e aguarde auto-save
2. Abra **DevTools** (F12)
3. Vá em **Application > Storage > IndexedDB**
4. Expanda **agroflow-db > transactions**
5. Veja os dados salvos

### ✅ Resultado Esperado

- Dados aparecem no IndexedDB
- Sincronização funciona offline

---

## ✅ Teste 6: Sincronização Online

### Objetivo
Verificar fila de sincronização

### Passos

1. Abra **DevTools > Application > IndexedDB**
2. Veja **agroflow-db > outbox**
3. Edite alguns itens
4. Verifique operações na outbox

### ✅ Resultado Esperado

- Operações são adicionadas à outbox
- Quando online, são sincronizadas com Supabase
- Outbox é limpa após sincronização

---

## ✅ Teste 7: Validação de Campos

### Objetivo
Verificar que campos inválidos não são salvos

### Passos

1. Edite uma transação
2. **Limpe** o campo descrição (campo obrigatório)
3. Altere outro campo
4. Aguarde

### ✅ Resultado Esperado

- Auto-save **não** executa se campos obrigatórios vazios
- Pode implementar validação visual (opcional)

---

## ✅ Teste 8: Múltiplas Edições Rápidas

### Objetivo
Verificar debounce funcionando

### Passos

1. Edite uma transação
2. Digite rapidamente no campo valor: `100`, `200`, `300`, `400`
3. Observe o indicador

### ✅ Resultado Esperado

- Indicador **não** aparece a cada tecla
- Aguarda 800ms de inatividade
- Salva apenas uma vez com valor final

---

## ✅ Teste 9: Fechar Modal Durante Salvamento

### Objetivo
Verificar comportamento ao fechar durante save

### Passos

1. Edite uma transação
2. Digite algo
3. Imediatamente clique em "Cancelar" ou feche modal

### ✅ Resultado Esperado

- Modal fecha normalmente
- Salvamento pode ou não completar (dependendo do timing)
- Sem erros no console

---

## ✅ Teste 10: Atualização em Tempo Real

### Objetivo
Verificar que lista atualiza após auto-save

### Passos

1. Veja uma transação na lista
2. Edite o valor de R$ 100 para R$ 999
3. Aguarde auto-save
4. Feche o modal
5. Observe a lista

### ✅ Resultado Esperado

- Lista mostra valor atualizado (R$ 999)
- Não precisa recarregar página
- Estado global sincronizado

---

## 🐛 Testes de Erros

### Teste E1: Sem Conexão com Supabase

1. Desconecte internet (ou configure Supabase inválido)
2. Edite item
3. Aguarde auto-save

**Esperado:**
- Salva localmente (IndexedDB)
- Adiciona à outbox
- Funciona normalmente offline

### Teste E2: IndexedDB Desabilitado

1. Desabilite IndexedDB no navegador (raro)
2. Use o sistema

**Esperado:**
- Sistema continua funcionando
- Apenas não persiste entre sessões

---

## 📊 Checklist de Validação

Use este checklist para validar a implementação:

### Funcionalidades Básicas
- [ ] Auto-save funciona em Transações
- [ ] Auto-save funciona em Safras
- [ ] Auto-save funciona em Propriedades
- [ ] Indicador visual aparece corretamente
- [ ] Indicador mostra "Salvando..."
- [ ] Indicador mostra "Salvo automaticamente"
- [ ] Indicador some após alguns segundos

### Criação vs Edição
- [ ] Criação **não** tem auto-save
- [ ] Edição **tem** auto-save
- [ ] Botão "Adicionar" funciona para criação
- [ ] Pode fechar modal após edição sem salvar manualmente

### Persistência
- [ ] Dados salvos localmente (IndexedDB)
- [ ] Dados aparecem na outbox
- [ ] Dados sincronizam com Supabase (se online)
- [ ] Dados persistem após recarregar página

### Performance
- [ ] Debounce funciona (não salva a cada tecla)
- [ ] Interface não trava
- [ ] Sem lag perceptível
- [ ] Indicadores são suaves

### Erros
- [ ] Funciona offline
- [ ] Não quebra sem Supabase
- [ ] Sem erros no console
- [ ] Validação previne dados inválidos

---

## 🔍 Debugging

### Ver Console do Navegador

```javascript
// Abra console (F12) e execute:

// Ver dados no IndexedDB
indexedDB.databases().then(console.log)

// Ver transações
const request = indexedDB.open('agroflow-db', 1)
request.onsuccess = (e) => {
  const db = e.target.result
  const tx = db.transaction('transactions', 'readonly')
  const store = tx.objectStore('transactions')
  const req = store.getAll()
  req.onsuccess = () => console.log('Transactions:', req.result)
}

// Ver outbox
const request2 = indexedDB.open('agroflow-db', 1)
request2.onsuccess = (e) => {
  const db = e.target.result
  const tx = db.transaction('outbox', 'readonly')
  const store = tx.objectStore('outbox')
  const req = store.getAll()
  req.onsuccess = () => console.log('Outbox:', req.result)
}
```

### Ver Network Requests

1. Abra DevTools (F12)
2. Vá em **Network**
3. Filtre por **Fetch/XHR**
4. Edite um item
5. Veja requisições para Supabase

---

## 📝 Reportar Problemas

Se encontrar problemas, anote:

1. **Navegador e versão** (Chrome 119, Firefox 120, etc.)
2. **Passos para reproduzir**
3. **Comportamento esperado**
4. **Comportamento observado**
5. **Mensagens de erro** (console)
6. **Screenshots** (se aplicável)

---

## ✅ Tudo Funcionando?

Se todos os testes passaram:

🎉 **Parabéns!** O sistema de auto-save está funcionando perfeitamente!

Agora você tem:
- ✅ Salvamento automático em todos os formulários
- ✅ Feedback visual para o usuário
- ✅ Persistência offline
- ✅ Sincronização automática
- ✅ Experiência moderna e fluida

---

## 🚀 Próximos Passos

1. Teste em diferentes navegadores (Chrome, Firefox, Edge, Safari)
2. Teste em dispositivos móveis
3. Teste com conexão lenta (throttling)
4. Teste com muitos dados
5. Implante em produção!

---

**Dúvidas?** Consulte a documentação completa em `AUTO_SAVE.md`

**Bons testes!** 🧪

