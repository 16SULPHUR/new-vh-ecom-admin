import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

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

export function ProductForm({ mode, product, categories, onProductChange }: ProductFormProps) {
  const isEditMode = mode === 'edit';

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      <TabsContent value="basic">
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={product?.category_id.toString()}
                  onValueChange={(value) => onProductChange('category_id', parseInt(value))}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category"/>
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
      </TabsContent>
      <TabsContent value="details">
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pattern">Pattern</Label>
                <Input
                  id="pattern"
                  placeholder="Pattern"
                  value={product?.pattern || ''}
                  onChange={(e) => onProductChange('pattern', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Input
                  id="occasion"
                  placeholder="Occasion"
                  value={product?.occasion || ''}
                  onChange={(e) => onProductChange('occasion', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fabric">Fabric</Label>
                <Input
                  id="fabric"
                  placeholder="Fabric"
                  value={product?.fabric || ''}
                  onChange={(e) => onProductChange('fabric', e.target.value)}
                />
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
              <Textarea
                id="wash_care"
                placeholder="Wash Care Instructions"
                value={product?.wash_care_instruction || ''}
                onChange={(e) => onProductChange('wash_care_instruction', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                placeholder="Dimensions"
                value={product?.dimensions || ''}
                onChange={(e) => onProductChange('dimensions', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

