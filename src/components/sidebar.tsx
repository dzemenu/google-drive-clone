import { Folder, Trash, LogOut, Plus, Upload, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

interface SidebarProps {
  onAddFolder: () => void;
  onUpload: () => void;
  onViewTrash: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ onAddFolder, onUpload, onViewTrash, isOpen, onClose }: SidebarProps) {
  const { signOut } = useClerk();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => onClose()}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md md:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-md p-4 space-y-4 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        <div className="flex flex-col gap-4 mt-8">
          <Button onClick={onAddFolder} className="flex gap-2 w-full justify-center items-center">
            <Plus size={18} /> Add Folder
          </Button>
          <Button
            onClick={onUpload}
            className="flex gap-2 w-full justify-center items-center"
          >
            <Upload size={18} /> Upload File
          </Button>
          <Button
            onClick={onViewTrash}
            className="flex gap-2 w-full justify-center items-center"
          >
            <Trash size={18} /> Trash
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
} 