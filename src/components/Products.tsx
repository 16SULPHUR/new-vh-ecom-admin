'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProductForm } from './productForm'
import { Link } from 'react-router-dom'

export type Product = {
  id: number;
  category_id: number;
  name: string;
  description: string | "";
  price: number;
  sku: string | null;
  pattern: string | null;
  occasion: string | null;
  fabric: string | null;
  net_quantity: number;
  wash_care_instruction: string | null;
  dimensions: string | null;
  created_at: string;
  categories?: { id: number; name: string };
  shipping_duration: number | 2
};

export type Category = {
  id: number;
  name: string;
};

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category_id: 0,
    name: '',
    description: '',
    price: 0,
    sku: '',
    pattern: '',
    occasion: '',
    fabric: '',
    net_quantity: 1,
    wash_care_instruction: '',
    dimensions: '',
    shipping_duration: 2
  })
  const { toast } = useToast()

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
        sku: '',
        pattern: '',
        occasion: '',
        fabric: '',
        net_quantity: 1,
        wash_care_instruction: '',
        dimensions: '',
        shipping_duration: 2
      })
      toast({
        title: "Product created",
        description: "The new product has been added successfully.",
      })
    }
  }

  async function updateProduct(id: number, updatedProduct: Partial<Product>) {
    const { id: _, categories, created_at, ...updateData } = updatedProduct
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

      <Button>
        <Link to={"/add-product"}>Add New Product</Link>
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Fabric</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.categories?.name || 'N/A'}</TableCell>
              <TableCell>{product.sku || 'N/A'}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.fabric || 'N/A'}</TableCell>
              <TableCell className="space-x-2">
                <Link to={`/edit-product/${product.id}`}>
                  <Button>Edit</Button>
                </Link>
                <Button variant="destructive" onClick={() => deleteProduct(product.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

