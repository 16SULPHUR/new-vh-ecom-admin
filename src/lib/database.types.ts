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
                    created_at: string
                }
                Insert: {
                    id?: number
                    category_id: number
                    name: string
                    description?: string | null
                    price: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    category_id?: number
                    name?: string
                    description?: string | null
                    price?: number
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
        }
    }
}

