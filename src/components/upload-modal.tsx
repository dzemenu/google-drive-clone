import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, X } from "lucide-react";
import { validateFile, formatBytes, MAX_FILE_SIZE } from "@/lib/utils";

interface Folder {
  id: number;
  name: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onUpload: (file: File, folderId?: number) => Promise<void>;
}

export function UploadModal({ isOpen, onClose, folders, onUpload }: UploadModalProps) {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setSelectedFile(null);
    setError(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);
      await onUpload(selectedFile, selectedFolder || undefined);
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload File">
      <div className="space-y-4">
        {/* Folder Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Folder</label>
          <select
            value={selectedFolder || ""}
            onChange={(e) => setSelectedFolder(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded border p-2 text-sm bg-gray-50 dark:bg-gray-700"
          >
            <option value="">Root Directory</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* File Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select File</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex-1 cursor-pointer"
            >
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700">
                {selectedFile ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{selectedFile.name}</p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                          setError(null);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                      >
                        <X size={16} className="text-gray-500" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Click to select a file
                    </p>
                    <p className="text-xs text-gray-400">
                      Max size: {formatBytes(MAX_FILE_SIZE)}
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 