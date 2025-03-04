"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import ColorForm from "./color-form"
import FabricPreview from "./fabric-preview"
import ColorList from "./ color-list"

export type Color = {
    id: number
    name: string
    hex_code: string
    created_at?: string
}

export default function ColorManager() {
    const [colors, setColors] = useState<Color[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedColor, setSelectedColor] = useState<Color | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [previewColor, setPreviewColor] = useState<string | null>(null)

    useEffect(() => {
        fetchColors()
    }, [])

    async function fetchColors() {
        try {
            setLoading(true)
            const { data, error } = await supabase.from("colors").select("*").order("created_at", { ascending: false })

            if (error) {
                throw error
            }

            if (data) {
                setColors(data)
                if (data.length > 0 && !selectedColor) {
                    setSelectedColor(data[0])
                }
            }
        } catch (error) {
            console.error("Error fetching colors:", error)
            alert("Error fetching colors!")
        } finally {
            setLoading(false)
        }
    }

    async function addColor(id: number | undefined, name: string, hexCode: string) {
        try {
            const { data, error } = await supabase
                .from("colors")
                .insert([{ name, hex_code: hexCode }])
                .select()

            if (error) {
                throw error
            }

            if (data) {
                setColors([...data, ...colors])
                setSelectedColor(data[0])
            }
            setIsFormOpen(false)
        } catch (error) {
            console.error("Error adding color:", error)
            alert("Error adding color!")
        }
    }

    async function updateColor(id: number | undefined, name: string, hexCode: string) {
        if (id === undefined) {
            console.error("Cannot update color without an ID")
            return
        }
        try {
            const { data, error } = await supabase.from("colors").update({ name, hex_code: hexCode }).eq("id", id).select()

            if (error) {
                throw error
            }

            if (data) {
                setColors(colors.map((color) => (color.id === id ? data[0] : color)))
                setSelectedColor(data[0])
            }
            setIsFormOpen(false)
            setIsEditing(false)
        } catch (error) {
            console.error("Error updating color:", error)
            alert("Error updating color!")
        }
    }

    async function deleteColor(id: number) {
        try {
            const { error } = await supabase.from("colors").delete().eq("id", id)

            if (error) {
                throw error
            }

            setColors(colors.filter((color) => color.id !== id))
            if (selectedColor?.id === id) {
                setSelectedColor(colors.length > 0 ? colors[0] : null)
            }
        } catch (error) {
            console.error("Error deleting color:", error)
            alert("Error deleting color!")
        }
    }

    function handleEdit(color: Color) {
        setSelectedColor(color)
        setIsEditing(true)
        setIsFormOpen(true)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Colors</h2>
                    <Button
                        onClick={() => {
                            setIsEditing(false)
                            setIsFormOpen(true)
                        }}
                        size="sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Color
                    </Button>
                </div>

                {isFormOpen && (
                    <div className="mb-6">
                        <ColorForm
                            onSubmit={isEditing ? updateColor : addColor}
                            onCancel={() => {
                                setIsFormOpen(false)
                                setIsEditing(false)
                                setPreviewColor(null)
                            }}
                            initialColor={isEditing ? selectedColor : null}
                            onColorChange={setPreviewColor}
                        />
                    </div>
                )}

                <ColorList
                    colors={colors}
                    loading={loading}
                    selectedColor={selectedColor}
                    onSelect={setSelectedColor}
                    onEdit={handleEdit}
                    onDelete={deleteColor}
                />
            </div>

            <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Fabric Preview</h2>
                {isFormOpen && previewColor ? (
                    <FabricPreview color={previewColor} />
                ) : selectedColor ? (
                    <FabricPreview color={selectedColor.hex_code} />
                ) : (
                    <div className="text-center p-10 border rounded-lg bg-muted">Select a color to preview</div>
                )}
            </div>
        </div>
    )
}

