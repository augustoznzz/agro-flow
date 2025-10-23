'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator'
import { useData } from '@/contexts/data-context'
import { useAutoSave } from '@/hooks/use-auto-save'

interface Property {
  id: string
  name: string
  area: number
  location: string
  description?: string
}

export function PropertyManagementAuto() {
  const { properties, addProperty, updateProperty, deleteProperty, deleteAllProperties } = useData()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    location: '',
    description: ''
  })
  const [showDeleteAll, setShowDeleteAll] = useState(false)

  // Auto-save quando editando
  const { status: autoSaveStatus } = useAutoSave({
    data: formData,
    onSave: (data) => {
      if (editingId && data.name && data.area && data.location) {
        updateProperty(editingId, {
          name: data.name,
          area: Number(data.area),
          location: data.location,
          description: data.description
        })
      }
    },
    delay: 800,
    enabled: editingId !== null
  })

  const handleSave = () => {
    if (formData.name && formData.area && formData.location) {
      if (editingId) {
        updateProperty(editingId, {
          name: formData.name,
          area: Number(formData.area),
          location: formData.location,
          description: formData.description
        })
      } else {
        addProperty({
          name: formData.name,
          area: Number(formData.area),
          location: formData.location,
          description: formData.description
        })
      }
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({ name: '', area: '', location: '', description: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEditProperty = (property: Property) => {
    setEditingId(property.id)
    setFormData({
      name: property.name,
      area: property.area.toString(),
      location: property.location,
      description: property.description || ''
    })
    setShowForm(true)
  }

  const handleDeleteProperty = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta propriedade?')) {
      deleteProperty(id)
    }
  }

  const handleDeleteAll = async () => {
    await deleteAllProperties()
    setShowDeleteAll(false)
  }

  const getTotalArea = () => {
    return properties.reduce((sum, p) => sum + p.area, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold">Gestão de Propriedades</h2>
        <div className="flex gap-2">
          {properties.length > 0 && (
            <Button variant="destructive" onClick={() => setShowDeleteAll(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar Tudo
            </Button>
          )}
          <Button onClick={() => { resetForm(); setShowForm(!showForm) }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Propriedade
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Propriedades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Área Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalArea()} hectares</div>
          </CardContent>
        </Card>
      </div>

      <Modal 
        open={showForm} 
        onClose={resetForm} 
        title={editingId ? 'Editar Propriedade' : 'Adicionar Nova Propriedade'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Indicador de Auto-Save */}
          {editingId && (
            <div className="flex justify-end">
              <AutoSaveIndicator status={autoSaveStatus} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome da Propriedade</label>
              <Input
                placeholder="Ex: Fazenda São José"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Área (hectares)</label>
              <Input
                type="number"
                placeholder="150"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Localização</label>
              <Input
                placeholder="Ex: Rio Verde - GO"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Input
                placeholder="Descrição da propriedade"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="flex items-end gap-2 md:col-span-2 justify-end">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingId ? 'Salvar Alterações' : 'Adicionar Propriedade'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Lista de Propriedades */}
      <div className="grid gap-4 md:grid-cols-2">
        {properties.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProperty(property)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProperty(property.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {property.location}
              </div>
              <div className="text-sm">
                <span className="font-medium">{property.area}</span> hectares
              </div>
              {property.description && (
                <div className="text-sm text-gray-600">
                  {property.description}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={showDeleteAll} onClose={() => setShowDeleteAll(false)} title="Deletar Todas as Propriedades" size="md">
        <div className="space-y-4">
          <p className="text-sm">
            Tem certeza que deseja excluir <strong>todas as {properties.length} propriedades</strong>? 
            Esta ação não pode ser desfeita e todas as propriedades serão removidas permanentemente da sua conta.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Todas as propriedades serão removidas do sistema local e sincronizadas com o servidor.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteAll(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteAll}>
              Confirmar Deleção
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

