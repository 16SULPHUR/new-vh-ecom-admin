export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: number
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    created_at?: string
                }
            }
            products: {
                Row: {
                    [x: string]: any
                    id: number
                    category_id: number
                    name: string
                    description: string | null
                    price: number
                    sku: string | null
                    pattern: string | null
                    occasion: string | null
                    fabric: string | null
                    net_quantity: number | null
                    wash_care_instructions: string | null
                    dimensions: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    category_id: number
                    name: string
                    description?: string | null
                    price: number
                    sku?: string | null
                    pattern?: string | null
                    occasion?: string | null
                    fabric?: string | null
                    net_quantity?: number | null
                    wash_care_instructions?: string | null
                    dimensions?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    category_id?: number
                    name?: string
                    description?: string | null
                    price?: number
                    sku?: string | null
                    pattern?: string | null
                    occasion?: string | null
                    fabric?: string | null
                    net_quantity?: number | null
                    wash_care_instructions?: string | null
                    dimensions?: string | null
                    created_at?: string
                }
            }
            variations: {
                Row: {
                    [x: string]: any
                    id: number
                    product_id: number
                    color: string | null
                    size: string | null
                    stock: number
                    created_at: string
                }
                Insert: {
                    id?: number
                    product_id: number
                    color?: string | null
                    size?: string | null
                    stock?: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    product_id?: number
                    color?: string | null
                    size?: string | null
                    stock?: number
                    created_at?: string
                }
            }
            images: {
                Row: {
                    [x: string]: any
                    id: number
                    product_id: number | null
                    variation_id: number | null
                    url: string
                    is_primary: boolean
                    created_at: string
                }
                Insert: {
                    id?: number
                    product_id?: number | null
                    variation_id?: number | null
                    url: string
                    is_primary?: boolean
                    created_at?: string
                }
                Update: {
                    id?: number
                    product_id?: number | null
                    variation_id?: number | null
                    url?: string
                    is_primary?: boolean
                    created_at?: string
                }
            }
            collections: {
                Row: {
                    id: number
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    created_at?: string
                }
            }
            collection_products: {
                Row: {
                    id: number
                    collection_id: number // Foreign key referencing collections.id
                    product_id: number // Foreign key referencing products.id
                    created_at: string
                }
                Insert: {
                    id?: number
                    collection_id: number
                    product_id: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    collection_id?: number
                    product_id?: number
                    created_at?: string
                }
            }
        }
    }
}
