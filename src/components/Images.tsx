'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Database } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'

type Image = Database['public']['Tables']['images']['Row']
type Product = Database['public']['Tables']['products']['Row']
type Variation = Database['public']['Tables']['variations']['Row']

interface ImageWithRelations extends Image {
  product: Product | null
  variation: Variation | null
}

interface PreviewImage {
  file: File
  preview: string
}

export function Images() {
  const [images, setImages] = useState<ImageWithRelations[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [variations, setVariations] = useState<Variation[]>([])
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([])
  const [editingImage, setEditingImage] = useState<ImageWithRelations | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('null')
  const [selectedVariationId, setSelectedVariationId] = useState<string>('null')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const HOSTINGER_UPLOAD_URL = 'https://media.varietyheaven.in/upload.php'

  useEffect(() => {
    fetchImages()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedProductId && selectedProductId !== 'null') {
      fetchVariations(parseInt(selectedProductId))
    } else {
      setVariations([])
    }
  }, [selectedProductId])

  async function fetchImages() {
    const { data, error } = await supabase
      .from('images')
      .select(`
        *,
        product:products(*),
        variation:variations(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: "Error fetching images",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setImages(data)
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
      return
    }

    setProducts(data)
  }

  async function fetchVariations(productId: number) {
    if (isNaN(productId)) {
      console.error('Invalid product ID');
      setVariations([]);
      return;
    }

    const { data, error } = await supabase
      .from('variations')
      .select('*')
      .eq('product_id', productId)
      .order('created_at')

    if (error) {
      toast({
        title: "Error fetching variations",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setVariations(data)
  }

  async function uploadImages() {
    try {
      setUploading(true)

      if (!selectedProductId) {
        toast({
          title: "Error",
          description: "Please select a product first",
          variant: "destructive",
        })
        return
      }

      const uploadedImages = await Promise.all(
        previewImages.map(async (previewImage) => {
          const timestamp = Date.now()
          const safeName = previewImage.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const filename = `${timestamp}-${safeName}`

          const formData = new FormData()
          formData.append('file', previewImage.file)
          formData.append('filename', filename)

          const response = await axios.post(HOSTINGER_UPLOAD_URL, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).catch(error => {
            console.error('Upload error:', error.response?.data || error.message);
            throw new Error('Upload failed: ' + (error.response?.data?.message || error.message));
          });

          if (response && response.data && response.data.success) {
            return response.data.url;
          } else {
            throw new Error('Upload failed: ' + (response?.data?.message || 'Unknown error'));
          }
        })
      )

      const newImages = uploadedImages.map(url => ({
        product_id: selectedProductId ? parseInt(selectedProductId) : null,
        variation_id: selectedVariationId ? parseInt(selectedVariationId) : null,
        url,
        is_primary: false,
      }))

      const { data, error } = await supabase
        .from('images')
        .insert(newImages)
        .select()

      if (error) {
        throw error
      }

      await fetchImages()
      setPreviewImages([])
      setSelectedProductId('')
      setSelectedVariationId('')
      toast({
        title: "Success",
        description: "Images uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  async function updateImage(id: number, updatedImage: Partial<ImageWithRelations>) {
    const { product, variation, created_at, ...updateData } = updatedImage

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
      return
    }

    await fetchImages()
    setEditingImage(null)
    toast({
      title: "Success",
      description: "Image updated successfully",
    })
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
      return
    }

    setImages(images.filter(img => img.id !== id))
    toast({
      title: "Success",
      description: "Image deleted successfully",
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newPreviewImages = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          })
          return false
        }
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB`,
            variant: "destructive",
          })
          return false
        }
        return true
      }).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))

      setPreviewImages(prev => [...prev, ...newPreviewImages])
    }
  }

  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
  }

  const groupedImages = images.reduce((acc, image) => {
    const productId = image.product_id?.toString() || 'Unassigned'
    const variationId = image.variation_id?.toString() || 'No Variation'

    if (!acc[productId]) {
      acc[productId] = {}
    }
    if (!acc[productId][variationId]) {
      acc[productId][variationId] = []
    }
    acc[productId][variationId].push(image)
    return acc
  }, {} as Record<string, Record<string, ImageWithRelations[]>>)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Images</h2>
      <div className="grid grid-cols-2 gap-4">
        <Select
          value={selectedProductId}
          onValueChange={(value) => {
            if (value !== 'null') {
              setSelectedProductId(value)
              setSelectedVariationId('null')
              fetchVariations(parseInt(value))
            }
          }}
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

        <Select
          value={selectedVariationId}
          onValueChange={setSelectedVariationId}
          disabled={selectedProductId === 'null'}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select variation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">None</SelectItem>
            {variations.map((variation) => (
              <SelectItem key={variation.id} value={variation.id.toString()}>
                {`${variation.color || ''} ${variation.size || ''}`.trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="col-span-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedProductId}
            variant="secondary"
            className="w-full"
          >
            Select Images
          </Button>
        </div>

        {previewImages.map((image, index) => (
          <div key={index} className="col-span-2 flex items-center space-x-2">
            <img src={image.preview} alt="Preview" className="w-20 h-20 object-cover" />
            <Input value={image.file.name} readOnly />
            <Button variant="destructive" onClick={() => removePreviewImage(index)}>Remove</Button>
          </div>
        ))}

        {previewImages.length > 0 && (
          <Button onClick={uploadImages} className="col-span-2" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Images'}
          </Button>
        )}
      </div>

      {Object.entries(groupedImages).map(([productId, variations]) => (
        <div key={productId} className="mt-8">
          <h3 className="text-xl font-bold mb-4">
            {productId === 'Unassigned' ? 'Unassigned' : products.find(p => p.id.toString() === productId)?.name}
          </h3>
          {Object.entries(variations).map(([variationId, images]) => (
            <div key={variationId} className="mb-4">
              <h4 className="text-lg font-semibold mb-2">
                {variationId === 'No Variation' ? 'No Variation' :
                  `${images[0].variation?.color || ''} ${images[0].variation?.size || ''}`.trim()}
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Is Primary</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {images.map((image) => (
                    <TableRow key={image.id}>
                      <TableCell>
                        <img src={image.url} alt="Product" className="w-20 h-20 object-cover" />
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
            </div>
          ))}
        </div>
      ))}

      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg space-y-4 max-w-md w-full">
            <h3 className="text-xl font-bold">Edit Image</h3>

            <Select
              value={editingImage.product_id?.toString() || 'null'}
              onValueChange={(value) => {
                setEditingImage(prev => ({
                  ...prev!,
                  product_id: value === 'null' ? null : parseInt(value),
                  variation_id: null
                }))
                if (value !== 'null') {
                  fetchVariations(parseInt(value))
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">None</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={editingImage.variation_id?.toString() || 'null'}
              onValueChange={(value) =>
                setEditingImage(prev => ({
                  ...prev!,
                  variation_id: value === 'null' ? null : parseInt(value)
                }))
              }
              disabled={!editingImage.product_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">None</SelectItem>
                {variations.map((variation) => (
                  <SelectItem key={variation.id} value={variation.id.toString()}>
                    {`${variation.color || ''} ${variation.size || ''}`.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_is_primary"
                checked={editingImage.is_primary}
                onCheckedChange={(checked) =>
                  setEditingImage(prev => ({
                    ...prev!,
                    is_primary: checked as boolean
                  }))
                }
              />
              <label htmlFor="edit_is_primary">Is Primary</label>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingImage(null)}>
                Cancel
              </Button>
              <Button onClick={() => updateImage(editingImage.id, editingImage)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Images;

