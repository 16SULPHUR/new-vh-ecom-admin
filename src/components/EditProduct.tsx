'use client'

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ProductForm } from './productForm'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Category, Product } from './Products'


export function EditProduct() {
    const { id } = useParams<{ id: string }>()
    const [product, setProduct] = useState<Product | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const { toast } = useToast()
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchProduct() {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                toast({
                    title: "Error fetching product",
                    description: error.message,
                    variant: "destructive",
                })
            } else {
                setProduct({
                    ...data,
                    category_id: data.category_id || 0,
                    name: data.name || '',
                    description: data.description || '',
                    price: data.price || 0,
                    sku: data.sku || '',
                    pattern: data.pattern || '',
                    occasion: data.occasion || '',
                    fabric: data.fabric || '',
                    net_quantity: data.net_quantity || 1,
                    wash_care_instruction: data.wash_care_instruction || '',
                    dimensions: data.dimensions || '',
                    shipping_duration: data.shipping_duration || 2,
                })
            }
        }
        fetchProduct()
        fetchCategories()
    }, [id])

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


    async function updateProduct(updatedProduct: Partial<Product>) {
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
            toast({
                title: "Product updated",
                description: "The product has been updated successfully.",
            })
            navigate('/products') // Navigate back to products list
        }
    }

    if (!product) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h2 className="text-2xl font-bold">Edit Product</h2>
            <ProductForm
                mode="edit"
                product={product}
                categories={categories}
                onProductChange={(field, value) => setProduct({ ...product, [field]: value })}
            />
            <Button onClick={() => updateProduct(product)}>Save Changes</Button>
        </div>
    )
}
