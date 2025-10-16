'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCreateCategory, useUpdateCategory } from '@/lib/hooks/useCategories';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/types';

const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters'),
  definition: z.string()
    .min(1, 'Definition is required')
    .max(500, 'Definition must be less than 500 characters'),
});

type CategoryForm = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      definition: '',
    },
  });

  const nameValue = watch('name');
  const definitionValue = watch('definition');

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        setValue('name', category.name);
        setValue('definition', category.definition);
        setKeywords(category.keywords);
      } else {
        reset();
        setKeywords([]);
      }
      setKeywordInput('');
    }
  }, [open, category, setValue, reset]);

  const addKeyword = () => {
    const trimmedKeyword = keywordInput.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
      setKeywords([...keywords, trimmedKeyword]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const onSubmit = async (data: CategoryForm) => {
    setIsSubmitting(true);
    
    try {
      if (category) {
        // Update existing category
        const updateData: UpdateCategoryData = {
          name: data.name,
          definition: data.definition,
          keywords: keywords,
        };
        await updateCategory.mutateAsync({ id: category.id, data: updateData });
        toast.success('Category updated successfully!');
      } else {
        // Create new category
        const createData: CreateCategoryData = {
          name: data.name,
          definition: data.definition,
          keywords: keywords,
        };
        await createCategory.mutateAsync(createData);
        toast.success('Category created successfully!');
      }
      
      reset();
      setKeywords([]);
      setKeywordInput('');
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : `Failed to ${category ? 'update' : 'create'} category. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setKeywords([]);
      setKeywordInput('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <label 
              htmlFor="name" 
              className="text-sm font-medium text-slate-200"
            >
              Category Name *
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Climate Change"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-blue-500"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
            <p className="text-xs text-slate-500">
              {nameValue?.length || 0}/100 characters
            </p>
          </div>

          {/* Definition */}
          <div className="space-y-2">
            <label 
              htmlFor="definition" 
              className="text-sm font-medium text-slate-200"
            >
              Definition *
            </label>
            <Textarea
              id="definition"
              {...register('definition')}
              placeholder="Describe what articles belong in this category..."
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 min-h-[80px]"
              disabled={isSubmitting}
            />
            {errors.definition && (
              <p className="text-sm text-red-400">{errors.definition.message}</p>
            )}
            <p className="text-xs text-slate-500">
              {definitionValue?.length || 0}/500 characters
            </p>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Keywords
            </label>
            <div className="flex space-x-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a keyword..."
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-blue-500"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                onClick={addKeyword}
                disabled={!keywordInput.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="icon"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Display keywords as badges */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-slate-700 text-slate-200 hover:bg-slate-600"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 hover:text-red-400"
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {category ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
