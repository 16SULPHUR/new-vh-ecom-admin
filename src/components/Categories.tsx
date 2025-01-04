'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from "@/hooks/use-toast";
import { Database } from '@/lib/database.types'

type Category = Database['public']['Tables']['categories']['Row']

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const { toast } = useToast();
  
  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setCategories(data)
    }
  }

  async function createCategory() {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newCategory })
      .select()

    if (error) {
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setCategories([...categories, data[0]])
      setNewCategory('')
      toast({
        title: "Category created",
        description: "The new category has been added successfully.",
      })
    }
  }

  async function updateCategory(id: number, name: string) {
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)

    if (error) {
      toast({
        title: "Error updating category",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setCategories(categories.map(cat => cat.id === id ? { ...cat, name } : cat))
      setEditingCategory(null)
      toast({
        title: "Category updated",
        description: "The category has been updated successfully.",
      })
    }
  }

  async function deleteCategory(id: number) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setCategories(categories.filter(cat => cat.id !== id))
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Categories</h2>
      <div className="flex space-x-2">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button onClick={createCategory}>Add Category</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                {editingCategory?.id === category.id ? (
                  <Input
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  />
                ) : (
                  category.name
                )}
              </TableCell>
              <TableCell>
                {editingCategory?.id === category.id ? (
                  <Button onClick={() => updateCategory(category.id, editingCategory.name)}>Save</Button>
                ) : (
                  <Button onClick={() => setEditingCategory(category)}>Edit</Button>
                )}
                <Button variant="destructive" onClick={() => deleteCategory(category.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

