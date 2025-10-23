'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog';
import { useCategories, useDeleteCategory, useUpdateCategory, useReorderCategories } from '@/lib/hooks/useCategories';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Category } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CategoriesPage() {
  const [showInactive, setShowInactive] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: categories = [], isLoading } = useCategories(showInactive);
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  const reorderCategories = useReorderCategories();

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c.id));
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsAddDialogOpen(true);
  };

  const handleEditCategoryFromList = (category: Category) => {
    setEditingCategory(category);
  };

  const handleReactivateCategory = async (category: Category) => {
    try {
      await updateCategory.mutateAsync({ id: category.id, data: { isActive: true } });
      toast.success(`Successfully reactivated "${category.name}"`);
    } catch (error) {
      toast.error('Failed to reactivate category. Please try again.');
      console.error('Reactivate error:', error);
    }
  };

  const handleCloseFormDialog = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setEditingCategory(null);
    }
  };

  const handleReorder = async (reorderedCategories: Category[]) => {
    try {
      const categoryOrders = reorderedCategories.map((category, index) => ({
        id: category.id,
        sortOrder: index,
      }));

      await reorderCategories.mutateAsync({ categoryOrders });
      toast.success('Categories reordered successfully!');
    } catch (error) {
      toast.error('Failed to reorder categories. Please try again.');
      console.error('Reorder error:', error);
    }
  };

  const handleBulkDeactivate = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleBulkReactivate = async () => {
    try {
      let successCount = 0;
      let failureCount = 0;

      for (const categoryId of selectedCategories) {
        try {
          await updateCategory.mutateAsync({ id: categoryId, data: { isActive: true } });
          successCount++;
        } catch (error) {
          failureCount++;
          console.error(`Failed to reactivate category ${categoryId}:`, error);
        }
      }

      if (successCount > 0 && failureCount === 0) {
        toast.success(`Successfully reactivated ${successCount} categor${successCount > 1 ? 'ies' : 'y'}`);
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(`Reactivated ${successCount} categor${successCount > 1 ? 'ies' : 'y'}, failed to reactivate ${failureCount}`);
      } else {
        toast.error(`Failed to reactivate all ${failureCount} categor${failureCount > 1 ? 'ies' : 'y'}`);
      }

      setSelectedCategories([]);
    } catch (error) {
      toast.error('Failed to reactivate categories. Please try again.');
      console.error('Bulk reactivate error:', error);
    }
  };

  const confirmBulkDeactivate = async () => {
    try {
      let successCount = 0;
      let failureCount = 0;

      for (const categoryId of selectedCategories) {
        try {
          await deleteCategory.mutateAsync(categoryId);
          successCount++;
        } catch (error) {
          failureCount++;
          console.error(`Failed to deactivate category ${categoryId}:`, error);
        }
      }

      if (successCount > 0 && failureCount === 0) {
        toast.success(`Successfully deactivated ${successCount} categor${successCount > 1 ? 'ies' : 'y'}`);
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(`Deactivated ${successCount} categor${successCount > 1 ? 'ies' : 'y'}, failed to deactivate ${failureCount}`);
      } else {
        toast.error(`Failed to deactivate all ${failureCount} categor${failureCount > 1 ? 'ies' : 'y'}`);
      }

      setSelectedCategories([]);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to deactivate categories. Please try again.');
      console.error('Bulk deactivate error:', error);
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-slate-950">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-100 mb-2">Categories</h2>
            <p className="text-slate-400">
              Organize your articles with custom categories. Drag to reorder, edit definitions, and manage keywords.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> New Category
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive" className="text-slate-300">
                Show inactive categories
              </Label>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedCategories.length > 0 && (
                <>
                  {showInactive ? (
                    <Button
                      onClick={handleBulkReactivate}
                      variant="outline"
                      className="text-green-400 border-green-600 hover:bg-green-500/10"
                      disabled={updateCategory.isPending}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reactivate Selected ({selectedCategories.length})
                    </Button>
                  ) : (
                    <Button
                      onClick={handleBulkDeactivate}
                      variant="outline"
                      className="text-red-400 border-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deactivate Selected ({selectedCategories.length})
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Category List */}
        <CategoryList
          categories={categories}
          selectedCategories={selectedCategories}
          onSelectionChange={setSelectedCategories}
          onEdit={handleEditCategoryFromList}
          onReorder={handleReorder}
          onReactivate={handleReactivateCategory}
          isLoading={isLoading}
          showInactive={showInactive}
        />

        {/* Floating Action Bar */}
        {selectedCategories.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 shadow-lg flex items-center space-x-4">
              <span className="text-slate-300 text-sm">{selectedCategories.length} selected</span>
              {showInactive ? (
                <Button
                  onClick={handleBulkReactivate}
                  variant="outline"
                  className="text-green-400 border-green-600 hover:bg-green-500/10"
                  disabled={updateCategory.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reactivate Selected
                </Button>
              ) : (
                <Button
                  onClick={handleBulkDeactivate}
                  variant="outline"
                  className="text-red-400 border-red-600 hover:bg-red-500/10"
                  disabled={deleteCategory.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deactivate Selected
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedCategories([])}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Category Dialog */}
      <CategoryFormDialog
        open={isAddDialogOpen || !!editingCategory}
        onOpenChange={handleCloseFormDialog}
        category={editingCategory}
      />

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">
              Deactivate {selectedCategories.length} Categor{selectedCategories.length > 1 ? 'ies' : 'y'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              This will deactivate the selected categor{selectedCategories.length > 1 ? 'ies' : 'y'}. 
              They will be hidden from the main list but can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-slate-300 border-slate-600 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDeactivate}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </ProtectedRoute>
  );
}
