"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FabricPreviewProps {
  color: string
}

export default function FabricPreview({ color }: FabricPreviewProps) {
  const [activeTab, setActiveTab] = useState("fabric1")

  const fabricImages = [
    {
      id: "fabric1",
      name: "Silk Fabric",
      url: "https://png.pngtree.com/png-vector/20230408/ourmid/pngtree-silk-fabric-texture-picture-png-image_6691850.png",
    },
    {
      id: "fabric2",
      name: "Textured Fabric",
      url: "https://png.pngtree.com/png-vector/20240315/ourmid/pngtree-textured-fabric-backdrop-overlay-png-image_11980430.png",
    },
    {
      id: "fabric3",
      name: "Polyester Fabric",
      url: "https://png.pngtree.com/png-vector/20240315/ourmid/pngtree-polyester-fabric-texture-rich-brown-cloth-transparent-background-overlay-png-image_11968325.png",
    },
  ]

  return (
    <div className="border rounded-lg p-4 bg-card">
      <Tabs defaultValue="fabric1" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          {fabricImages.map((fabric) => (
            <TabsTrigger key={fabric.id} value={fabric.id}>
              {fabric.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {fabricImages.map((fabric) => (
          <TabsContent key={fabric.id} value={fabric.id} className="mt-0">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-white">
                <div
                  className="w-full h-full relative"
                  style={{
                    backgroundColor: color,
                  }}
                >
                  <img
                    src={fabric.url || "/placeholder.svg"}
                    alt={fabric.name}
                    style={{
                      objectFit: "cover",
                      mixBlendMode: "multiply",
                    }}
                    crossOrigin="anonymous"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="font-medium">{fabric.name}</div>
              <div className="text-sm text-muted-foreground">Color: {color}</div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

