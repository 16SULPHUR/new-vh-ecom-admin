// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import { supabase } from '@/lib/supabase'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Database } from '@/lib/database.types'
// import { useToast } from '@/hooks/use-toast'
// import axios from 'axios'

// type Image = Database['public']['Tables']['images']['Row']
// type Product = Database['public']['Tables']['products']['Row']
// type Variation = Database['public']['Tables']['variations']['Row']

// interface ImageWithRelations extends Image {
//   product: Product | null
//   variation: Variation | null
// }

// interface PreviewImage {
//   file: File
//   preview: string
// }

// export function Images() {
//   const [images, setImages] = useState<ImageWithRelations[]>([])
//   const [products, setProducts] = useState<Product[]>([])
//   const [variations, setVariations] = useState<Variation[]>([])
//   const [previewImages, setPreviewImages] = useState<PreviewImage[]>([])
//   const [editingImage, setEditingImage] = useState<ImageWithRelations | null>(null)
//   const [uploading, setUploading] = useState(false)
//   const [selectedProductId, setSelectedProductId] = useState<string>('null')
//   const [selectedVariationId, setSelectedVariationId] = useState<string>('null')
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const { toast } = useToast()

//   const HOSTINGER_UPLOAD_URL = 'https://media.varietyheaven.in/upload.php'

//   useEffect(() => {
//     fetchImages()
//     fetchProducts()
//   }, [])

//   useEffect(() => {
//     if (selectedProductId && selectedProductId !== 'null') {
//       fetchVariations(parseInt(selectedProductId))
//     } else {
//       setVariations([])
//     }
//   }, [selectedProductId])

//   async function fetchImages() {
//     const { data, error } = await supabase
//       .from('images')
//       .select(`
//         *,
//         product:products(*),
//         variation:variations(*)
//       `)
//       .order('created_at', { ascending: false })

//     if (error) {
//       toast({
//         title: "Error fetching images",
//         description: error.message,
//         variant: "destructive",
//       })
//       return
//     }

//     setImages(data)
//   }

//   async function fetchProducts() {
//     const { data, error } = await supabase
//       .from('products')
//       .select('*')
//       .order('name')

//     if (error) {
//       toast({
//         title: "Error fetching products",
//         description: error.message,
//         variant: "destructive",
//       })
//       return
//     }

//     setProducts(data)
//   }

//   async function fetchVariations(productId: number) {
//     if (isNaN(productId)) {
//       console.error('Invalid product ID');
//       setVariations([]);
//       return;
//     }

//     const { data, error } = await supabase
//       .from('variations')
//       .select('*')
//       .eq('product_id', productId)
//       .order('created_at')

//     if (error) {
//       toast({
//         title: "Error fetching variations",
//         description: error.message,
//         variant: "destructive",
//       })
//       return
//     }

//     setVariations(data)
//   }

//   async function uploadImages() {
//     try {
//       setUploading(true)

//       if (!selectedProductId) {
//         toast({
//           title: "Error",
//           description: "Please select a product first",
//           variant: "destructive",
//         })
//         return
//       }

//       const uploadedImages = await Promise.all(
//         previewImages.map(async (previewImage) => {
//           const timestamp = Date.now()
//           const safeName = previewImage.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
//           const filename = `${timestamp}-${safeName}`

//           const formData = new FormData()
//           formData.append('file', previewImage.file)
//           formData.append('filename', filename)

//           const response = await axios.post(HOSTINGER_UPLOAD_URL, formData, {
//             headers: {
//               'Content-Type': 'multipart/form-data'
//             }
//           }).catch(error => {
//             console.error('Upload error:', error.response?.data || error.message);
//             throw new Error('Upload failed: ' + (error.response?.data?.message || error.message));
//           });

//           if (response && response.data && response.data.success) {
//             return response.data.url;
//           } else {
//             throw new Error('Upload failed: ' + (response?.data?.message || 'Unknown error'));
//           }
//         })
//       )

//       const newImages = uploadedImages.map(url => ({
//         product_id: selectedProductId ? parseInt(selectedProductId) : null,
//         variation_id: selectedVariationId ? parseInt(selectedVariationId) : null,
//         url,
//         is_primary: false,
//       }))

//       const { data, error } = await supabase
//         .from('images')
//         .insert(newImages)
//         .select()

//       if (error) {
//         throw error
//       }

//       await fetchImages()
//       setPreviewImages([])
//       setSelectedProductId('')
//       setSelectedVariationId('')
//       toast({
//         title: "Success",
//         description: "Images uploaded successfully",
//       })
//     } catch (error) {
//       toast({
//         title: "Upload failed",
//         description: error instanceof Error ? error.message : "Failed to upload files",
//         variant: "destructive",
//       })
//     } finally {
//       setUploading(false)
//     }
//   }

//   async function updateImage(id: number, updatedImage: Partial<ImageWithRelations>) {
//     const { product, variation, created_at, ...updateData } = updatedImage

//     const { error } = await supabase
//       .from('images')
//       .update(updateData)
//       .eq('id', id)

//     if (error) {
//       toast({
//         title: "Error updating image",
//         description: error.message,
//         variant: "destructive",
//       })
//       return
//     }

//     await fetchImages()
//     setEditingImage(null)
//     toast({
//       title: "Success",
//       description: "Image updated successfully",
//     })
//   }

//   async function deleteImage(id: number) {
//     const { error } = await supabase
//       .from('images')
//       .delete()
//       .eq('id', id)

//     if (error) {
//       toast({
//         title: "Error deleting image",
//         description: error.message,
//         variant: "destructive",
//       })
//       return
//     }

//     setImages(images.filter(img => img.id !== id))
//     toast({
//       title: "Success",
//       description: "Image deleted successfully",
//     })
//   }

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files
//     if (files && files.length > 0) {
//       const newPreviewImages = Array.from(files).filter(file => {
//         if (!file.type.startsWith('image/')) {
//           toast({
//             title: "Invalid file type",
//             description: `${file.name} is not an image file`,
//             variant: "destructive",
//           })
//           return false
//         }
//         const maxSize = 5 * 1024 * 1024
//         if (file.size > maxSize) {
//           toast({
//             title: "File too large",
//             description: `${file.name} is larger than 5MB`,
//             variant: "destructive",
//           })
//           return false
//         }
//         return true
//       }).map(file => ({
//         file,
//         preview: URL.createObjectURL(file)
//       }))

//       setPreviewImages(prev => [...prev, ...newPreviewImages])
//     }
//   }

//   const removePreviewImage = (index: number) => {
//     setPreviewImages(prev => prev.filter((_, i) => i !== index))
//   }

//   const groupedImages = images.reduce((acc, image) => {
//     const productId = image.product_id?.toString() || 'Unassigned'
//     const variationId = image.variation_id?.toString() || 'No Variation'

//     if (!acc[productId]) {
//       acc[productId] = {}
//     }
//     if (!acc[productId][variationId]) {
//       acc[productId][variationId] = []
//     }
//     acc[productId][variationId].push(image)
//     return acc
//   }, {} as Record<string, Record<string, ImageWithRelations[]>>)

//   return (
//     <div className="space-y-4">
//       <h2 className="text-2xl font-bold">Images</h2>
//       <div className="grid grid-cols-2 gap-4">
//         <Select
//           value={selectedProductId}
//           onValueChange={(value) => {
//             if (value !== 'null') {
//               setSelectedProductId(value)
//               setSelectedVariationId('null')
//               fetchVariations(parseInt(value))
//             }
//           }}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select product" />
//           </SelectTrigger>
//           <SelectContent>
//             {products.map((product) => (
//               <SelectItem key={product.id} value={product.id.toString()}>
//                 {product.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Select
//           value={selectedVariationId}
//           onValueChange={setSelectedVariationId}
//           disabled={selectedProductId === 'null'}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select variation" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="null">None</SelectItem>
//             {variations.map((variation) => (
//               <SelectItem key={variation.id} value={variation.id.toString()}>
//                 {`${variation.color || ''} ${variation.size || ''}`.trim()}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <div className="col-span-2">
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleFileSelect}
//             accept="image/*"
//             multiple
//             className="hidden"
//           />
//           <Button
//             onClick={() => fileInputRef.current?.click()}
//             disabled={!selectedProductId}
//             variant="secondary"
//             className="w-full"
//           >
//             Select Images
//           </Button>
//         </div>

//         {previewImages.map((image, index) => (
//           <div key={index} className="col-span-2 flex items-center space-x-2">
//             <img src={image.preview} alt="Preview" className="w-20 h-20 object-cover" />
//             <Input value={image.file.name} readOnly />
//             <Button variant="destructive" onClick={() => removePreviewImage(index)}>Remove</Button>
//           </div>
//         ))}

//         {previewImages.length > 0 && (
//           <Button onClick={uploadImages} className="col-span-2" disabled={uploading}>
//             {uploading ? 'Uploading...' : 'Upload Images'}
//           </Button>
//         )}
//       </div>

//       {Object.entries(groupedImages).map(([productId, variations]) => (
//         <div key={productId} className="mt-8">
//           <h3 className="text-xl font-bold mb-4">
//             {productId === 'Unassigned' ? 'Unassigned' : products.find(p => p.id.toString() === productId)?.name}
//           </h3>
//           {Object.entries(variations).map(([variationId, images]) => (
//             <div key={variationId} className="mb-4">
//               <h4 className="text-lg font-semibold mb-2">
//                 {variationId === 'No Variation' ? 'No Variation' :
//                   `${images[0].variation?.color || ''} ${images[0].variation?.size || ''}`.trim()}
//               </h4>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Image</TableHead>
//                     <TableHead>URL</TableHead>
//                     <TableHead>Is Primary</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {images.map((image) => (
//                     <TableRow key={image.id}>
//                       <TableCell>
//                         <img src={image.url} alt="Product" className="w-20 h-20 object-cover" />
//                       </TableCell>
//                       <TableCell>{image.url}</TableCell>
//                       <TableCell>{image.is_primary ? 'Yes' : 'No'}</TableCell>
//                       <TableCell>
//                         <div className="flex space-x-2">
//                           <Button onClick={() => setEditingImage(image)}>Edit</Button>
//                           <Button variant="destructive" onClick={() => deleteImage(image.id)}>Delete</Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           ))}
//         </div>
//       ))}

//       {editingImage && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-background p-6 rounded-lg space-y-4 max-w-md w-full">
//             <h3 className="text-xl font-bold">Edit Image</h3>

//             <Select
//               value={editingImage.product_id?.toString() || 'null'}
//               onValueChange={(value) => {
//                 setEditingImage(prev => ({
//                   ...prev!,
//                   product_id: value === 'null' ? null : parseInt(value),
//                   variation_id: null
//                 }))
//                 if (value !== 'null') {
//                   fetchVariations(parseInt(value))
//                 }
//               }}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select product" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="null">None</SelectItem>
//                 {products.map((product) => (
//                   <SelectItem key={product.id} value={product.id.toString()}>
//                     {product.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select
//               value={editingImage.variation_id?.toString() || 'null'}
//               onValueChange={(value) =>
//                 setEditingImage(prev => ({
//                   ...prev!,
//                   variation_id: value === 'null' ? null : parseInt(value)
//                 }))
//               }
//               disabled={!editingImage.product_id}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select variation" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="null">None</SelectItem>
//                 {variations.map((variation) => (
//                   <SelectItem key={variation.id} value={variation.id.toString()}>
//                     {`${variation.color || ''} ${variation.size || ''}`.trim()}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <div className="flex items-center space-x-2">
//               <Checkbox
//                 id="edit_is_primary"
//                 checked={editingImage.is_primary}
//                 onCheckedChange={(checked) =>
//                   setEditingImage(prev => ({
//                     ...prev!,
//                     is_primary: checked as boolean
//                   }))
//                 }
//               />
//               <label htmlFor="edit_is_primary">Is Primary</label>
//             </div>

//             <div className="pt-4 flex justify-end space-x-2">
//               <Button variant="outline" onClick={() => setEditingImage(null)}>
//                 Cancel
//               </Button>
//               <Button onClick={() => updateImage(editingImage.id, editingImage)}>
//                 Save
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Images;






'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import axios from 'axios'

interface UploadedImage {
  id: number
  url: string
  file?: File
  is_primary: boolean
  product_id: number | null
  variation_id: number | null
}

interface Product {
  id: number
  name: string
  sku:string
}

interface Variation {
  id: number
  color?: string
  size?: string
}

const HOSTINGER_UPLOAD_URL = 'https://media.varietyheaven.in/upload.php'
const MAX_IMAGES = 9

export default function Images() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [draggedImage, setDraggedImage] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [variations, setVariations] = useState<Variation[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('null')
  const [selectedVariationId, setSelectedVariationId] = useState<string>('null')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Fetch variations when product changes
  useEffect(() => {
    if (selectedProductId && selectedProductId !== 'null') {
      fetchVariations(parseInt(selectedProductId))
    } else {
      setVariations([])
      setSelectedVariationId('null')
    }
  }, [selectedProductId])

  // Fetch existing images when selection changes
  useEffect(() => {
    if (selectedProductId !== 'null') {
      fetchExistingImages()
    } else {
      setImages([])
    }
  }, [selectedProductId, selectedVariationId])

  async function fetchProducts() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error
      setProducts(data)
    } catch (error) {
      toast({
        title: "Error fetching products",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchVariations(productId: number) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('variations')
        .select('*')
        .eq('product_id', productId)
        .order('created_at')

      if (error) throw error
      setVariations(data)
    } catch (error) {
      toast({
        title: "Error fetching variations",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchExistingImages() {
    setLoading(true)
    try {
      const query = supabase
        .from('images')
        .select('*')
        .eq('product_id', selectedProductId)
        .order('is_primary', { ascending: false })

      if (selectedVariationId !== 'null') {
        query.eq('variation_id', selectedVariationId)
      } else {
        query.is('variation_id', null)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Transform the data to match UploadedImage interface
      const transformedImages = data.map(img => ({
        id: img.id,
        url: img.url,
        is_primary: img.is_primary,
        product_id: img.product_id,
        variation_id: img.variation_id
      }))

      setImages(transformedImages)
    } catch (error) {
      toast({
        title: "Error fetching images",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const remainingSlots = MAX_IMAGES - images.length
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload up to ${MAX_IMAGES} images`,
        variant: "destructive",
      })
      return
    }

    const newImages: UploadedImage[] = Array.from(files)
      .slice(0, remainingSlots)
      .map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        file,
        is_primary: images.length === 0 && index === 0,
        product_id: selectedProductId !== 'null' ? parseInt(selectedProductId) : null,
        variation_id: selectedVariationId !== 'null' ? parseInt(selectedVariationId) : null
      }))

    setImages(prev => [...prev, ...newImages])
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragStart = (imageId: number) => {
    setDraggedImage(imageId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedImage === null) return

    const draggedImageIndex = images.findIndex(img => img.id === draggedImage)
    if (draggedImageIndex === -1) return

    const newImages = [...images]
    const [draggedItem] = newImages.splice(draggedImageIndex, 1)
    newImages.splice(targetIndex, 0, draggedItem)

    // Update is_primary status if necessary
    newImages[0] = { ...newImages[0], is_primary: true }
    for (let i = 1; i < newImages.length; i++) {
      newImages[i] = { ...newImages[i], is_primary: false }
    }

    setImages(newImages)
    setDraggedImage(null)
  }

  const removeImage = async (imageId: number) => {
    try {
      const imageToRemove = images.find(img => img.id === imageId)
      
      // If it's an existing image (no file property), delete from database
      if (imageToRemove && !imageToRemove.file) {
        const { error } = await supabase
          .from('images')
          .delete()
          .eq('id', imageId)

        if (error) throw error
      }

      // Remove from state
      setImages(prev => {
        const newImages = prev.filter(img => img.id !== imageId)
        // If we removed the primary image, make the first remaining image primary
        if (newImages.length > 0 && imageToRemove?.is_primary) {
          newImages[0] = { ...newImages[0], is_primary: true }
        }
        return newImages
      })

      toast({
        title: "Success",
        description: "Image removed successfully",
      })
    } catch (error) {
      toast({
        title: "Error removing image",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const uploadImages = async () => {
    if (selectedProductId === 'null') {
      toast({
        title: "Error",
        description: "Please select a product first",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      // Handle new uploads
      const imagesToUpload = images.filter(img => img.file)
      const uploadPromises = imagesToUpload.map(async (image) => {
        if (!image.file) return image

        const formData = new FormData()
        formData.append('file', image.file)
        formData.append('filename', `${Date.now()}-${image.file.name}`)

        const response = await axios.post(HOSTINGER_UPLOAD_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (!response.data.success) {
          throw new Error(response.data.message || 'Upload failed')
        }

        return {
          ...image,
          url: response.data.url,
          file: undefined // Remove file property before database insertion
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)

      // Update database
      for (const image of uploadedImages) {
        const { error } = await supabase
          .from('images')
          .insert({
            url: image.url,
            is_primary: image.is_primary,
            product_id: image.product_id,
            variation_id: image.variation_id
          })

        if (error) throw error
      }

      // Update existing images' order and primary status
      const existingImages = images.filter(img => !img.file)
      for (const image of existingImages) {
        const { error } = await supabase
          .from('images')
          .update({ is_primary: image.is_primary })
          .eq('id', image.id)

        if (error) throw error
      }

      toast({
        title: "Success",
        description: "Images updated successfully",
      })

      // Refresh images
      await fetchExistingImages()
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const renderUploadBox = (index: number) => {
    const image = images[index]
    
    return (
      <div
        key={index}
        className={cn(
          "relative aspect-square rounded-lg border-2 border-dashed",
          "transition-colors",
          image ? "border-muted" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
      >
        {image ? (
          <>
            <img
              src={image.url}
              alt={`Product image ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
              draggable
              onDragStart={() => handleDragStart(image.id)}
            />
            <button
              onClick={() => removeImage(image.id)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground 
                       hover:bg-destructive/90 transition-colors"
              aria-label="Remove image"
            >
              ×
            </button>
            {image.is_primary && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-primary/80 text-primary-foreground rounded-md text-xs">
                Primary
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Camera className="w-8 h-8 mb-2" />
            <span className="text-sm">Drop image here</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Upload Product Images</h2>
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <Select
          value={selectedProductId}
          onValueChange={(value) => {
            setSelectedProductId(value)
            setSelectedVariationId('null')
          }}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">Select a product</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.sku}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedVariationId}
          onValueChange={setSelectedVariationId}
          disabled={selectedProductId === 'null' || loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select variation (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">No variation</SelectItem>
            {variations.map((variation) => (
              <SelectItem key={variation.id} value={variation.id.toString()}>
                {`${variation.color || ''} ${variation.size || ''}`.trim() || `Variation ${variation.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
          className="w-full"
          disabled={selectedProductId === 'null' || loading || images.length >= MAX_IMAGES}
        >
          Select Images
        </Button>
        <p className="text-sm text-muted-foreground">
          {images.length} of {MAX_IMAGES} images uploaded. 
          {images.length > 0 && " Drag to reorder. First image will be the primary image."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[...Array(MAX_IMAGES)].map((_, index) => renderUploadBox(index))}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setImages([])
            setSelectedProductId('null')
            setSelectedVariationId('null')
          }}
          disabled={loading || uploading}
        >Clear All
        </Button>
        <Button 
          onClick={uploadImages} 
          disabled={loading || uploading || images.length === 0 || selectedProductId === 'null'}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Save Images'
          )}
        </Button>
      </div>

      {/* Help text */}
      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
        <h3 className="font-medium">Instructions:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Select a product and optional variation first</li>
          <li>• Upload up to {MAX_IMAGES} images</li>
          <li>• Drag images to reorder them - the first image will be the primary/main image</li>
          <li>• Click the × button to remove an image</li>
          <li>• Click Save Images to upload new images or update the order</li>
        </ul>
      </div>

      {images.length > 0 && (
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="font-medium">Current Images:</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="space-y-1">
                  <div className="text-sm font-medium">Image {index + 1}</div>
                  <div className="text-sm text-muted-foreground">
                    Status: {image.file ? 'New Upload' : 'Existing'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Primary: {image.is_primary ? 'Yes' : 'No'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}