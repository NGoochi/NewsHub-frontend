'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface PDFUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  isUploading?: boolean;
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  uploadProgress?: number;
  uploadMessage?: string;
  extractedCount?: number;
}

export function PDFUploader({ 
  onFileSelected, 
  disabled, 
  isUploading = false,
  uploadStatus = 'idle',
  uploadProgress = 0,
  uploadMessage,
  extractedCount = 0
}: PDFUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      onFileSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isUploading
            ? 'border-slate-600 bg-slate-800/50'
            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 cursor-pointer'
        }`}
        onClick={() => !isUploading && !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {uploadStatus === 'idle' && !selectedFile && (
          <div className="space-y-3">
            <FileUp className="w-12 h-12 mx-auto text-slate-400" />
            <div>
              <p className="text-slate-200 font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-400 mt-1">Factiva PDF format</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={disabled}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Select PDF File
            </Button>
          </div>
        )}

        {selectedFile && uploadStatus === 'idle' && (
          <div className="space-y-3">
            <FileText className="w-12 h-12 mx-auto text-blue-400" />
            <div>
              <p className="text-slate-200 font-medium">{selectedFile.name}</p>
              <p className="text-sm text-slate-400 mt-1">{formatFileSize(selectedFile.size)}</p>
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={disabled}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Choose Different File
              </Button>
            </div>
          </div>
        )}

        {uploadStatus === 'uploading' && (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 mx-auto text-blue-400 animate-spin" />
            <div>
              <p className="text-slate-200 font-medium">Processing PDF...</p>
              {selectedFile && <p className="text-sm text-slate-400 mt-1">{selectedFile.name}</p>}
              {uploadMessage && <p className="text-sm text-slate-400 mt-1">{uploadMessage}</p>}
            </div>
            {uploadProgress > 0 && (
              <div className="w-full max-w-xs mx-auto">
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-400 mt-1 text-center">{Math.round(uploadProgress)}% complete</p>
              </div>
            )}
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="space-y-3">
            <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
            <div>
              <p className="text-slate-200 font-medium">Extraction complete!</p>
              {selectedFile && <p className="text-sm text-slate-400 mt-1">{selectedFile.name}</p>}
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-400 text-sm font-medium">
                Successfully extracted {extractedCount} article{extractedCount !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <FileText className="w-4 h-4 mr-2" />
              Upload Another PDF
            </Button>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="space-y-3">
            <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
            <div>
              <p className="text-slate-200 font-medium">Processing failed</p>
              {uploadMessage && <p className="text-sm text-red-400 mt-1">{uploadMessage}</p>}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      {selectedFile && uploadStatus === 'idle' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-300">
            <span className="font-medium">Ready to upload.</span> Click &quot;Start Import&quot; to process this PDF.
          </p>
        </div>
      )}
    </div>
  );
}

