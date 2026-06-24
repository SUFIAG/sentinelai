'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { transactionsApi, BulkUploadResult } from '@/lib/api/transactions';
import { useToast } from '@/lib/hooks/useToast';

interface UploadZoneProps {
  onUploadComplete?: (result: BulkUploadResult) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadComplete }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setUploadResult(null);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress (in production, use actual upload progress)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await transactionsApi.uploadCSV(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);

      toast({
        title: 'Upload Successful',
        description: `Processed ${result.successCount} of ${result.totalRecords} transactions.`,
      });

      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload transactions.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setUploadProgress(0);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Drop Zone */}
        {!file && !uploadResult && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center transition-all
              ${
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface/50 hover:border-primary/50'
              }
            `}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Upload Transaction CSV</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop your CSV file here, or click to browse
                </p>
              </div>
              <Button variant="outline" size="sm">
                Select File
              </Button>
            </div>
          </div>
        )}

        {/* File Selected */}
        {file && !uploadResult && (
          <div className="space-y-4">
            <Card className="p-4 bg-surface/50 border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" disabled={uploading} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                {uploading ? 'Uploading...' : 'Upload & Process'}
              </Button>
            </div>
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div className="space-y-4">
            <Card className="p-6 bg-green-500/10 border-green-500/30">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-400">Upload Successful!</h3>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Records</p>
                      <p className="text-2xl font-bold">{uploadResult.totalRecords}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Successful</p>
                      <p className="text-2xl font-bold text-green-400">{uploadResult.successCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold text-red-400">{uploadResult.failureCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <Card className="p-4 bg-red-500/10 border-red-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-400 mb-2">Errors</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          Row {error.row}: {error.error}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Button onClick={handleReset} variant="outline" className="w-full">
              Upload Another File
            </Button>
          </div>
        )}

        {/* CSV Format Help */}
        <Card className="p-4 bg-surface/30 border-border/50">
          <h4 className="text-sm font-semibold mb-2">CSV Format Requirements</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Required columns:</strong> transactionId, timestamp, amount, currency, userId, merchantId</li>
            <li>• <strong>Optional columns:</strong> merchantName, ipAddress, deviceId, paymentMethod</li>
            <li>• <strong>Date format:</strong> ISO 8601 (YYYY-MM-DDTHH:mm:ss)</li>
            <li>• <strong>Max file size:</strong> 50 MB</li>
          </ul>
        </Card>
      </div>
    </Card>
  );
};

