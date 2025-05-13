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
import { useAuth } from "@clerk/nextjs";

interface File {
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

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [isTrashView, setIsTrashView] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const { getToken } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchFiles();
    fetchFolders();
  }, [isTrashView]);

  const fetchFiles = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/files?showTrash=${isTrashView}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch files" }));
        throw new Error(errorData.error || "Failed to fetch files");
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch files");
    }
  };

  const fetchFolders = async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/folders", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch folders" }));
        throw new Error(errorData.error || "Failed to fetch folders");
      }
      
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch folders");
    }
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (!response.ok) throw new Error("Failed to create folder");
      await fetchFolders();
      setIsAddFolderModalOpen(false);
      setNewFolderName("");
      toast.success("Folder created successfully");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const handleRename = async () => {
    if (!newFileName.trim()) {
      toast.error("Please enter a new name");
      return;
    }

    try {
      if (selectedFile) {
        const response = await fetch(`/api/files`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedFile.id, name: newFileName }),
        });

        if (!response.ok) throw new Error("Failed to rename file");
        await fetchFiles();
      } else if (selectedFolder) {
        const response = await fetch(`/api/folders/${selectedFolder.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newFileName }),
        });

        if (!response.ok) throw new Error("Failed to rename folder");
        await fetchFolders();
      }

      setIsRenameModalOpen(false);
      setNewFileName("");
      setSelectedFile(null);
      setSelectedFolder(null);
      toast.success("Renamed successfully");
    } catch (error) {
      console.error("Error renaming:", error);
      toast.error("Failed to rename");
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedFile) {
        const token = await getToken();
        const response = await fetch(`/api/files?id=${selectedFile.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to delete file");
        await fetchFiles();
        await fetchFolders();
      } else if (selectedFolder) {
        const token = await getToken();
        const response = await fetch(`/api/folders/${selectedFolder.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to delete folder");
        await fetchFolders();
        await fetchFiles();
      }

      setIsDeleteModalOpen(false);
      setSelectedFile(null);
      setSelectedFolder(null);
      toast.success("Deleted successfully");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  const handleRestore = async (file: File) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/files`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ id: file.id, isTrash: false }),
      });

      if (!response.ok) throw new Error("Failed to restore file");
      await fetchFiles();
      await fetchFolders();
      toast.success("File restored successfully");
    } catch (error) {
      console.error("Error restoring file:", error);
      toast.error("Failed to restore file");
    }
  };

  const handlePermanentDelete = async (file: File) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/files?id=${file.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete file permanently");
      await fetchFiles();
      await fetchFolders();
      toast.success("File deleted permanently");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleFileClick = (file: File) => {
    setSelectedFile(file);
    setIsPreviewModalOpen(true);
  };

  const handleToggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        <Sidebar
          onAddFolder={() => setIsAddFolderModalOpen(true)}
          onUpload={() => setIsUploadModalOpen(true)}
          onViewTrash={() => setIsTrashView(!isTrashView)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-8">
          <Header
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
          <div className="mt-8">
            <FileList
              files={files}
              folders={folders}
              expandedFolders={expandedFolders}
              onToggleFolder={handleToggleFolder}
              onRenameFile={(file) => {
                setSelectedFile(file);
                setNewFileName(file.name);
                setIsRenameModalOpen(true);
              }}
              onDeleteFile={(file) => {
                setSelectedFile(file);
                setIsDeleteModalOpen(true);
              }}
              onRenameFolder={(folder) => {
                setSelectedFolder(folder);
                setNewFileName(folder.name);
                setIsRenameModalOpen(true);
              }}
              onDeleteFolder={(folder) => {
                setSelectedFolder(folder);
                setIsDeleteModalOpen(true);
              }}
              onFileClick={handleFileClick}
              isTrashView={isTrashView}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
              onBackToHome={() => setIsTrashView(false)}
            />
          </div>
        </main>
      </div>

      {/* Add Folder Modal */}
      <Modal
        isOpen={isAddFolderModalOpen}
        onClose={() => setIsAddFolderModalOpen(false)}
        title="Add New Folder"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter folder name"
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddFolderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddFolder}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
          setNewFileName("");
          setSelectedFile(null);
          setSelectedFolder(null);
        }}
        currentName={selectedFile?.name || selectedFolder?.name || ""}
        onRename={handleRename}
        type={selectedFile ? "file" : "folder"}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedFile(null);
          setSelectedFolder(null);
        }}
        onConfirm={handleDelete}
        title="Delete Confirmation"
        description={`Are you sure you want to delete this ${
          selectedFile ? "file" : "folder"
        }?`}
      />

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreview
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setSelectedFile(null);
          }}
          file={selectedFile}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folders={folders}
        onUploadComplete={fetchFiles}
      />
    </div>
  );
}
