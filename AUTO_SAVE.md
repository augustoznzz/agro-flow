# Sistema de Salvamento Automático - AgroFlow

## Visão Geral

O AgroFlow implementa um sistema completo de salvamento automático que garante que todas as alterações feitas pelo usuário sejam salvas automaticamente, sem necessidade de clicar em um botão "Salvar" explicitamente.

## Como Funciona

### Arquitetura

O sistema de auto-save é composto por três camadas principais:

1. **Hook `useAutoSave`** - Gerencia a lógica de salvamento automático com debounce
2. **Indicador Visual** - Componente `AutoSaveIndicator` que mostra o status do salvamento
3. **Persistência em Múltiplas Camadas**:
   - **IndexedDB** - Armazenamento local no navegador (funciona offline)
   - **Outbox Pattern** - Fila de sincronização para quando o usuário estiver online
   - **Supabase** - Banco de dados na nuvem

### Fluxo de Dados

```
Usuário digita no formulário
          ↓
Hook useAutoSave detecta mudanças (debounce 800ms)
          ↓
Atualiza o estado local (React Context)
          ↓
useEffect no DataContext salva no IndexedDB
          ↓
Adiciona operação na Outbox
          ↓
Quando online, sincroniza com Supabase
```

## Componentes Principais

### 1. Hook `useAutoSave`

Localizado em: `src/hooks/use-auto-save.ts`

**Características:**
- Debounce configurável (padrão: 1000ms)
- Detecta mudanças nos dados
- Pula o primeiro render para evitar salvamentos desnecessários
- Retorna status de salvamento (`idle`, `saving`, `saved`, `error`)
- Permite salvamento forçado com `forceSave()`

**Exemplo de uso:**

```typescript
import { useAutoSave } from '@/hooks/use-auto-save'

const { status, forceSave } = useAutoSave({
  data: formData,
  onSave: async (data) => {
    await updateItem(data)
  },
  delay: 800,
  enabled: isEditing // Só ativa quando está editando
})
```

### 2. Indicador Visual

Localizado em: `src/components/ui/auto-save-indicator.tsx`

Mostra ao usuário o status do salvamento:
- **Salvando...** (azul, ícone girando)
- **Salvo automaticamente** (verde, check)
- **Erro ao salvar** (vermelho, X)

### 3. Componentes com Auto-Save

#### TransactionFormAuto
- Salvamento automático ao editar transações
- Delay de 800ms
- Indicador visual de status

#### CropPlanningAuto
- Auto-save ao editar safras
- Validação automática dos campos obrigatórios
- Sincronização com IndexedDB

#### PropertyManagementAuto
- Salvamento automático de propriedades
- Persistência local e na nuvem

## Funcionalidades

### 1. Salvamento Automático na Edição

Quando o usuário edita um item existente:
- Cada alteração é detectada após 800ms de inatividade
- Os dados são salvos automaticamente
- Um indicador visual mostra o progresso
- Não há necessidade de clicar em "Salvar"

### 2. Salvamento Manual na Criação

Quando o usuário cria um novo item:
- O auto-save está **desativado** (`enabled: false`)
- O usuário precisa clicar em "Adicionar" para salvar
- Isso evita criar registros incompletos

### 3. Persistência Offline-First

- Todos os dados são salvos primeiro no IndexedDB (local)
- Funciona completamente offline
- Quando online, sincroniza automaticamente com Supabase
- Usa o padrão Outbox para garantir que nenhuma operação seja perdida

### 4. Sincronização Automática

- Detecta quando o usuário fica online
- Processa a fila de operações pendentes
- Tenta novamente em caso de erro
- Mantém a ordem das operações

## Benefícios

### Para o Usuário

1. **Nunca perde dados** - Salvamento automático e backup local
2. **Funciona offline** - Continua trabalhando sem internet
3. **Feedback visual** - Sempre sabe se os dados foram salvos
4. **Experiência fluida** - Não precisa lembrar de salvar

### Para o Sistema

1. **Consistência de dados** - IndexedDB + Supabase
2. **Resiliência** - Funciona mesmo com falhas de rede
3. **Performance** - Debounce evita salvamentos excessivos
4. **Escalabilidade** - Fila de operações processada de forma eficiente

## Configuração

### Ajustar o Delay do Auto-Save

No componente, modifique o parâmetro `delay`:

```typescript
const { status } = useAutoSave({
  data: formData,
  onSave: handleSave,
  delay: 1200, // Aumenta para 1.2 segundos
  enabled: isEditing
})
```

### Desabilitar Auto-Save

```typescript
const { status } = useAutoSave({
  data: formData,
  onSave: handleSave,
  enabled: false // Desabilita completamente
})
```

### Forçar Salvamento Imediato

```typescript
const { forceSave } = useAutoSave({...})

// Ao fechar o modal, por exemplo:
const handleClose = () => {
  forceSave() // Salva imediatamente
  closeModal()
}
```

## Tratamento de Erros

O sistema trata erros em múltiplos níveis:

1. **Hook useAutoSave**:
   - Captura erros e muda status para `error`
   - Exibe mensagem visual ao usuário
   - Volta para `idle` após 3 segundos

2. **IndexedDB**:
   - Erros são silenciados (try-catch)
   - Não quebra a aplicação

3. **Supabase**:
   - Operações ficam na Outbox até conseguir sincronizar
   - Tenta novamente quando o usuário ficar online

## Melhores Práticas

### 1. Use Auto-Save Apenas na Edição

```typescript
// ✅ Correto
enabled: editingId !== null

// ❌ Errado - vai criar registros vazios
enabled: true
```

### 2. Valide Dados Antes de Salvar

```typescript
onSave: (data) => {
  if (data.description && data.amount) {
    updateTransaction(data)
  }
}
```

### 3. Forneça Feedback Visual

Sempre mostre o `AutoSaveIndicator` quando usar auto-save:

```typescript
{isEditing && <AutoSaveIndicator status={autoSaveStatus} />}
```

### 4. Configure Delay Apropriado

- **800ms** - Bom para formulários (usado atualmente)
- **1500ms** - Melhor para campos grandes (descrições)
- **300ms** - Para campos de busca/filtro

## Limitações e Considerações

### 1. Campos Obrigatórios

O auto-save só funciona se os campos obrigatórios estiverem preenchidos. Implemente validação:

```typescript
onSave: (data) => {
  if (!data.requiredField) return // Não salva se inválido
  saveData(data)
}
```

### 2. Conflitos de Sincronização

Se dois usuários editarem o mesmo registro simultaneamente, o último a sincronizar vence (Last-Write-Wins). Para casos críticos, implemente controle de versão.

### 3. Quota do IndexedDB

Navegadores têm limite de armazenamento. O sistema não monitora isso atualmente. Considere implementar limpeza de dados antigos se necessário.

## Debugging

### Ver Dados no IndexedDB

1. Abra DevTools (F12)
2. Vá para Application > Storage > IndexedDB
3. Expanda `agroflow-db`
4. Veja as stores: `transactions`, `crops`, `properties`, `outbox`

### Ver Status de Sincronização

```typescript
// No console do navegador
const idb = await import('./lib/idb')
const outbox = await idb.idb.peekAll()
console.log('Operações pendentes:', outbox)
```

### Forçar Sincronização

```typescript
// No DataContext, exponha syncOutbox()
// Depois chame manualmente no console
syncOutbox()
```

## Próximos Passos

Possíveis melhorias futuras:

1. **Indicador global de sincronização** - Mostra quantas operações estão pendentes
2. **Resolução de conflitos** - Interface para resolver conflitos de edição
3. **Versionamento** - Histórico de alterações com possibilidade de desfazer
4. **Compressão de dados** - Reduzir uso de espaço no IndexedDB
5. **Sincronização seletiva** - Permitir escolher o que sincronizar
6. **Modo offline explícito** - Toggle para trabalhar offline intencionalmente

## Conclusão

O sistema de auto-save do AgroFlow garante que o usuário nunca perca seu trabalho, oferecendo uma experiência moderna e fluida, similar a aplicações como Google Docs, Notion e Airtable.

