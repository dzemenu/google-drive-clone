import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle } from "lucide-react";
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
      onClose();
    } catch (error) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload File">
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
                    <p className="font-medium">{selectedFile.name}</p>
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
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
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