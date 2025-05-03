"use client";

import { Button } from "@/components/ui/button";
import {
  Folder,
  File,
  Trash,
  Clock,
  Users,
  Plus,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import { mockData } from "@/lib/mock-data";
import React from "react";

export default function Dashboard() {
  const [openFolderId, setOpenFolderId] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const handleFolderClick = (id: number) => {
    setOpenFolderId(openFolderId === id ? null : id);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="default" className="flex gap-2 w-44">
            <Plus size={18} /> New
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>

        <nav className="space-y-2 pt-4">
          <div className="flex items-center gap-2 hover:text-primary cursor-pointer">
            <Folder size={18} /> My Drive
          </div>
          <div className="flex items-center gap-2 hover:text-primary cursor-pointer">
            <Users size={18} /> Shared with me
          </div>
          <div className="flex items-center gap-2 hover:text-primary cursor-pointer">
            <Clock size={18} /> Recent
          </div>
          <div className="flex items-center gap-2 hover:text-primary cursor-pointer">
            <Trash size={18} /> Trash
          </div>
          {/* ✅ Sign Out Button */}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 hover:text-primary cursor-pointer w-full text-left bg-transparent"
          >
            <LogOut size={18} /> Sign out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-4">My Drive</h1>
          <SignedIn>
            <div className="flex flex-col items-end">
              <UserButton />
              <span className="text-sm font-semibold mt-1">
                {user?.firstName?.toLocaleUpperCase()}
              </span>
            </div>
          </SignedIn>
          <SignedOut />
        </div>

        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full table-auto border-collapse bg-white dark:bg-gray-800">
            <thead className="text-left bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Name</th>
                <th className="p-3">Size</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3">
                      {item.type === "folder" ? (
                        <Folder size={20} />
                      ) : (
                        <File size={20} />
                      )}
                    </td>
                    <td className="p-3">
                      {item.type === "folder" ? (
                        <button
                          onClick={() => handleFolderClick(item.id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <a
                          href={item.files?.[0]?.url}
                          target="_blank"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          rel="noopener noreferrer"
                        >
                          {item.name}
                        </a>
                      )}
                    </td>
                    <td className="p-3 text-sm">{item.size ?? "—"}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="icon">
                        <Trash className="text-red-500" size={18} />
                      </Button>
                    </td>
                  </tr>

                  {/* Nested Files for Folder */}
                  {item.type === "folder" &&
                    openFolderId === item.id &&
                    item.files?.map((file) => (
                      <tr
                        key={file.id}
                        className="bg-gray-50 dark:bg-gray-700 text-sm"
                      >
                        <td className="p-3 pl-10">
                          <File size={16} />
                        </td>
                        <td className="p-3">
                          <a
                            href={file.url}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {file.name}
                          </a>
                        </td>
                        <td className="p-3">{file.size ?? "1.2 MB"}</td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-70 hover:opacity-100"
                          >
                            <Trash className="text-red-500" size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
