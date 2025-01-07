'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type Product = {
    id: number;
    category_id: number;
    name: string;
    description: string | "";
    price: number;
    sku: string | null;
    pattern: string | null;
    occasion: string | null;
    fabric: string | null;
    net_quantity: number;
    wash_care_instruction: string | null;
    dimensions: string | null;
};

type Category = {
    id: number;
    name: string;
};

type ProductFormProps = {
    mode: 'create' | 'edit';
    product: Product | null;
    categories: Category[];
    onProductChange: (field: keyof Product, value: any) => void;
};

const patternOptions = [
    "Animal Print", "Argyle", "Camouflage", "Cartoon", "Checkered", "Chevron", "Floral", "Fruits",
    "Geometric", "Hearts", "Herringbone", "Houndstooth", "Leaf", "Letter Print", "Marble", "Moire",
    "Paisley", "Plaid", "Polka Dots", "Solid", "Stars", "Striped", "Tie-Dye", "Custom"
];

const occasionOptions = ["Festival", "Party", "Wedding", "Custom"];

const careOptions = ["Dry Clean Only", "Hand Wash Only", "Machine Wash", "Custom"];

const fabricOptions = [
    "Art Silk", "Chiffon", "Cotton", "Cotton Blend", "Crepe", "Georgette", "Linen", "Linen Blend",
    "Net", "Nylon", "Organza", "Polycotton", "Polyester", "Rayon", "Satin", "Silk", "Silk Blend",
    "Tissue", "Velvet", "Custom"
];

const dimensionsPreset = "Saree Length: 5.5 meters plus 0.8 meters(80 cm)blouse piece, Width: 1 metres";

export function ProductForm({ mode, product, categories, onProductChange }: ProductFormProps) {
    const isEditMode = mode === 'edit';

    return (
        <Card>
            <Card>
                <CardHeader className='text-2xl font-bold'>Basic Info</CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={product?.category_id.toString()}
                                onValueChange={(value) => onProductChange('category_id', parseInt(value))}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                placeholder="Product name"
                                value={product?.name || ''}
                                onChange={(e) => onProductChange('name', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Description"
                            value={product?.description || ''}
                            onChange={(e) => onProductChange('description', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="Price"
                                value={product?.price?.toString() || ''}
                                onChange={(e) => onProductChange('price', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                placeholder="SKU"
                                value={product?.sku || ''}
                                onChange={(e) => onProductChange('sku', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
            <CardHeader className='text-2xl font-bold'>Details</CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1">
                        <div className="space-y-2">
                            <Label htmlFor="pattern">Pattern</Label>
                            <Select
                                value={product?.pattern || ''}
                                onValueChange={(value) => onProductChange('pattern', value)}
                            >
                                <SelectTrigger id="pattern">
                                    <SelectValue placeholder="Select pattern" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patternOptions.map((pattern) => (
                                        <SelectItem key={pattern} value={pattern}>
                                            {pattern}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {product?.pattern === 'Custom' && (
                                <Input
                                    id="custom_pattern"
                                    placeholder="Enter custom pattern"
                                    value={product?.pattern === 'Custom' ? '' : product?.pattern || ''}
                                    onChange={(e) => onProductChange('pattern', e.target.value)}
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="occasion">Occasion</Label>
                            <Select
                                value={product?.occasion || ''}
                                onValueChange={(value) => onProductChange('occasion', value)}
                            >
                                <SelectTrigger id="occasion">
                                    <SelectValue placeholder="Select occasion" />
                                </SelectTrigger>
                                <SelectContent>
                                    {occasionOptions.map((occasion) => (
                                        <SelectItem key={occasion} value={occasion}>
                                            {occasion}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {product?.occasion === 'Custom' && (
                                <Input
                                    id="custom_occasion"
                                    placeholder="Enter custom occasion"
                                    value={product?.occasion === 'Custom' ? '' : product?.occasion || ''}
                                    onChange={(e) => onProductChange('occasion', e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1">
                        <div className="space-y-2">
                            <Label htmlFor="fabric">Fabric</Label>
                            <Select
                                value={product?.fabric || ''}
                                onValueChange={(value) => onProductChange('fabric', value)}
                            >
                                <SelectTrigger id="fabric">
                                    <SelectValue placeholder="Select fabric" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fabricOptions.map((fabric) => (
                                        <SelectItem key={fabric} value={fabric}>
                                            {fabric}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {product?.fabric === 'Custom' && (
                                <Input
                                    id="custom_fabric"
                                    placeholder="Enter custom fabric"
                                    value={product?.fabric === 'Custom' ? '' : product?.fabric || ''}
                                    onChange={(e) => onProductChange('fabric', e.target.value)}
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="net_quantity">Net Quantity</Label>
                            <Input
                                id="net_quantity"
                                type="number"
                                placeholder="Net Quantity"
                                value={product?.net_quantity?.toString() || ''}
                                onChange={(e) => onProductChange('net_quantity', parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wash_care">Wash Care Instructions</Label>
                        <Select
                            value={product?.wash_care_instruction || ''}
                            onValueChange={(value) => onProductChange('wash_care_instruction', value)}
                        >
                            <SelectTrigger id="wash_care">
                                <SelectValue placeholder="Select wash care instruction" />
                            </SelectTrigger>
                            <SelectContent>
                                {careOptions.map((care) => (
                                    <SelectItem key={care} value={care}>
                                        {care}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {product?.wash_care_instruction === 'Custom' && (
                            <Input
                                id="custom_wash_care"
                                placeholder="Enter custom wash care instruction"
                                value={product?.wash_care_instruction === 'Custom' ? '' : product?.wash_care_instruction || ''}
                                onChange={(e) => onProductChange('wash_care_instruction', e.target.value)}
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dimensions">Dimensions</Label>
                        <Select
                            value={product?.dimensions || ''}
                            onValueChange={(value) => onProductChange('dimensions', value)}
                        >
                            <SelectTrigger id="dimensions">
                                <SelectValue placeholder="Select dimensions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={dimensionsPreset}>{dimensionsPreset}</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        {product?.dimensions === 'custom' && (
                            <Input
                                id="custom_dimensions"
                                placeholder="Enter custom dimensions"
                                value={product?.dimensions === 'custom' ? '' : product?.dimensions || ''}
                                onChange={(e) => onProductChange('dimensions', e.target.value)}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </Card>
    )
}

