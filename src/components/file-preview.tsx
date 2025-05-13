import { File, Image as ImageIcon, FileText } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

interface FilePreviewProps {
  file: {
    name: string;
    url: string;
    size: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
  const isPDF = /\.pdf$/i.test(file.name);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={file.name}>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {isImage ? (
          <div className="space-y-2">
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full h-auto rounded-lg"
            />
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <ImageIcon size={16} />
              <span>{file.name}</span>
              <span>({formatBytes(parseInt(file.size))})</span>
            </div>
          </div>
        ) : isPDF ? (
          <div className="space-y-2">
            <iframe
              src={file.url}
              className="w-full h-[500px] rounded-lg"
              title={file.name}
            />
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FileText size={16} />
              <span>{file.name}</span>
              <span>({formatBytes(parseInt(file.size))})</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4">
            <File size={48} className="text-gray-400" />
            <div className="space-y-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatBytes(parseInt(file.size))}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
} 