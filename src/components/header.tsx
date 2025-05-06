import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ darkMode, onToggleDarkMode }: HeaderProps) {
  const { user } = useUser();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">My Drive</h1>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleDarkMode}
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
  );
} 