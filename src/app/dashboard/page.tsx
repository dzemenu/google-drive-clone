"use client";

import { Folder, Trash, LogOut, Plus, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface Folder {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

export default function Dashboard() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { signOut } = useClerk();

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

  useEffect(() => {
    fetchFolders();
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
      await fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Button onClick={handleAddFolder} className="flex gap-2 w-44">
            <Plus size={18} /> Add Folder
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>

        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder name"
          className="mt-2 w-full rounded border p-2 text-sm bg-gray-50 dark:bg-gray-700"
        />

        <nav className="space-y-2 pt-4">
          <div
            className="flex items-center gap-2 hover:text-red-500 cursor-pointer"
            onClick={() => signOut()}
          >
            <LogOut size={18} /> Sign out
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-4">My Drive</h1>
          <div className="flex flex-col items-end">
            <UserButton />
            <span className="text-sm font-semibold">
              {user?.firstName?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="rounded-lg shadow-sm bg-white dark:bg-gray-800 p-4">
          {isLoading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading folders...</p>
          ) : folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Folder size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No folders yet</p>
              <p className="text-sm text-gray-400 mt-2">Create your first folder to get started</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {folders.map((folder) => (
                <li
                  key={folder.id}
                  className="flex justify-between items-center"
                >
                  <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Folder size={20} /> {folder.name}
                  </span>
                  <Button variant="ghost" size="icon">
                    <Trash className="text-red-500" size={18} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
