'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'created_at'>>({
    category_id: 0,
    name: '',
    description: '',
    price: 0,
  })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name)')
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

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setCategories(data || [])
    }
  }

  async function createProduct() {
    const { data, error } = await supabase
      .from('products')
      .insert(newProduct)
      .select()

    if (error) {
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setProducts([...products, data[0]])
      setNewProduct({
        category_id: 0,
        name: '',
        description: '',
        price: 0,
      })
      toast({
        title: "Product created",
        description: "The new product has been added successfully.",
      })
    }
  }

  async function updateProduct(id: number, updatedProduct: Partial<Product>) {
    const { id: _, categories, ...updateData } = updatedProduct;
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)

    if (error) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setProducts(products.map(prod => prod.id === id ? { ...prod, ...updatedProduct } : prod))
      setEditingProduct(null)
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      })
    }
  }

  async function deleteProduct(id: number) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setProducts(products.filter(prod => prod.id !== id))
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Products</h2>
      <div className="grid grid-cols-2 gap-4">
        <Select
          value={newProduct.category_id.toString()}
          onValueChange={(value) => setNewProduct({ ...newProduct, category_id: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Product name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={newProduct.description || ''}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
        />
      </div>
      <Button onClick={createProduct}>Add Product</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.categories?.name || 'N/A'}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>
                <Button onClick={() => setEditingProduct(product)}>Edit</Button>
                <Button variant="destructive" onClick={() => deleteProduct(product.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-primary-foreground p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-bold">Edit Product</h3>
            <Select
              value={editingProduct.category_id.toString()}
              onValueChange={(value) => setEditingProduct({ ...editingProduct, category_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Product name"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={editingProduct.description || ''}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Price"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button onClick={() => updateProduct(editingProduct.id, editingProduct)}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

