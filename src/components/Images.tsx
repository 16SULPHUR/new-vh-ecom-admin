'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Database } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'

type Image = Database['public']['Tables']['images']['Row']
type Product = Database['public']['Tables']['products']['Row']
type Variation = Database['public']['Tables']['variations']['Row']

interface ImageWithRelations extends Image {
  product?: Product
  variation?: Variation
}

export function Images() {
  const [images, setImages] = useState<ImageWithRelations[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [variations, setVariations] = useState<Variation[]>([])
  const [newImage, setNewImage] = useState<Omit<Image, 'id' | 'created_at'>>({
    product_id: null,
    variation_id: null,
    url: '',
    is_primary: false,
  })
  const [editingImage, setEditingImage] = useState<ImageWithRelations | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchImages()
    fetchProducts()
    fetchVariations()
  }, [])

  async function fetchImages() {
    // Fetch images and their related data separately to avoid schema cache issues
    const { data: imageData, error: imageError } = await supabase
      .from('images')
      .select('*')
      .order('id')
    
    if (imageError) {
      toast({
        title: "Error fetching images",
        description: imageError.message,
        variant: "destructive",
      })
      return
    }

    // If we have images, fetch their related product and variation data
    const imagesWithRelations: ImageWithRelations[] = await Promise.all(
      imageData.map(async (image) => {
        const relations: Partial<ImageWithRelations> = { ...image }

        if (image.product_id) {
          const { data: productData } = await supabase
            .from('products')
            .select('*')
            .eq('id', image.product_id)
            .single()
          relations.product = productData
        }

        if (image.variation_id) {
          const { data: variationData } = await supabase
            .from('variations')
            .select('*')
            .eq('id', image.variation_id)
            .single()
          relations.variation = variationData
        }

        return relations as ImageWithRelations
      })
    )

    setImages(imagesWithRelations)
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
      setProducts(data)
    }
  }

  async function fetchVariations() {
    const { data, error } = await supabase
      .from('variations')
      .select('*')
      .order('id')
    
    if (error) {
      toast({
        title: "Error fetching variations",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setVariations(data)
    }
  }

  async function createImage() {
    const { data, error } = await supabase
      .from('images')
      .insert(newImage)
      .select()

    if (error) {
      toast({
        title: "Error creating image",
        description: error.message,
        variant: "destructive",
      })
    } else {
      // Refresh images to get the updated data with relations
      await fetchImages()
      setNewImage({
        product_id: null,
        variation_id: null,
        url: '',
        is_primary: false,
      })
      toast({
        title: "Image created",
        description: "The new image has been added successfully.",
      })
    }
  }

  async function updateImage(id: number, updatedImage: Partial<ImageWithRelations>) {
    // Remove relation fields before updating
    const { id: _, product, variation, created_at, ...updateData } = updatedImage
    
    const { error } = await supabase
      .from('images')
      .update(updateData)
      .eq('id', id)

    if (error) {
      toast({
        title: "Error updating image",
        description: error.message,
        variant: "destructive",
      })
    } else {
      // Refresh images to get the updated data with relations
      await fetchImages()
      setEditingImage(null)
      toast({
        title: "Image updated",
        description: "The image has been updated successfully.",
      })
    }
  }

  async function deleteImage(id: number) {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: "Error deleting image",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setImages(images.filter(img => img.id !== id))
      toast({
        title: "Image deleted",
        description: "The image has been deleted successfully.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Images</h2>
      <div className="grid grid-cols-2 gap-4">
        <Select
          value={newImage.product_id?.toString() || 'none'}
          onValueChange={(value) => setNewImage({ ...newImage, product_id: value === 'none' ? null : parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={newImage.variation_id?.toString() || 'none'}
          onValueChange={(value) => setNewImage({ ...newImage, variation_id: value === 'none' ? null : parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select variation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {variations.map((variation) => (
              <SelectItem key={variation.id} value={variation.id.toString()}>
                {`${variation.color || ''} ${variation.size || ''}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Image URL"
          value={newImage.url}
          onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_primary"
            checked={newImage.is_primary}
            onCheckedChange={(checked) => setNewImage({ ...newImage, is_primary: checked as boolean })}
          />
          <label htmlFor="is_primary">Is Primary</label>
        </div>
      </div>
      <Button onClick={createImage}>Add Image</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Variation</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Is Primary</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image) => (
            <TableRow key={image.id}>
              <TableCell>{image.product?.name || 'N/A'}</TableCell>
              <TableCell>
                {image.variation ? `${image.variation.color || ''} ${image.variation.size || ''}` : 'N/A'}
              </TableCell>
              <TableCell>{image.url}</TableCell>
              <TableCell>{image.is_primary ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button onClick={() => setEditingImage(image)}>Edit</Button>
                  <Button variant="destructive" onClick={() => deleteImage(image.id)}>Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-bold">Edit Image</h3>
            <Select
              value={editingImage.product_id?.toString() || 'none'}
              onValueChange={(value) => setEditingImage({ ...editingImage, product_id: value === 'none' ? null : parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={editingImage.variation_id?.toString() || 'none'}
              onValueChange={(value) => setEditingImage({ ...editingImage, variation_id: value === 'none' ? null : parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {variations.map((variation) => (
                  <SelectItem key={variation.id} value={variation.id.toString()}>
                    {`${variation.color || ''} ${variation.size || ''}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Image URL"
              value={editingImage.url}
              onChange={(e) => setEditingImage({ ...editingImage, url: e.target.value })}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_is_primary"
                checked={editingImage.is_primary}
                onCheckedChange={(checked) => setEditingImage({ ...editingImage, is_primary: checked as boolean })}
              />
              <label htmlFor="edit_is_primary">Is Primary</label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setEditingImage(null)}>Cancel</Button>
              <Button onClick={() => updateImage(editingImage.id, editingImage)}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}