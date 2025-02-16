'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { motion } from 'framer-motion'

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
    shipping_duration: number
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
    "Paisley", "Plaid", "Polka Dots", "Solid", "Stars", "Striped", "Tie-Dye",
];

const occasionOptions = ["Festival", "Party", "Wedding",];

const careOptions = ["Dry Clean Only", "Hand Wash Only", "Machine Wash",];

const fabricOptions = [
    "Art Silk", "Chiffon", "Cotton", "Cotton Blend", "Crepe", "Georgette", "Linen", "Linen Blend",
    "Net", "Nylon", "Organza", "Polycotton", "Polyester", "Rayon", "Satin", "Silk", "Silk Blend",
    "Tissue", "Velvet",
];

const dimensionsPreset = "Saree Length: 5.5 meters plus 0.8 meters(80 cm)blouse piece, Width: 1 metres";

const SelectWithCustomInput = ({
    label,
    options,
    value,
    onChange,
    id,
    placeholder
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    id: string;
    placeholder: string;
}) => {
    const [useCustomValue, setUseCustomValue] = useState(false);
    const [customValue, setCustomValue] = useState('');

    React.useEffect(() => {
        if (useCustomValue) {
            onChange(customValue);
        } else {
            onChange('');
        }
    }, [useCustomValue]);

    return (
        <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={`custom-${id}`}
                    checked={useCustomValue}
                    onCheckedChange={(checked) => setUseCustomValue(checked as boolean)}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor={`custom-${id}`} className="text-sm font-medium text-gray-300">
                    Use custom {label.toLowerCase()}
                </Label>
            </div>

            <motion.div
                initial={false}
                animate={{ height: "auto" }}
                transition={{ duration: 0.2 }}
            >
                {useCustomValue ? (
                    <Input
                        value={customValue}
                        onChange={(e) => {
                            setCustomValue(e.target.value);
                            onChange(e.target.value);
                        }}
                        placeholder={`Enter custom ${label.toLowerCase()}`}
                        className="focus:ring-blue-500 focus:border-blue-500 bg-gray-800 border-gray-700 text-gray-100"
                    />
                ) : (
                    <Select
                        value={value}
                        onValueChange={onChange}
                    >
                        <SelectTrigger id={id} className="w-full focus:ring-blue-500 bg-gray-800 border-gray-700 text-gray-100">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            {options.map((option) => (
                                <SelectItem key={option} value={option} className="text-gray-100 focus:bg-gray-700">
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </motion.div>
        </motion.div>
    );
};

export function ProductForm({ mode, product, categories, onProductChange }: ProductFormProps) {
    const isEditMode = mode === 'edit';

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="border-0 shadow-lg bg-gray-800/80 backdrop-blur-sm border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-gray-100">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-medium text-gray-300">Category</Label>
                                <Select
                                    value={product?.category_id.toString()}
                                    onValueChange={(value) => onProductChange('category_id', parseInt(value))}
                                >
                                    <SelectTrigger id="category" className="w-full focus:ring-blue-500 bg-gray-800 border-gray-700 text-gray-100">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()} className="text-gray-100 focus:bg-gray-700">
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-300">Product Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter product name"
                                    value={product?.name || ''}
                                    onChange={(e) => onProductChange('name', e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 bg-gray-800 border-gray-700 text-gray-100"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium text-gray-300">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter product description"
                                value={product?.description || ''}
                                onChange={(e) => onProductChange('description', e.target.value)}
                                className="min-h-[100px] focus:ring-blue-500 focus:border-blue-500 bg-gray-800 border-gray-700 text-gray-100"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-sm font-medium text-gray-300">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="Enter price"
                                    value={product?.price?.toString() || ''}
                                    onChange={(e) => onProductChange('price', parseFloat(e.target.value) || 0)}
                                    className="focus:ring-blue-500 focus:border-blue-500 bg-gray-800 border-gray-700 text-gray-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku" className="text-sm font-medium text-gray-300">SKU</Label>
                                <Input
                                    id="sku"
                                    placeholder="Enter SKU"
                                    value={product?.sku || ''}
                                    onChange={(e) => onProductChange('sku', e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 bg-gray-800 border-gray-700 text-gray-100"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card className="border-0 shadow-lg bg-gray-800/80 backdrop-blur-sm border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-gray-100">Product Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <SelectWithCustomInput
                            label="Pattern"
                            options={patternOptions}
                            value={product?.pattern || ''}
                            onChange={(value) => onProductChange('pattern', value)}
                            id="pattern"
                            placeholder="Select pattern"
                        />

                        <div className="space-y-2">
                            <Label htmlFor="shipping_duration" className="text-sm font-medium text-gray-300">
                                Shipping Duration (days)
                            </Label>
                            <Input
                                id="shipping_duration"
                                type="number"
                                value={product?.shipping_duration || 2}
                                onChange={(e) => onProductChange('shipping_duration', parseInt(e.target.value))}
                                className="focus:ring-blue-500 focus:border-blue-500 bg-gray-800 border-gray-700 text-gray-100"
                                min={1}
                            />
                        </div>

                        <SelectWithCustomInput
                            label="Occasion"
                            options={occasionOptions}
                            value={product?.occasion || ''}
                            onChange={(value) => onProductChange('occasion', value)}
                            id="occasion"
                            placeholder="Select occasion"
                        />

                        <SelectWithCustomInput
                            label="Fabric"
                            options={fabricOptions}
                            value={product?.fabric || ''}
                            onChange={(value) => onProductChange('fabric', value)}
                            id="fabric"
                            placeholder="Select fabric"
                        />

                        <div className="space-y-2">
                            <Label htmlFor="net_quantity" className="text-sm font-medium text-gray-300">Net Quantity</Label>
                            <Input
                                id="net_quantity"
                                type="number"
                                placeholder="Enter net quantity"
                                value={product?.net_quantity?.toString() || ''}
                                onChange={(e) => onProductChange('net_quantity', parseInt(e.target.value) || 1)}
                                className="focus:ring-blue-500 focus:border-blue-500 bg-gray-800 border-gray-700 text-gray-100"
                                min={1}
                            />
                        </div>

                        <SelectWithCustomInput
                            label="Wash Care Instructions"
                            options={careOptions}
                            value={product?.wash_care_instruction || ''}
                            onChange={(value) => onProductChange('wash_care_instruction', value)}
                            id="wash_care"
                            placeholder="Select wash care instruction"
                        />

                        <SelectWithCustomInput
                            label="Dimensions"
                            options={[dimensionsPreset]}
                            value={product?.dimensions || ''}
                            onChange={(value) => onProductChange('dimensions', value)}
                            id="dimensions"
                            placeholder="Select dimensions"
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
