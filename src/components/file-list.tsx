import { File, ChevronDown, ChevronRight, Pencil, Trash, Folder, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

interface FileItem {
  id: number;
  name: string;
  url: string;
  size: string;
  folderId: number | null;
  userId: string;
  isTrash: boolean;
  createdAt: string;
}

interface Folder {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

interface FileListProps {
  files: FileItem[];
  folders: Folder[];
  expandedFolders: Set<number>;
  onToggleFolder: (folderId: number) => void;
  onRenameFile: (file: FileItem) => void;
  onDeleteFile: (file: FileItem) => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onFileClick: (file: FileItem) => void;
  isTrashView: boolean;
  onRestore?: (file: FileItem) => void;
  onPermanentDelete?: (file: FileItem) => void;
  onBackToHome?: () => void;
}

export function FileList({
  files,
  folders,
  expandedFolders,
  onToggleFolder,
  onRenameFile,
  onDeleteFile,
  onRenameFolder,
  onDeleteFolder,
  onFileClick,
  isTrashView,
  onRestore,
  onPermanentDelete,
  onBackToHome,
}: FileListProps) {
  const getFolderFiles = (folderId: number | null) => {
    return files.filter(file => file.folderId === folderId);
  };

  return (
    <div className="space-y-4">
      {/* Root Files */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isTrashView ? "Trash" : "Root Directory"}
          </h2>
          {isTrashView && onBackToHome && (
            <Button
              variant="outline"
              onClick={onBackToHome}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          )}
        </div>
        {getFolderFiles(null).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <File size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {isTrashView ? "No files in trash" : "No files in root"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {getFolderFiles(null).map((file) => (
              <li
                key={file.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 gap-2"
              >
                <div className="flex items-center gap-2">
                  <File size={20} />
                  <button
                    onClick={() => onFileClick(file)}
                    className="text-sm hover:underline text-left"
                  >
                    {file.name}
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{formatBytes(parseInt(file.size))}</span>
                  {isTrashView ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRestore?.(file)}
                        className="text-green-500"
                      >
                        <RotateCcw size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPermanentDelete?.(file)}
                        className="text-red-500"
                      >
                        <Trash size={18} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => onRenameFile(file)}>
                        <Pencil className="text-blue-500" size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteFile(file)}>
                        <Trash className="text-red-500" size={18} />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Folders with their files */}
      {!isTrashView && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Folders</h2>
          {folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Folder size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No folders yet</p>
              <p className="text-sm text-gray-400 mt-2">Create your first folder to get started</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {folders.map((folder) => {
                const folderFiles = getFolderFiles(folder.id);
                const isExpanded = expandedFolders.has(folder.id);
                
                return (
                  <li key={folder.id} className="space-y-1">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleFolder(folder.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <Folder size={20} />
                        <span className="text-sm">{folder.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRenameFolder(folder)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => onDeleteFolder(folder)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Folder Files */}
                    {isExpanded && (
                      <div className="ml-8 space-y-2">
                        {folderFiles.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                            No files in this folder
                          </p>
                        ) : (
                          folderFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <File size={20} />
                                <button
                                  onClick={() => onFileClick(file)}
                                  className="text-sm hover:underline"
                                >
                                  {file.name}
                                </button>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                  {formatBytes(parseInt(file.size))}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => onRenameFile(file)}>
                                  <Pencil className="text-blue-500" size={18} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDeleteFile(file)}>
                                  <Trash className="text-red-500" size={18} />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 