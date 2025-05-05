"use client";

import { Folder, Trash, LogOut, Plus, Sun, Moon, Upload, File, ChevronDown, ChevronRight, Pencil, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { uploadFile, formatBytes } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { UploadModal } from "@/components/upload-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { toast } from "react-hot-toast";
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
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const { user } = useUser();
  const { signOut } = useClerk();
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
      // Ensure data is an array
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

  const handleFileUpload = async (file: globalThis.File, folderId?: number) => {
    try {
      await uploadFile(file, folderId);
      await fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
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

  const getFolderFiles = (folderId: number | null) => {
    return files.filter(file => file.folderId === folderId);
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md md:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-md p-4 space-y-4 transform transition-transform duration-200 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex flex-col gap-4 mt-8">
          <Button onClick={() => setIsAddFolderModalOpen(true)} className="flex gap-2 w-full justify-center items-center">
            <Plus size={18} /> Add Folder
          </Button>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex gap-2 w-full justify-center items-center"
          >
            <Upload size={18} /> Upload File
          </Button>
          <Button
            variant="destructive"
            onClick={() => signOut()}
            className="flex gap-2 w-full justify-center items-center"
          >
            <LogOut size={18} /> Sign out
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 mt-16 md:mt-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Drive</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <div className="flex flex-col items-end">
              <UserButton />
              <span className="text-sm font-semibold">
                {user?.firstName?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-sm bg-white dark:bg-gray-800 p-4">
          {isLoading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Root Files */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Root Directory</h2>
                {getFolderFiles(null).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <File size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No files in root</p>
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
                            onClick={() => setSelectedFile(file)}
                            className="text-sm hover:underline text-left"
                          >
                            {file.name}
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{formatBytes(parseInt(file.size))}</span>
                          <Button variant="ghost" size="icon" onClick={(e) => {
                            e.stopPropagation();
                            setFileToRename(file);
                            setIsRenameFileModalOpen(true);
                          }}>
                            <Pencil className="text-blue-500" size={18} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => {
                            e.stopPropagation();
                            setFileToDelete(file);
                            setIsDeleteFileModalOpen(true);
                          }}>
                            <Trash className="text-red-500" size={18} />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Folders with their files */}
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
                          <div
                            className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleFolder(folder.id)}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFolderToRename(folder);
                                  setIsRenameFolderModalOpen(true);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              >
                                <Pencil className="h-4 w-4 text-blue-500" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFolderToDelete(folder);
                                  setIsDeleteFolderModalOpen(true);
                                }}
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
                                      <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm hover:underline"
                                      >
                                        {file.name}
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-sm text-gray-500">
                                        {formatBytes(parseInt(file.size))}
                                      </span>
                                      <Button variant="ghost" size="icon" onClick={(e) => {
                                        e.stopPropagation();
                                        setFileToRename(file);
                                        setIsRenameFileModalOpen(true);
                                      }}>
                                        <Pencil className="text-blue-500" size={18} />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={(e) => {
                                        e.stopPropagation();
                                        setFileToDelete(file);
                                        setIsDeleteFileModalOpen(true);
                                      }}>
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
            </div>
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
        onUpload={handleFileUpload}
      />

      {/* Add confirmation modals */}
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

      {/* Add rename modals */}
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
