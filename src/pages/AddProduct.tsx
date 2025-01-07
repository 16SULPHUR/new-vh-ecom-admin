'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProductForm } from '@/components/productForm'

type Product = {
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
};

type Category = {
    id: number;
    name: string;
};

export function AddProducts() {
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
        <div>
            <ProductForm
                mode="create"
                product={newProduct as Product}
                categories={categories}
                onProductChange={(field, value) => setNewProduct({ ...newProduct, [field]: value })}
            />
            <Button onClick={createProduct}>Add Product</Button>
        </div>

    )
}
