"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { FileList } from "@/components/file-list";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { UploadModal } from "@/components/upload-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { RenameModal } from "@/components/rename-modal";
import { FilePreview } from "@/components/file-preview";

interface Folder {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

interface FileItem {
  id: number;
  name: string;
  url: string;
  size: string;
  folderId: number | null;
  userId: string;
  createdAt: string;
}

export default function Dashboard() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [isDeleteFileModalOpen, setIsDeleteFileModalOpen] = useState(false);
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [isRenameFileModalOpen, setIsRenameFileModalOpen] = useState(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/folders");
      if (!res.ok) {
        throw new Error("Failed to fetch folders");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setFolders(data);
      } else {
        console.error("Invalid folders data format:", data);
        setFolders([]);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/files");
      if (!res.ok) {
        throw new Error("Failed to fetch files");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setFiles(data);
      } else {
        console.error("Invalid files data format:", data);
        setFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, []);

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to create folder:", error);
        return;
      }

      setNewFolderName("");
      setIsAddFolderModalOpen(false);
      await fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleDeleteFile = async (file: FileItem) => {
    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete folder");
      }

      setFolders((prev) => prev.filter((f) => f.id !== folder.id));
      setFiles((prev) => prev.filter((f) => f.folderId !== folder.id));
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  const handleRenameFile = async (newName: string) => {
    if (!fileToRename) return;

    try {
      const response = await fetch(`/api/files/${fileToRename.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename file");
      }

      const updatedFile = await response.json();
      setFiles((prev) =>
        prev.map((file) =>
          file.id === updatedFile.id ? updatedFile : file
        )
      );
      toast.success("File renamed successfully");
      setIsRenameFileModalOpen(false);
      setFileToRename(null);
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Failed to rename file");
    }
  };

  const handleRenameFolder = async (newName: string) => {
    if (!folderToRename) return;

    try {
      const response = await fetch(`/api/folders/${folderToRename.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename folder");
      }

      const updatedFolder = await response.json();
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === updatedFolder.id ? updatedFolder : folder
        )
      );
      toast.success("Folder renamed successfully");
      setIsRenameFolderModalOpen(false);
      setFolderToRename(null);
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onAddFolder={() => setIsAddFolderModalOpen(true)}
        onUpload={() => setIsUploadModalOpen(true)}
      />

      <main className="flex-1 p-4 md:p-6 mt-16 md:mt-0">
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        <div className="rounded-lg shadow-sm bg-white dark:bg-gray-800 p-4">
          {isLoading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : (
            <FileList
              files={files}
              folders={folders}
              expandedFolders={expandedFolders}
              onToggleFolder={toggleFolder}
              onRenameFile={(file) => {
                setFileToRename(file);
                setIsRenameFileModalOpen(true);
              }}
              onDeleteFile={(file) => {
                setFileToDelete(file);
                setIsDeleteFileModalOpen(true);
              }}
              onRenameFolder={(folder) => {
                setFolderToRename(folder);
                setIsRenameFolderModalOpen(true);
              }}
              onDeleteFolder={(folder) => {
                setFolderToDelete(folder);
                setIsDeleteFolderModalOpen(true);
              }}
              onFileClick={setSelectedFile}
            />
          )}
        </div>
      </main>

      {/* Add Folder Modal */}
      <Modal
        isOpen={isAddFolderModalOpen}
        onClose={() => setIsAddFolderModalOpen(false)}
        title="Create New Folder"
      >
        <div className="mt-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter folder name"
            className="w-full rounded border p-2 text-sm bg-gray-50 dark:bg-gray-700"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddFolder();
              }
            }}
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAddFolderModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddFolder}
            disabled={!newFolderName.trim()}
          >
            Create Folder
          </Button>
        </div>
      </Modal>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folders={folders}
      />

      {/* Delete File Modal */}
      <ConfirmModal
        isOpen={isDeleteFileModalOpen}
        onClose={() => {
          setIsDeleteFileModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={() => fileToDelete && handleDeleteFile(fileToDelete)}
        title="Delete File"
        description="Are you sure you want to delete this file? This action cannot be undone."
      />

      {/* Delete Folder Modal */}
      <ConfirmModal
        isOpen={isDeleteFolderModalOpen}
        onClose={() => {
          setIsDeleteFolderModalOpen(false);
          setFolderToDelete(null);
        }}
        onConfirm={() => folderToDelete && handleDeleteFolder(folderToDelete)}
        title="Delete Folder"
        description="Are you sure you want to delete this folder and all its contents? This action cannot be undone."
      />

      {/* Rename File Modal */}
      <RenameModal
        isOpen={isRenameFileModalOpen}
        onClose={() => {
          setIsRenameFileModalOpen(false);
          setFileToRename(null);
        }}
        onRename={handleRenameFile}
        title="Rename File"
        currentName={fileToRename?.name || ""}
        type="file"
      />

      {/* Rename Folder Modal */}
      <RenameModal
        isOpen={isRenameFolderModalOpen}
        onClose={() => {
          setIsRenameFolderModalOpen(false);
          setFolderToRename(null);
        }}
        onRename={handleRenameFolder}
        title="Rename Folder"
        currentName={folderToRename?.name || ""}
        type="folder"
      />

      {/* File Preview Modal */}
      <Modal
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        title={selectedFile?.name || ""}
      >
        {selectedFile && <FilePreview file={selectedFile} />}
      </Modal>
    </div>
  );
}
