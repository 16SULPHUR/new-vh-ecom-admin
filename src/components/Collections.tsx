'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

interface Collection {
  id: number
  collection_name: string
  created_at: string
}

interface Product {
  id: number
  sku:string
}

interface CollectionWithProducts extends Collection {
  collection_products: {
    product_id: number
  }[]
}

export function Collections() {
  const [collections, setCollections] = useState<CollectionWithProducts[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [newCollection, setNewCollection] = useState('')
  const [editingCollection, setEditingCollection] = useState<CollectionWithProducts | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchCollections()
    fetchProducts()
  }, [])

  async function fetchCollections() {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        collection_products (
          product_id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: "Error fetching collections",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setCollections(data || [])
    }
  }

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('id, sku')
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

  async function createCollection() {
    if (!newCollection.trim()) {
      toast({
        title: "Error",
        description: "Collection name is required",
        variant: "destructive",
      })
      return
    }

    // Create collection
    const { data: collectionData, error: collectionError } = await supabase
      .from('collections')
      .insert([{ collection_name: newCollection }])
      .select()

    if (collectionError) {
      toast({
        title: "Error creating collection",
        description: collectionError.message,
        variant: "destructive",
      })
      return
    }

    // Insert product associations if any products are selected
    if (selectedProducts.length > 0 && collectionData?.[0]?.id) {
      const productAssociations = selectedProducts.map(productId => ({
        collection_id: collectionData[0].id,
        product_id: productId
      }))

      const { error: associationError } = await supabase
        .from('collection_products')
        .insert(productAssociations)

      if (associationError) {
        toast({
          title: "Error adding products to collection",
          description: associationError.message,
          variant: "destructive",
        })
      }
    }

    setNewCollection('')
    setSelectedProducts([])
    await fetchCollections()
    
    toast({
      title: "Success",
      description: "Collection created successfully",
    })
  }

  async function updateCollection(collection: CollectionWithProducts) {
    // Update collection name
    const { error: updateError } = await supabase
      .from('collections')
      .update({ collection_name: collection.collection_name })
      .eq('id', collection.id)

    if (updateError) {
      toast({
        title: "Error updating collection",
        description: updateError.message,
        variant: "destructive",
      })
      return
    }

    // Delete existing product associations
    const { error: deleteError } = await supabase
      .from('collection_products')
      .delete()
      .eq('collection_id', collection.id)

    if (deleteError) {
      toast({
        title: "Error updating product associations",
        description: deleteError.message,
        variant: "destructive",
      })
      return
    }

    // Add new product associations
    if (selectedProducts.length > 0) {
      const productAssociations = selectedProducts.map(productId => ({
        collection_id: collection.id,
        product_id: productId
      }))

      const { error: insertError } = await supabase
        .from('collection_products')
        .insert(productAssociations)

      if (insertError) {
        toast({
          title: "Error updating product associations",
          description: insertError.message,
          variant: "destructive",
        })
        return
      }
    }

    setEditingCollection(null)
    setSelectedProducts([])
    await fetchCollections()
    
    toast({
      title: "Success",
      description: "Collection updated successfully",
    })
  }

  async function deleteCollection(id: number) {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: "Error deleting collection",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setCollections(collections.filter(c => c.id !== id))
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      })
    }
  }

  function startEditing(collection: CollectionWithProducts) {
    setEditingCollection(collection)
    setSelectedProducts(collection.collection_products.map(cp => cp.product_id))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Collections</h2>
      
      {/* Create new collection form */}
      <div className="space-y-4">
        <Input
          placeholder="Collection Name"
          value={newCollection}
          onChange={(e) => setNewCollection(e.target.value)}
        />
        <div className="space-y-2">
          <h3 className="font-medium">Select Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {products.map((product) => (
              <div key={product.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`new-product-${product.id}`}
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedProducts([...selectedProducts, product.id])
                    } else {
                      setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                    }
                  }}
                />
                <label htmlFor={`new-product-${product.id}`}>{product.sku}</label>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={createCollection}>Create Collection</Button>
      </div>

      {/* Collections table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Collection Name</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell>{collection.collection_name}</TableCell>
              <TableCell>
                {collection.collection_products.length} products
              </TableCell>
              <TableCell>{new Date(collection.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="space-x-2">
                <Button onClick={() => startEditing(collection)}>Edit</Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteCollection(collection.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit collection modal */}
      {editingCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-primary-foreground p-6 rounded-lg space-y-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Edit Collection</h3>
            <Input
              value={editingCollection.collection_name}
              onChange={(e) => setEditingCollection({
                ...editingCollection,
                collection_name: e.target.value
              })}
            />
            <div className="space-y-2">
              <h4 className="font-medium">Select Products</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-product-${product.id}`}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProducts([...selectedProducts, product.id])
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                        }
                      }}
                    />
                    <label htmlFor={`edit-product-${product.id}`}>{product.sku}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => {
                setEditingCollection(null)
                setSelectedProducts([])
              }}>
                Cancel
              </Button>
              <Button onClick={() => updateCollection(editingCollection)}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}