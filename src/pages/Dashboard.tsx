import { useEffect, useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Database } from '@/lib/database.types'
import { supabase } from "@/lib/supabase"
import { VariationDialog } from "@/components/variation-dialog"

type Variation = Database['public']['Tables']['variations']['Row']
type Product = Database['public']['Tables']['products']['Row']

export function ProductDashboard() {
    const [products, setProducts] = useState<Product[]>([])
    const [expandedProducts, setExpandedProducts] = useState<number[]>([])
    const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        try {
            const { data: products, error } = await supabase
                .from('products')
                .select(`
                    *,
                    variations (
                        *,
                        images (*)
                    )
                `)
                .order('id', { ascending: false })

            if (error) throw error
            setProducts(products || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleProduct = (productId: number) => {
        setExpandedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    if (loading) {
        return <div className="flex items-center justify-center p-8">Loading...</div>
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Products Dashboard</h1>
            
            <div className="border rounded-lg">
                {/* Header */}
                <div className="flex items-center bg-muted px-4 py-3 border-b font-medium">
                    <div className="w-8"></div>
                    <div className="flex-1 min-w-[200px]">Name</div>
                    <div className="w-24 text-left">SKU</div>
                    <div className="w-24 text-left">Price</div>
                    <div className="w-32 text-left">Pattern</div>
                    <div className="w-32 text-left">Fabric</div>
                    <div className="w-24 text-right">Variations</div>
                </div>

                {/* Product Rows */}
                <div className="divide-y">
                    {products.map((product) => (
                        <Collapsible
                            key={product.id}
                            open={expandedProducts.includes(product.id)}
                            onOpenChange={() => toggleProduct(product.id)}
                        >
                            <div className="flex items-center px-4 py-3 hover:bg-muted/50">
                                <div className="w-8">
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            {expandedProducts.includes(product.id) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <div className="flex-1 min-w-[200px] font-medium">{product.name}</div>
                                <div className="w-40 text-left">{product.id} ({product.sku})</div>
                                <div className="w-24 text-left">${product.price.toFixed(2)}</div>
                                <div className="w-32 text-left">{product.pattern}</div>
                                <div className="w-32 text-left">{product.fabric}</div>
                                <div className="w-24 text-right">{product.variations?.length || 0}</div>
                            </div>

                            <CollapsibleContent>
                                <div className="px-4 py-4 bg-muted/50 border-t">
                                    <h3 className="font-semibold mb-3 ml-8">Variations</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-8">
                                        {product.variations?.map((variation: any) => (
                                            <Button
                                                key={variation.id}
                                                variant="outline"
                                                className="h-auto p-4 flex flex-col items-start space-y-2 w-full"
                                                onClick={() => setSelectedVariation(variation)}
                                            >
                                                <div className="flex justify-between w-full">
                                                    <span className="font-semibold">
                                                        {product.id}-{variation.id} ({variation.color} - {variation.size})
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        Stock: {variation.stock}
                                                    </span>
                                                </div>
                                                {variation.images?.[0] && (
                                                    <img
                                                        src={variation.images[0].url}
                                                        alt={`${product.name} variation`}
                                                        className="w-full h-32 object-cover rounded-md"
                                                    />
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </div>

            <VariationDialog
                variation={selectedVariation}
                open={!!selectedVariation}
                onOpenChange={(open) => !open && setSelectedVariation(null)}
            />
        </div>
    )
}