'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Calendar, DollarSign } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { useData, CropCycle } from '@/contexts/data-context'

export function CropPlanning() {
  const { crops, addCrop } = useData()

  const [showForm, setShowForm] = useState(false)
  const [newCrop, setNewCrop] = useState({
    cropType: '',
    area: '',
    plantingDate: '',
    estimatedCost: '',
    estimatedRevenue: ''
  })

  const handleAddCrop = () => {
    if (newCrop.cropType && newCrop.area && newCrop.plantingDate) {
      addCrop({
        cropType: newCrop.cropType,
        area: Number(newCrop.area),
        plantingDate: newCrop.plantingDate,
        estimatedCost: Number(newCrop.estimatedCost),
        estimatedRevenue: Number(newCrop.estimatedRevenue),
        status: 'planning'
      })
      setNewCrop({
        cropType: '',
        area: '',
        plantingDate: '',
        estimatedCost: '',
        estimatedRevenue: ''
      })
      setShowForm(false)
    }
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
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Safra
        </Button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Adicionar Nova Safra" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo de Cultura</label>
                <Input
                  placeholder="Ex: Soja, Milho, Feijão"
                  value={newCrop.cropType}
                  onChange={(e) => setNewCrop({...newCrop, cropType: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Área (hectares)</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={newCrop.area}
                  onChange={(e) => setNewCrop({...newCrop, area: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data de Plantio</label>
                <Input
                  type="date"
                  value={newCrop.plantingDate}
                  onChange={(e) => setNewCrop({...newCrop, plantingDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Custo Estimado (R$)</label>
                <Input
                  type="number"
                  placeholder="25000"
                  value={newCrop.estimatedCost}
                  onChange={(e) => setNewCrop({...newCrop, estimatedCost: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Receita Estimada (R$)</label>
                <Input
                  type="number"
                  placeholder="45000"
                  value={newCrop.estimatedRevenue}
                  onChange={(e) => setNewCrop({...newCrop, estimatedRevenue: e.target.value})}
                />
              </div>
              <div className="flex items-end gap-2 md:col-span-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCrop}>
                  Adicionar Safra
                </Button>
              </div>
        </div>
      </Modal>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {crops.map((crop) => (
          <Card key={crop.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{crop.cropType}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
                  {getStatusText(crop.status)}
                </span>
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
    </div>
  )
}
