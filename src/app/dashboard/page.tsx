"use client";

import { Folder, Trash, LogOut, Plus, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [folders, setFolders] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const fetchFolders = async () => {
    const res = await fetch("/api/folders");
    const data = await res.json();
    setFolders(data);
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetch("/api/folders", {
      method: "POST",
      body: JSON.stringify({ name: newFolderName }),
    });
    setNewFolderName("");
    fetchFolders();
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
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center gap-2">
              <Folder size={18} /> {folder.name}
            </div>
          ))}
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
          {folders.length === 0 ? (
            <p>No folders yet.</p>
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
