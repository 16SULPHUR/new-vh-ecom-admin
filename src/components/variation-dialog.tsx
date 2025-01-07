import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Database } from '@/lib/database.types'
type Variation = Database['public']['Tables']['variations']['Row']

interface VariationDialogProps {
    variation: Variation | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function VariationDialog({ variation, open, onOpenChange }: VariationDialogProps) {
    if (!variation) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Variation Details</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh]">
                    <div className="grid gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold">Color</h3>
                                <p>{variation.color}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Size</h3>
                                <p>{variation.size}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Stock</h3>
                                <p>{variation.stock}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Created At</h3>
                                <p>{new Date(variation.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Images</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {variation.images.map((image:any) => (
                                    <div
                                        key={image.id}
                                        className="relative aspect-square rounded-lg overflow-hidden border"
                                    >
                                        <img
                                            src={image.url}
                                            alt={`Product variation ${variation.id}`}
                                            className="object-cover w-full h-full"
                                        />
                                        {image.is_primary && (
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs">
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

