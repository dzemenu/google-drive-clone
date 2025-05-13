import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

interface Folder {
  id: number;
  name: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onUploadComplete?: () => void;
}

export function UploadModal({ isOpen, onClose, folders, onUploadComplete }: UploadModalProps) {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { getToken } = useAuth();

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing("fileUploader", {
    onClientUploadComplete: async (res) => {
      if (res) {
        const file = res[0];
        try {
          const token = await getToken();
          // Create file record in database with folder assignment
          const response = await fetch("/api/files", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: file.name,
              url: file.url,
              size: file.size.toString(),
              folderId: selectedFolder,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Failed to create file record" }));
            throw new Error(errorData.error || "Failed to create file record");
          }

          const data = await response.json();
          console.log("File created successfully:", data);

          toast.success("File uploaded successfully");
          handleClose();
          onUploadComplete?.();
        } catch (error) {
          console.error("Error creating file record:", error);
          setError(error instanceof Error ? error.message : 'Failed to create file record');
          toast.error("Failed to create file record");
        }
      }
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      setError(error.message);
      toast.error(error.message);
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setError(null);
        setIsUploading(true);
        try {
          console.log("Starting file upload...");
          await startUpload(acceptedFiles);
        } catch (error) {
          console.error("Error in file upload:", error);
          setError(error instanceof Error ? error.message : 'Failed to upload file');
          toast.error("Failed to upload file");
        } finally {
          setIsUploading(false);
        }
      }
    },
    maxSize: 8 * 1024 * 1024, // 8MB
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md', '.json', '.csv'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const resetState = () => {
    setSelectedFolder(null);
    setError(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
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

        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium mb-2">Select File</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-1">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                {isDragActive ? "Drop the file here" : "Drag & drop or click to select a file"}
              </p>
              <p className="text-xs text-gray-400">
                Max size: 8MB
              </p>
            </div>
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
            onClick={() => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              input?.click();
            }}
            disabled={isUploading || isUploadThingUploading}
          >
            {isUploading || isUploadThingUploading ? "Uploading..." : "Select File"}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 