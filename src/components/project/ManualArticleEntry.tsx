'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';

const manualEntrySchema = z.object({
  source: z.string().min(1, 'Source is required'),
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  body: z.string().min(10, 'Article body must be at least 10 characters'),
  publishDate: z.string().min(1, 'Publish date is required'),
});

type ManualEntryForm = z.infer<typeof manualEntrySchema>;

interface ManualArticleEntryProps {
  onArticleAdded: (article: ManualEntryForm) => void;
  disabled?: boolean;
}

export function ManualArticleEntry({ onArticleAdded, disabled }: ManualArticleEntryProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ManualEntryForm>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      source: '',
      title: '',
      author: '',
      url: '',
      body: '',
      publishDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: ManualEntryForm) => {
    onArticleAdded(data);
    reset({
      source: '',
      title: '',
      author: '',
      url: '',
      body: '',
      publishDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Source */}
        <div className="space-y-2">
          <Label htmlFor="source" className="text-slate-200">
            Source <span className="text-red-400">*</span>
          </Label>
          <Input
            id="source"
            {...register('source')}
            placeholder="e.g., The Guardian, Reuters"
            disabled={disabled}
            className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400"
          />
          {errors.source && (
            <p className="text-sm text-red-400">{errors.source.message}</p>
          )}
        </div>

        {/* Publish Date */}
        <div className="space-y-2">
          <Label htmlFor="publishDate" className="text-slate-200">
            Publish Date <span className="text-red-400">*</span>
          </Label>
          <Input
            id="publishDate"
            type="date"
            {...register('publishDate')}
            disabled={disabled}
            className="bg-slate-800 border-slate-700 text-slate-100"
          />
          {errors.publishDate && (
            <p className="text-sm text-red-400">{errors.publishDate.message}</p>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-slate-200">
          Article Title <span className="text-red-400">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter article title"
          disabled={disabled}
          className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400"
        />
        {errors.title && (
          <p className="text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Author */}
        <div className="space-y-2">
          <Label htmlFor="author" className="text-slate-200">
            Author (Optional)
          </Label>
          <Input
            id="author"
            {...register('author')}
            placeholder="Author name"
            disabled={disabled}
            className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400"
          />
          {errors.author && (
            <p className="text-sm text-red-400">{errors.author.message}</p>
          )}
        </div>

        {/* URL */}
        <div className="space-y-2">
          <Label htmlFor="url" className="text-slate-200">
            Article URL (Optional)
          </Label>
          <Input
            id="url"
            type="url"
            {...register('url')}
            placeholder="https://..."
            disabled={disabled}
            className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400"
          />
          {errors.url && (
            <p className="text-sm text-red-400">{errors.url.message}</p>
          )}
        </div>
      </div>

      {/* Article Body */}
      <div className="space-y-2">
        <Label htmlFor="body" className="text-slate-200">
          Article Body Text <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="body"
          {...register('body')}
          placeholder="Paste or type the full article text here..."
          disabled={disabled}
          className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 min-h-[200px]"
        />
        {errors.body && (
          <p className="text-sm text-red-400">{errors.body.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={disabled}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Add Article
        </Button>
      </div>
    </form>
  );
}

