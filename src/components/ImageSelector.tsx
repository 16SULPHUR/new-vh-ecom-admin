'use client'

import { useState, useRef } from 'react'
import { Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedImage {
  id: number
  url: string
  file: File
}

export default function ImageUpload() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [draggedImage, setDraggedImage] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newImages = Array.from(files).slice(0, 9 - images.length).map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        file
      }))
      setImages(prev => [...prev, ...newImages].slice(0, 9))
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragStart = (imageId: number) => {
    setDraggedImage(imageId)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
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
    setImages(newImages)
    setDraggedImage(null)
  }

  const removeImage = (imageId: number) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const renderUploadBox = (index: number) => {
    const image = images[index]
    
    return (
      <div key={index} className="relative">
        <div
          className={cn(
            "relative aspect-square rounded-lg border-2 border-dashed",
            "flex items-center justify-center",
            "bg-muted/20 hover:bg-muted/30 transition-colors",
            image ? "border-muted" : "border-muted-foreground/25"
          )}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
        >
          {image ? (
            <>
              <img
                src={image.url}
                alt={`Upload ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                draggable
                onDragStart={() => handleDragStart(image.id)}
              />
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground text-xs"
              >
                ×
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Camera className="w-8 h-8" />
              <span className="text-sm">Upload</span>
            </div>
          )}
        </div>
        {index === 2 && (
          <span className="block mt-1 text-xs text-muted-foreground">MAIN</span>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Images</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-primary hover:underline text-sm"
        >
          Upload multiple files
        </button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Uploaded: {images.length} of 9 images. Maximum 9 images are allowed. You can arrange the order
        after uploading.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      <div className="grid grid-cols-3 gap-4">
        {[...Array(9)].map((_, index) => renderUploadBox(index))}
      </div>
    </div>
  )
}

