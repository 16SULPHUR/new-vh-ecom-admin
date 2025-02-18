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
  const [colors, setColors] = useState<string[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('null')
  const [selectedColor, setSelectedColor] = useState<string>('null')
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
      setColors([])
      setSelectedColor('null')
    }
  }, [selectedProductId])

  useEffect(() => {
    if (variations.length > 0) {
      const uniqueColors = Array.from(new Set(variations
        .map(v => v.color || 'No Color')
        .filter(color => color)))
      setColors(uniqueColors)
    }
  }, [variations])

  // Fetch existing images when selection changes
  useEffect(() => {
    if (selectedProductId !== 'null' && selectedColor !== 'null') {
      fetchExistingImages()
    } else {
      setImages([])
    }
  }, [selectedProductId, selectedColor])

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
      // Get all variation IDs for the selected color
      const colorVariationIds = variations
        .filter(v => v.color === selectedColor)
        .map(v => v.id)

      if (colorVariationIds.length === 0) return

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('product_id', selectedProductId)
        .in('variation_id', colorVariationIds)
        .order('is_primary', { ascending: false })

      if (error) throw error
      
      // Get unique images (same URL might be used for multiple variations)
      const uniqueImages = Array.from(new Set(data.map(img => img.url)))
        .map(url => {
          const img = data.find(i => i.url === url)
          return {
            id: img!.id,
            url: img!.url,
            is_primary: img!.is_primary,
            product_id: img!.product_id,
            variation_id: img!.variation_id
          }
        })

      setImages(uniqueImages)
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
  
    // Validate file types and sizes
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        })
        return false
      }
      
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        })
        return false
      }
      return true
    })
  
    // Get variation IDs for the selected color
    const colorVariationIds = variations
      .filter(v => v.color === selectedColor)
      .map(v => v.id)
  
    // Create new image objects
    const newImages: UploadedImage[] = validFiles
      .slice(0, remainingSlots)
      .map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        file,
        is_primary: images.length === 0 && index === 0,
        product_id: selectedProductId !== 'null' ? parseInt(selectedProductId) : null,
        // Store the first variation ID from the color group
        // (actual association with all variations happens during upload)
        variation_id: colorVariationIds.length > 0 ? colorVariationIds[0] : null
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
    if (selectedProductId === 'null' || selectedColor === 'null') {
      toast({
        title: "Error",
        description: "Please select both product and color",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      // Get all variation IDs for the selected color
      const colorVariationIds = variations
        .filter(v => v.color === selectedColor)
        .map(v => v.id)

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
          file: undefined
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)

      // Insert images for all variations of the selected color
      for (const image of uploadedImages) {
        const insertPromises = colorVariationIds.map(variationId =>
          supabase
            .from('images')
            .insert({
              url: image.url,
              is_primary: image.is_primary,
              product_id: parseInt(selectedProductId),
              variation_id: variationId
            })
        )

        await Promise.all(insertPromises)
      }

      // Update existing images' order and primary status
      const existingImages = images.filter(img => !img.file)
      for (const image of existingImages) {
        const updatePromises = colorVariationIds.map(variationId =>
          supabase
            .from('images')
            .update({ is_primary: image.is_primary })
            .eq('variation_id', variationId)
            .eq('url', image.url)
        )

        await Promise.all(updatePromises)
      }

      toast({
        title: "Success",
        description: "Images updated successfully for all sizes of the selected color",
      })

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
            setSelectedColor('null')
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
          value={selectedColor}
          onValueChange={setSelectedColor}
          disabled={selectedProductId === 'null' || loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">Select a color</SelectItem>
            {colors.map((color) => (
              <SelectItem key={color} value={color}>
                {color}
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
            setSelectedColor('null')
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
            // Clean up any object URLs to prevent memory leaks
            images.forEach(image => {
              if (image.file) {
                URL.revokeObjectURL(image.url)
              }
            })
          }}
          disabled={loading || uploading}
        >
          Clear All
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



















// import { useState, useRef, useEffect } from 'react'
// import { Camera, Loader2 } from 'lucide-react'
// import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { useToast } from '@/hooks/use-toast'
// import { supabase } from '@/lib/supabase'
// import axios from 'axios'

// interface UploadedImage {
//   id: number
//   url: string
//   file?: File
//   is_primary: boolean
//   product_id: number | null
//   variation_id: number | null
// }

// interface Product {
//   id: number
//   name: string
//   sku: string
// }

// interface Variation {
//   id: number
//   color?: string
//   size?: string
// }

// const HOSTINGER_UPLOAD_URL = 'https://media.varietyheaven.in/upload.php'
// const MAX_IMAGES = 9

// export default function Images() {
//   const [images, setImages] = useState<UploadedImage[]>([])
//   const [draggedImage, setDraggedImage] = useState<number | null>(null)
//   const [products, setProducts] = useState<Product[]>([])
//   const [variations, setVariations] = useState<Variation[]>([])
//   const [colors, setColors] = useState<string[]>([])
//   const [selectedProductId, setSelectedProductId] = useState<string>('null')
//   const [selectedColor, setSelectedColor] = useState<string>('null')
//   const [uploading, setUploading] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const { toast } = useToast()

//   useEffect(() => {
//     fetchProducts()
//   }, [])

//   useEffect(() => {
//     if (selectedProductId && selectedProductId !== 'null') {
//       fetchVariations(parseInt(selectedProductId))
//     } else {
//       setVariations([])
//       setColors([])
//       setSelectedColor('null')
//     }
//   }, [selectedProductId])

//   useEffect(() => {
//     if (variations.length > 0) {
//       const uniqueColors = Array.from(new Set(variations
//         .map(v => v.color || 'No Color')
//         .filter(color => color)))
//       setColors(uniqueColors)
//     }
//   }, [variations])

//   useEffect(() => {
//     if (selectedProductId !== 'null' && selectedColor !== 'null') {
//       fetchExistingImages()
//     } else {
//       setImages([])
//     }
//   }, [selectedProductId, selectedColor])

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files
//     if (!files || files.length === 0) return

//     const remainingSlots = MAX_IMAGES - images.length
//     if (remainingSlots <= 0) {
//       toast({
//         title: "Maximum images reached",
//         description: `You can only upload up to ${MAX_IMAGES} images`,
//         variant: "destructive",
//       })
//       return
//     }

//     const validFiles = Array.from(files).filter(file => {
//       if (!file.type.startsWith('image/')) {
//         toast({
//           title: "Invalid file type",
//           description: `${file.name} is not an image file`,
//           variant: "destructive",
//         })
//         return false
//       }
      
//       const maxSize = 5 * 1024 * 1024 // 5MB
//       if (file.size > maxSize) {
//         toast({
//           title: "File too large",
//           description: `${file.name} is larger than 5MB`,
//           variant: "destructive",
//         })
//         return false
//       }
//       return true
//     })

//     const colorVariationIds = variations
//       .filter(v => v.color === selectedColor)
//       .map(v => v.id)

//     const newImages: UploadedImage[] = validFiles
//       .slice(0, remainingSlots)
//       .map((file, index) => ({
//         id: Date.now() + index,
//         url: URL.createObjectURL(file),
//         file,
//         is_primary: images.length === 0 && index === 0,
//         product_id: selectedProductId !== 'null' ? parseInt(selectedProductId) : null,
//         variation_id: colorVariationIds.length > 0 ? colorVariationIds[0] : null
//       }))

//     setImages(prev => [...prev, ...newImages])
    
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ''
//     }
//   }

//   const handleDragStart = (imageId: number) => {
//     setDraggedImage(imageId)
//   }

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault()
//   }

//   const handleDrop = (e: React.DragEvent, targetIndex: number) => {
//     e.preventDefault()
//     if (draggedImage === null) return

//     const draggedImageIndex = images.findIndex(img => img.id === draggedImage)
//     if (draggedImageIndex === -1) return

//     const newImages = [...images]
//     const [draggedItem] = newImages.splice(draggedImageIndex, 1)
//     newImages.splice(targetIndex, 0, draggedItem)

//     // Update primary status
//     newImages[0] = { ...newImages[0], is_primary: true }
//     for (let i = 1; i < newImages.length; i++) {
//       newImages[i] = { ...newImages[i], is_primary: false }
//     }

//     setImages(newImages)
//     setDraggedImage(null)
//   }

//   const removeImage = async (imageId: number) => {
//     try {
//       const imageToRemove = images.find(img => img.id === imageId)
      
//       if (imageToRemove && !imageToRemove.file) {
//         // Get all variation IDs for the selected color
//         const colorVariationIds = variations
//           .filter(v => v.color === selectedColor)
//           .map(v => v.id)

//         // Delete image from all variations of this color
//         const deletePromises = colorVariationIds.map(variationId =>
//           supabase
//             .from('images')
//             .delete()
//             .eq('variation_id', variationId)
//             .eq('url', imageToRemove.url)
//         )

//         await Promise.all(deletePromises)
//       }

//       setImages(prev => {
//         const newImages = prev.filter(img => img.id !== imageId)
//         if (newImages.length > 0 && imageToRemove?.is_primary) {
//           newImages[0] = { ...newImages[0], is_primary: true }
//         }
//         return newImages
//       })

//       toast({
//         title: "Success",
//         description: "Image removed successfully from all variations",
//       })
//     } catch (error) {
//       toast({
//         title: "Error removing image",
//         description: error instanceof Error ? error.message : "Unknown error occurred",
//         variant: "destructive",
//       })
//     }
//   }

//   const renderUploadBox = (index: number) => {
//     const image = images[index]
    
//     return (
//       <div
//         key={index}
//         className={cn(
//           "relative aspect-square rounded-lg border-2 border-dashed",
//           "transition-colors",
//           image ? "border-muted" : "border-muted-foreground/25 hover:border-muted-foreground/50"
//         )}
//         onDragOver={handleDragOver}
//         onDrop={(e) => handleDrop(e, index)}
//       >
//         {image ? (
//           <>
//             <img
//               src={image.url}
//               alt={`Product image ${index + 1}`}
//               className="absolute inset-0 w-full h-full object-cover rounded-lg"
//               draggable
//               onDragStart={() => handleDragStart(image.id)}
//             />
//             <button
//               onClick={() => removeImage(image.id)}
//               className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground 
//                        hover:bg-destructive/90 transition-colors"
//               aria-label="Remove image"
//             >
//               ×
//             </button>
//             {image.is_primary && (
//               <div className="absolute top-2 left-2 px-2 py-1 bg-primary/80 text-primary-foreground rounded-md text-xs">
//                 Primary
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
//             <Camera className="w-8 h-8 mb-2" />
//             <span className="text-sm">Drop image here</span>
//           </div>
//         )}
//       </div>
//     )
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold">Upload Product Images</h2>
//         {loading && (
//           <div className="flex items-center gap-2 text-muted-foreground">
//             <Loader2 className="w-4 h-4 animate-spin" />
//             <span>Loading...</span>
//           </div>
//         )}
//       </div>
      
//       <div className="space-y-4">
//         <Select
//           value={selectedProductId}
//           onValueChange={(value) => {
//             setSelectedProductId(value)
//             setSelectedColor('null')
//           }}
//           disabled={loading}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select product" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="null">Select a product</SelectItem>
//             {products.map((product) => (
//               <SelectItem key={product.id} value={product.id.toString()}>
//                 {product.sku}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Select
//           value={selectedColor}
//           onValueChange={setSelectedColor}
//           disabled={selectedProductId === 'null' || loading}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select color" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="null">Select a color</SelectItem>
//             {colors.map((color) => (
//               <SelectItem key={color} value={color}>
//                 {color}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="space-y-2">
//         <input
//           ref={fileInputRef}
//           type="file"
//           onChange={handleFileSelect}
//           accept="image/*"
//           multiple
//           className="hidden"
//         />
//         <Button
//           onClick={() => fileInputRef.current?.click()}
//           variant="secondary"
//           className="w-full"
//           disabled={selectedProductId === 'null' || selectedColor === 'null' || loading || images.length >= MAX_IMAGES}
//         >
//           Select Images
//         </Button>
//         <p className="text-sm text-muted-foreground">
//           {images.length} of {MAX_IMAGES} images uploaded. 
//           {images.length > 0 && " Drag to reorder. First image will be the primary image."}
//         </p>
//       </div>

//       <div className="grid grid-cols-3 gap-4">
//         {[...Array(MAX_IMAGES)].map((_, index) => renderUploadBox(index))}
//       </div>

//       <div className="flex justify-end gap-4">
//         <Button
//           variant="outline"
//           onClick={() => {
//             setImages([])
//             setSelectedProductId('null')
//             setSelectedColor('null')
//           }}
//           disabled={loading || uploading}
//         >
//           Clear All
//         </Button>
//         <Button 
//           onClick={uploadImages} 
//           disabled={loading || uploading || images.length === 0 || selectedProductId === 'null' || selectedColor === 'null'}
//         >
//           {uploading ? (
//             <>
//               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//               Uploading...
//             </>
//           ) : (
//             'Save Images'
//           )}
//         </Button>
//       </div>

//       <div className="rounded-lg bg-muted/50 p-4 space-y-2">
//         <h3 className="font-medium">Instructions:</h3>
//         <ul className="text-sm text-muted-foreground space-y-1">
//           <li>• Select a product and color first</li>
//           <li>• Images will be applied to all size variations of the selected color</li>
//           <li>• Upload up to {MAX_IMAGES} images</li>
//           <li>• Drag images to reorder them - the first image will be the primary image</li>
//           <li>• Click the × button to remove an image from all variations</li>
//           <li>• Click Save Images to upload new images or update the order</li>
//         </ul>
//       </div>

//       {images.length > 0 && (
//         <div className="rounded-lg border p-4 space-y-4">
//           <h3 className="font-medium">Current Images:</h3>
//           <div className="space-y-2">
//             <div className="grid grid-cols-2 gap-4">
//               {images.map((image, index) => (
//                 <div key={image.id} className="space-y-1">
//                   <div className="text-sm font-medium">Image {index + 1}</div>
//                   <div className="text-sm text-muted-foreground">
//                     Status: {image.file ? 'New Upload' : 'Existing'}
//                   </div>
//                   <div className="text-sm text-muted-foreground">
//                     Primary: {image.is_primary ? 'Yes' : 'No'}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }