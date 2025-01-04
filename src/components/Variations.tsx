'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'

type Variation = Database['public']['Tables']['variations']['Row']
type Product = Database['public']['Tables']['products']['Row']

interface VariationWithProduct extends Variation {
  product: Product | null
}

export function Variations() {
  const [variations, setVariations] = useState<VariationWithProduct[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [newVariation, setNewVariation] = useState<Omit<Variation, 'id' | 'created_at'>>({
    product_id: 0,
    color: '',
    size: '',
    stock: 0,
  })
  const [editingVariation, setEditingVariation] = useState<VariationWithProduct | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchVariations()
    fetchProducts()
  }, [])

  async function fetchVariations() {
    const { data, error } = await supabase
      .from('variations')
      .select(`
        *,
        product:product_id(
          id,
          name
        )
      `)
      .order('id')
    
    if (error) {
      toast({
        title: "Error fetching variations",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setVariations(data || [])
    }
  }

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')
    
    if (error) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setProducts(data || [])
    }
  }

  async function createVariation() {
    const { data, error } = await supabase
      .from('variations')
      .insert([newVariation])
      .select()

    if (error) {
      toast({
        title: "Error creating variation",
        description: error.message,
        variant: "destructive",
      })
    } else {
      await fetchVariations()
      setNewVariation({
        product_id: 0,
        color: '',
        size: '',
        stock: 0,
      })
      toast({
        title: "Variation created",
        description: "The new variation has been added successfully.",
      })
    }
  }

  async function updateVariation(id: number, variation: VariationWithProduct) {
    const { id: _, product, created_at, ...updateData } = variation
    
    const { error } = await supabase
      .from('variations')
      .update(updateData)
      .eq('id', id)

    if (error) {
      toast({
        title: "Error updating variation",
        description: error.message,
        variant: "destructive",
      })
    } else {
      await fetchVariations()
      setEditingVariation(null)
      toast({
        title: "Variation updated",
        description: "The variation has been updated successfully.",
      })
    }
  }

  async function deleteVariation(id: number) {
    const { error } = await supabase
      .from('variations')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: "Error deleting variation",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setVariations(variations.filter(v => v.id !== id))
      toast({
        title: "Variation deleted",
        description: "The variation has been deleted successfully.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Variations</h2>
      <div className="grid grid-cols-2 gap-4">
        <Select
          value={newVariation.product_id ? newVariation.product_id.toString() : ""}
          onValueChange={(value) => setNewVariation({ ...newVariation, product_id: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Color"
          value={newVariation.color || ''}
          onChange={(e) => setNewVariation({ ...newVariation, color: e.target.value })}
        />
        <Input
          placeholder="Size"
          value={newVariation.size || ''}
          onChange={(e) => setNewVariation({ ...newVariation, size: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Stock"
          value={newVariation.stock}
          onChange={(e) => setNewVariation({ ...newVariation, stock: parseInt(e.target.value) })}
        />
      </div>
      <Button onClick={createVariation}>Add Variation</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variations.map((variation) => (
            <TableRow key={variation.id}>
              <TableCell>{variation.product?.name || 'N/A'}</TableCell>
              <TableCell>{variation.color || 'N/A'}</TableCell>
              <TableCell>{variation.size || 'N/A'}</TableCell>
              <TableCell>{variation.stock}</TableCell>
              <TableCell>
                <Button onClick={() => setEditingVariation(variation)}>Edit</Button>
                <Button variant="destructive" onClick={() => deleteVariation(variation.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingVariation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className=" bg-primary-foreground p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-bold">Edit Variation</h3>
            <Select
              value={editingVariation.product_id.toString()}
              onValueChange={(value) => setEditingVariation({ ...editingVariation, product_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Color"
              value={editingVariation.color || ''}
              onChange={(e) => setEditingVariation({ ...editingVariation, color: e.target.value })}
            />
            <Input
              placeholder="Size"
              value={editingVariation.size || ''}
              onChange={(e) => setEditingVariation({ ...editingVariation, size: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Stock"
              value={editingVariation.stock}
              onChange={(e) => setEditingVariation({ ...editingVariation, stock: parseInt(e.target.value) })}
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setEditingVariation(null)}>Cancel</Button>
              <Button onClick={() => updateVariation(editingVariation.id, editingVariation)}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}