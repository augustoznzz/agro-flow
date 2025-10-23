# 🎯 Como Usar o Sistema de Auto-Save - Guia Rápido

## Para Usuários Finais

### 🆕 Criar Novo Item

1. Clique em **"Nova Transação"** / **"Nova Safra"** / **"Nova Propriedade"**
2. Preencha os campos do formulário
3. Clique em **"Adicionar"** para salvar
4. ✅ Item criado!

### ✏️ Editar Item Existente

1. Clique no botão **"Editar"** (ícone de lápis) em um item
2. Comece a digitar nos campos
3. 👀 Observe o indicador no canto superior direito:
   - **🔵 "Salvando..."** - Está salvando suas alterações
   - **✅ "Salvo automaticamente"** - Tudo salvo!
   - **❌ "Erro ao salvar"** - Houve um problema
4. Continue editando, cada mudança é salva automaticamente
5. Pode fechar o formulário a qualquer momento - está tudo salvo!

### 📡 Trabalhando Offline

1. Se você ficar sem internet, continue trabalhando normalmente
2. Suas alterações são salvas localmente no navegador
3. Quando a internet voltar, tudo sincroniza automaticamente
4. ☁️ Seus dados estão seguros!

## Para Desenvolvedores

### 🛠️ Adicionar Auto-Save em Novo Componente

#### Passo 1: Importar o Hook

```typescript
import { useAutoSave } from '@/hooks/use-auto-save'
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator'
```

#### Passo 2: Configurar Estado do Formulário

```typescript
const [editingId, setEditingId] = useState<string | null>(null)
const [formData, setFormData] = useState({
  campo1: '',
  campo2: '',
  // ... outros campos
})
```

#### Passo 3: Adicionar Hook useAutoSave

```typescript
const { status: autoSaveStatus } = useAutoSave({
  data: formData,
  onSave: (data) => {
    if (editingId && validarDados(data)) {
      updateItem(editingId, data)
    }
  },
  delay: 800, // 800ms de espera
  enabled: editingId !== null // Só ativa ao editar
})
```

#### Passo 4: Adicionar Indicador Visual

```tsx
{editingId && (
  <div className="flex justify-end">
    <AutoSaveIndicator status={autoSaveStatus} />
  </div>
)}
```

#### Passo 5: Implementar Handlers

```typescript
// Editar item existente
const handleEdit = (item: Item) => {
  setEditingId(item.id)
  setFormData({
    campo1: item.campo1,
    campo2: item.campo2,
    // ... preencher formulário
  })
  setShowForm(true)
}

// Criar novo item
const handleCreate = () => {
  setEditingId(null) // Desativa auto-save
  setFormData({
    campo1: '',
    campo2: '',
    // ... campos vazios
  })
  setShowForm(true)
}

// Salvar (manual para criação, confirmação para edição)
const handleSave = () => {
  if (editingId) {
    // Edição - já foi salvo automaticamente
    // Apenas fecha o formulário
    resetForm()
  } else {
    // Criação - salva agora
    createItem(formData)
    resetForm()
  }
}

// Reset
const resetForm = () => {
  setFormData({ campo1: '', campo2: '' })
  setEditingId(null)
  setShowForm(false)
}
```

### 📝 Exemplo Completo

```typescript
'use client'

import { useState } from 'react'
import { useAutoSave } from '@/hooks/use-auto-save'
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

export function MeuComponente() {
  const { items, addItem, updateItem } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    valor: ''
  })

  // Auto-save hook
  const { status: autoSaveStatus } = useAutoSave({
    data: formData,
    onSave: (data) => {
      if (editingId && data.nome && data.valor) {
        updateItem(editingId, data)
      }
    },
    delay: 800,
    enabled: editingId !== null
  })

  const handleSave = () => {
    if (formData.nome && formData.valor) {
      if (editingId) {
        updateItem(editingId, formData)
      } else {
        addItem(formData)
      }
      resetForm()
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setFormData({
      nome: item.nome,
      valor: item.valor
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ nome: '', valor: '' })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div>
      <Button onClick={() => { resetForm(); setShowForm(true) }}>
        Novo Item
      </Button>

      <Modal 
        open={showForm} 
        onClose={resetForm}
        title={editingId ? 'Editar Item' : 'Novo Item'}
      >
        {/* Indicador de Auto-Save */}
        {editingId && (
          <div className="flex justify-end mb-4">
            <AutoSaveIndicator status={autoSaveStatus} />
          </div>
        )}

        {/* Formulário */}
        <div className="space-y-4">
          <div>
            <label>Nome</label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>
          <div>
            <label>Valor</label>
            <Input
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
            />
          </div>
          
          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lista de Items */}
      {items.map(item => (
        <div key={item.id}>
          <span>{item.nome}</span>
          <Button onClick={() => handleEdit(item)}>Editar</Button>
        </div>
      ))}
    </div>
  )
}
```

## ⚙️ Configurações Avançadas

### Ajustar Tempo de Espera

```typescript
delay: 500   // Mais rápido (0.5s)
delay: 1000  // Padrão (1s)
delay: 2000  // Mais lento (2s)
```

**Recomendações:**
- 300-500ms: Campos de busca/filtro
- 800-1000ms: Formulários normais ✅
- 1500-2000ms: Textos longos/descrições

### Salvamento Forçado

```typescript
const { forceSave } = useAutoSave({...})

// Ao fechar modal
const handleClose = () => {
  forceSave() // Salva imediatamente
  setShowModal(false)
}

// Antes de navegar
const handleNavigate = () => {
  forceSave()
  router.push('/outra-pagina')
}
```

### Validação Customizada

```typescript
onSave: (data) => {
  // Só salva se campos obrigatórios estiverem preenchidos
  if (!data.campo1 || !data.campo2) {
    return // Não salva
  }
  
  // Validação adicional
  if (data.valor < 0) {
    console.warn('Valor negativo, não salvando')
    return
  }
  
  // Tudo OK, salva
  updateItem(editingId, data)
}
```

### Controle Condicional

```typescript
// Ativar/desativar baseado em condições
const { status } = useAutoSave({
  data: formData,
  onSave: handleSave,
  enabled: editingId !== null && isOnline && hasPermission
})
```

## 🐛 Troubleshooting

### Auto-Save não está funcionando

1. ✅ Verifique se `enabled: true` ou `enabled: editingId !== null`
2. ✅ Confirme que os dados estão mudando
3. ✅ Verifique se há validação bloqueando
4. ✅ Olhe o console para erros

### Salvando muitas vezes

1. ⬆️ Aumente o `delay` (ex: 1500ms)
2. ✅ Adicione validação para pular salvamentos desnecessários

### Dados não sincronizam

1. ✅ Verifique conexão com internet
2. 🔍 Abra DevTools > Application > IndexedDB > agroflow-db > outbox
3. 📊 Veja se há operações pendentes
4. 🔄 Force sincronização (veja documentação completa)

### Indicador não aparece

1. ✅ Verifique se está em modo edição (`editingId !== null`)
2. ✅ Confirme importação do componente
3. ✅ Verifique se o status está sendo passado corretamente

## 📚 Referências

- 📖 Documentação completa: `AUTO_SAVE.md`
- 📝 Resumo técnico: `AUTOSAVE_RESUMO.md`
- 💻 Exemplos: Ver componentes em `src/components/*/` com sufixo `-auto.tsx`

## 🎓 Dicas Finais

1. 💡 Use auto-save apenas para **edição**, não para **criação**
2. 💡 Sempre mostre o **indicador visual** ao usuário
3. 💡 Configure **delay apropriado** para cada tipo de campo
4. 💡 Implemente **validação** antes de salvar
5. 💡 Teste o comportamento **offline**

---

**Precisa de ajuda?** Consulte a documentação completa ou veja os exemplos nos componentes existentes!

