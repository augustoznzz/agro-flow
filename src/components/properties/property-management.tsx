'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react'

interface Property {
  id: string
  name: string
  area: number
  location: string
  description?: string
}

export function PropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      name: 'Fazenda São José',
      area: 150,
      location: 'Rio Verde - GO',
      description: 'Propriedade principal para cultivo de soja e milho'
    },
    {
      id: '2',
      name: 'Sítio Boa Vista',
      area: 45,
      location: 'Chapadão do Céu - GO',
      description: 'Pequena propriedade para horticultura'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [newProperty, setNewProperty] = useState({
    name: '',
    area: '',
    location: '',
    description: ''
  })

  const handleAddProperty = () => {
    if (newProperty.name && newProperty.area && newProperty.location) {
      const property: Property = {
        id: Date.now().toString(),
        name: newProperty.name,
        area: Number(newProperty.area),
        location: newProperty.location,
        description: newProperty.description
      }
      setProperties([...properties, property])
      setNewProperty({
        name: '',
        area: '',
        location: '',
        description: ''
      })
      setShowForm(false)
    }
  }

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property)
    setNewProperty({
      name: property.name,
      area: property.area.toString(),
      location: property.location,
      description: property.description || ''
    })
    setShowForm(true)
  }

  const handleUpdateProperty = () => {
    if (editingProperty && newProperty.name && newProperty.area && newProperty.location) {
      setProperties(properties.map(p => 
        p.id === editingProperty.id 
          ? {
              ...p,
              name: newProperty.name,
              area: Number(newProperty.area),
              location: newProperty.location,
              description: newProperty.description
            }
          : p
      ))
      setEditingProperty(null)
      setNewProperty({
        name: '',
        area: '',
        location: '',
        description: ''
      })
      setShowForm(false)
    }
  }

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id))
  }

  const getTotalArea = () => {
    return properties.reduce((sum, p) => sum + p.area, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Propriedades</h2>
        <Button onClick={() => {
          setEditingProperty(null)
          setNewProperty({
            name: '',
            area: '',
            location: '',
            description: ''
          })
          setShowForm(!showForm)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Propriedade
        </Button>
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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProperty ? 'Editar Propriedade' : 'Adicionar Nova Propriedade'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome da Propriedade</label>
                <Input
                  placeholder="Ex: Fazenda São José"
                  value={newProperty.name}
                  onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Área (hectares)</label>
                <Input
                  type="number"
                  placeholder="150"
                  value={newProperty.area}
                  onChange={(e) => setNewProperty({...newProperty, area: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Localização</label>
                <Input
                  placeholder="Ex: Rio Verde - GO"
                  value={newProperty.location}
                  onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição (opcional)</label>
                <Input
                  placeholder="Descrição da propriedade"
                  value={newProperty.description}
                  onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                />
              </div>
              <div className="flex items-end space-x-2 md:col-span-2">
                <Button 
                  onClick={editingProperty ? handleUpdateProperty : handleAddProperty} 
                  className="flex-1"
                >
                  {editingProperty ? 'Atualizar' : 'Adicionar'} Propriedade
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false)
                    setEditingProperty(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  )
}
