import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Color } from "./color-manager"

interface ColorListProps {
  colors: Color[]
  loading: boolean
  selectedColor: Color | null
  onSelect: (color: Color) => void
  onEdit: (color: Color) => void
  onDelete: (id: number) => void
}

export default function ColorList({ colors, loading, selectedColor, onSelect, onEdit, onDelete }: ColorListProps) {
  if (loading) {
    return <div className="text-center p-4">Loading colors...</div>
  }

  if (colors.length === 0) {
    return <div className="text-center p-4 border rounded-lg bg-muted">No colors found. Add your first color!</div>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto">
        {colors.map((color) => (
          <div
            key={color.id}
            className={`flex items-center justify-between p-3 border-b cursor-pointer hover:bg-muted/50 ${
              selectedColor?.id === color.id ? "bg-muted" : ""
            }`}
            onClick={() => onSelect(color)}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color.hex_code }} />
              <div>
                <div className="font-medium">{color.name}</div>
                <div className="text-xs text-muted-foreground">{color.hex_code}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(color)
                }}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Are you sure you want to delete ${color.name}?`)) {
                    onDelete(color.id)
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

