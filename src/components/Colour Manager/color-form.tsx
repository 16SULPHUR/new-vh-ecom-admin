"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { HexColorPicker } from "react-colorful"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Color } from "./color-manager"

interface ColorFormProps {
  onSubmit: (id: number | undefined, name: string, hexCode: string) => void
  onCancel: () => void
  initialColor: Color | null
  onColorChange: (color: string) => void
}

export default function ColorForm({ onSubmit, onCancel, initialColor, onColorChange }: ColorFormProps) {
  const [name, setName] = useState("")
  const [hexCode, setHexCode] = useState("#663399")
  const [id, setId] = useState<number | undefined>(undefined)

  const updateHexCode = (color: string) => {
    setHexCode(color)
    onColorChange(color)
  }

  useEffect(() => {
    if (initialColor) {
      setName(initialColor.name)
      setHexCode(initialColor.hex_code)
      setId(initialColor.id)
    }
  }, [initialColor])

  useEffect(() => {
    // Set initial preview color
    if (initialColor) {
      onColorChange(initialColor.hex_code)
    } else {
      onColorChange(hexCode)
    }
  }, [initialColor, hexCode, onColorChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() === "") {
      alert("Please enter a color name")
      return
    }
    onSubmit(id, name, hexCode)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="space-y-2">
        <Label htmlFor="name">Color Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter color name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hexCode">Color</Label>
        <div className="flex items-center gap-4">
          <Input
            id="hexCode"
            value={hexCode}
            onChange={(e) => updateHexCode(e.target.value)}
            placeholder="#RRGGBB"
            pattern="^#([A-Fa-f0-9]{6})$"
            title="Hex color code (e.g. #663399)"
            required
          />
          <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: hexCode }} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[220px]">
        {/* <HexColorPicker color={hexCode} onChange={updateHexCode} /> */}
        <Input type="color" value={hexCode} onChange={(e) => updateHexCode(e.target.value)}/>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialColor ? "Update" : "Add"} Color</Button>
      </div>
    </form>
  )
}

