'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Calendar, DollarSign, Pencil, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator'
import { useData, CropCycle } from '@/contexts/data-context'
import { useAutoSave } from '@/hooks/use-auto-save'

export function CropPlanningAuto() {
  const { crops, addCrop, updateCrop, deleteCrop, deleteAllCrops } = useData()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    cropType: '',
    area: '',
    plantingDate: '',
    estimatedCost: '',
    estimatedRevenue: '',
    status: 'planning' as 'planning' | 'planted' | 'harvested'
  })

  const [showDelete, setShowDelete] = useState(false)
  const [deletingCrop, setDeletingCrop] = useState<CropCycle | null>(null)
  const [showDeleteAll, setShowDeleteAll] = useState(false)

  // Auto-save quando editando
  const { status: autoSaveStatus } = useAutoSave({
    data: formData,
    onSave: (data) => {
      if (editingId && data.cropType && data.area && data.plantingDate) {
        updateCrop(editingId, {
          cropType: data.cropType,
          area: Number(data.area),
          plantingDate: data.plantingDate,
          estimatedCost: Number(data.estimatedCost),
          estimatedRevenue: Number(data.estimatedRevenue),
          status: data.status
        })
      }
    },
    delay: 800,
    enabled: editingId !== null
  })

  const handleSave = () => {
    if (formData.cropType && formData.area && formData.plantingDate) {
      if (editingId) {
        updateCrop(editingId, {
          cropType: formData.cropType,
          area: Number(formData.area),
          plantingDate: formData.plantingDate,
          estimatedCost: Number(formData.estimatedCost),
          estimatedRevenue: Number(formData.estimatedRevenue),
          status: formData.status
        })
      } else {
        addCrop({
          cropType: formData.cropType,
          area: Number(formData.area),
          plantingDate: formData.plantingDate,
          estimatedCost: Number(formData.estimatedCost),
          estimatedRevenue: Number(formData.estimatedRevenue),
          status: formData.status
        })
      }
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      cropType: '',
      area: '',
      plantingDate: '',
      estimatedCost: '',
      estimatedRevenue: '',
      status: 'planning'
    })
    setEditingId(null)
    setShowForm(false)
  }

  const openEdit = (crop: CropCycle) => {
    setEditingId(crop.id)
    setFormData({
      cropType: crop.cropType,
      area: String(crop.area ?? ''),
      plantingDate: crop.plantingDate ?? '',
      estimatedCost: String(crop.estimatedCost ?? ''),
      estimatedRevenue: String(crop.estimatedRevenue ?? ''),
      status: crop.status
    })
    setShowForm(true)
  }

  const confirmDelete = (crop: CropCycle) => {
    setDeletingCrop(crop)
    setShowDelete(true)
  }

  const handleDeleteCrop = () => {
    if (!deletingCrop) return
    deleteCrop(deletingCrop.id)
    setShowDelete(false)
    setDeletingCrop(null)
  }

  const handleDeleteAll = async () => {
    await deleteAllCrops()
    setShowDeleteAll(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'planted':
        return 'bg-blue-100 text-blue-800'
      case 'harvested':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning':
        return 'Planejamento'
      case 'planted':
        return 'Plantado'
      case 'harvested':
        return 'Colhido'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Planejamento de Safra</h2>
        <div className="flex gap-2">
          {crops.length > 0 && (
            <Button variant="destructive" onClick={() => setShowDeleteAll(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar Tudo
            </Button>
          )}
          <Button onClick={() => { resetForm(); setShowForm(!showForm) }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Safra
          </Button>
        </div>
      </div>

      <Modal 
        open={showForm} 
        onClose={resetForm} 
        title={editingId ? 'Editar Safra' : 'Adicionar Nova Safra'} 
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
              <label className="text-sm font-medium">Tipo de Cultura</label>
              <Input
                placeholder="Ex: Soja, Milho, Feijão"
                value={formData.cropType}
                onChange={(e) => setFormData({...formData, cropType: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Área (hectares)</label>
              <Input
                type="number"
                placeholder="50"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Plantio</label>
              <Input
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData({...formData, plantingDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'planning' | 'planted' | 'harvested'})}
              >
                <option value="planning">Planejamento</option>
                <option value="planted">Plantado</option>
                <option value="harvested">Colhido</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Custo Estimado (R$)</label>
              <Input
                type="number"
                placeholder="25000"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Receita Estimada (R$)</label>
              <Input
                type="number"
                placeholder="45000"
                value={formData.estimatedRevenue}
                onChange={(e) => setFormData({...formData, estimatedRevenue: e.target.value})}
              />
            </div>
            <div className="flex items-end gap-2 md:col-span-2 justify-end">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingId ? 'Salvar Alterações' : 'Adicionar Safra'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {crops.map((crop) => (
          <Card key={crop.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{crop.cropType}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
                    {getStatusText(crop.status)}
                  </span>
                  <Button variant="ghost" size="icon" aria-label="Editar safra" onClick={() => openEdit(crop)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" aria-label="Excluir safra" onClick={() => confirmDelete(crop)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Plantio: {new Date(crop.plantingDate).toLocaleDateString('pt-BR')}
              </div>
              <div className="text-sm">
                <span className="font-medium">{crop.area}</span> hectares
              </div>
              <div className="flex items-center text-sm text-green-600">
                <DollarSign className="h-4 w-4 mr-2" />
                Custo: R$ {crop.estimatedCost.toLocaleString('pt-BR')}
              </div>
              <div className="flex items-center text-sm text-blue-600">
                <DollarSign className="h-4 w-4 mr-2" />
                Receita: R$ {crop.estimatedRevenue.toLocaleString('pt-BR')}
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Margem:</span>
                  <span className={`font-medium ${
                    crop.estimatedRevenue - crop.estimatedCost > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    R$ {(crop.estimatedRevenue - crop.estimatedCost).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Excluir Safra" size="md">
        <div className="space-y-4">
          <p className="text-sm">
            Tem certeza que deseja excluir a safra
            {deletingCrop ? ` "${deletingCrop.cropType}"` : ''}? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteCrop}>Excluir</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showDeleteAll} onClose={() => setShowDeleteAll(false)} title="Deletar Todas as Safras" size="md">
        <div className="space-y-4">
          <p className="text-sm">
            Tem certeza que deseja excluir <strong>todas as {crops.length} safras</strong>? 
            Esta ação não pode ser desfeita e todas as safras serão removidas permanentemente da sua conta.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Todas as safras serão removidas do sistema local e sincronizadas com o servidor.
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

