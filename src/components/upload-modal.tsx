import { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Folder, Upload } from "lucide-react";

interface Folder {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onUpload: (file: globalThis.File, folderId?: number) => Promise<void>;
}

export function UploadModal({ isOpen, onClose, folders, onUpload }: UploadModalProps) {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      await onUpload(files[0], selectedFolder || undefined);
      onClose();
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload File">
      <div className="mt-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Folder (Optional)
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1">
            <div
              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                selectedFolder === null ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSelectedFolder(null)}
            >
              <Folder size={20} className="text-gray-500" />
              <span className="text-sm">Root Directory</span>
            </div>
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                  selectedFolder === folder.id ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <Folder size={20} className="text-blue-500" />
                <span className="text-sm">{folder.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleUploadClick}
            className="flex gap-2 w-full justify-center items-center"
          >
            <Upload size={18} /> Select File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
} 