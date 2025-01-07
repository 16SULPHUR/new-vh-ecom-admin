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
type Color = { name: string; hex_code: string } // Assuming the colors table has these columns.

interface VariationWithProduct extends Variation {
  product: Product | null
}

export function Variations() {
  const [variations, setVariations] = useState<VariationWithProduct[]>([])
  const [sizes, setSizes] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([])
  const [colors, setColors] = useState<Color[]>([]) // State for colors
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
    fetchColors() // Fetch colors on load
    fetchSizes()
  }, [])

  async function fetchSizes() {
    const { data, error } = await supabase
      .from('sizes')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error fetching sizes",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSizes(data?.map(size => size.name) || []);
    }
  }

  async function fetchVariations() {
    const { data, error } = await supabase
      .from('variations')
      .select(`
        *,
        product:product_id(
          id,
          name,
          sku
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

  async function fetchColors() {
    const { data, error } = await supabase
      .from('colors')
      .select('*')
      .order('name')

    if (error) {
      toast({
        title: "Error fetching colors",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setColors(data || [])
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
                {product.sku}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => setNewVariation({ ...newVariation, color: value })}
          value={newVariation.color || ""}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Color" />
          </SelectTrigger>
          <SelectContent>
            {colors.map((color) => (
              <SelectItem key={color.name} value={color.name}>
                {color.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => setNewVariation({ ...newVariation, size: value })}
          value={newVariation.size || ""}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Size" />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <TableCell>{variation.product?.sku || 'N/A'}</TableCell>
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
    </div>
  )
}
