'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';
import { Edit, GripVertical, RotateCcw } from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
  selectedCategories: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onEdit: (category: Category) => void;
  onReorder: (categories: Category[]) => void;
  onReactivate?: (category: Category) => void;
  isLoading?: boolean;
  showInactive?: boolean;
}

interface SortableCategoryItemProps {
  category: Category;
  isSelected: boolean;
  onSelect: (categoryId: string, checked: boolean) => void;
  onEdit: (category: Category) => void;
  onReactivate?: (category: Category) => void;
  showInactive?: boolean;
}

function SortableCategoryItem({ 
  category, 
  isSelected, 
  onSelect, 
  onEdit,
  onReactivate,
  showInactive = false
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-slate-900/40 border transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-slate-800/20 hover:border-slate-700/40'
      } ${
        isDragging ? 'opacity-50' : ''
      } ${
        !category.isActive ? 'opacity-60' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-300"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(category.id, checked as boolean)}
              aria-label={`Select ${category.name}`}
            />
          </div>

          {/* Category Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-medium text-slate-100 truncate">
                    {category.name}
                  </h3>
                  {!category.isActive && (
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      Inactive
                    </Badge>
                  )}
                </div>
                
                <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                  {category.definition}
                </p>

                {/* Keywords */}
                {category.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {category.keywords.slice(0, 5).map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-slate-800 text-slate-300 border-slate-600"
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {category.keywords.length > 5 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-slate-800 text-slate-400 border-slate-600"
                      >
                        +{category.keywords.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1">
                {!category.isActive && showInactive && onReactivate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-green-400 hover:bg-green-500/10"
                    onClick={() => onReactivate(category)}
                    title="Reactivate category"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                  onClick={() => onEdit(category)}
                  title="Edit category"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CategoryList({
  categories,
  selectedCategories,
  onSelectionChange,
  onEdit,
  onReorder,
  onReactivate,
  isLoading = false,
  showInactive = false,
}: CategoryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex((category) => category.id === active.id);
      const newIndex = categories.findIndex((category) => category.id === over?.id);

      const reorderedCategories = arrayMove(categories, oldIndex, newIndex);
      onReorder(reorderedCategories);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedCategories, categoryId]);
    } else {
      onSelectionChange(selectedCategories.filter(id => id !== categoryId));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="bg-slate-900/40 border-slate-800/20">
            <div className="p-4">
              <div className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-slate-700 rounded"></div>
                  <div className="w-4 h-4 bg-slate-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-700 rounded mb-2 w-1/3"></div>
                    <div className="h-4 bg-slate-700 rounded mb-2 w-2/3"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <Card className="bg-slate-900/40 border-slate-800/20">
        <div className="p-8 text-center">
          <p className="text-slate-400 mb-2">No categories found</p>
          <p className="text-slate-500 text-sm">
            Create your first category to get started organizing your articles.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categories.map(c => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {categories.map((category) => (
            <SortableCategoryItem
              key={category.id}
              category={category}
              isSelected={selectedCategories.includes(category.id)}
              onSelect={handleSelectCategory}
              onEdit={onEdit}
              onReactivate={onReactivate}
              showInactive={showInactive}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
