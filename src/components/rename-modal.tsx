import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => void;
  type: "file" | "folder";
}

export function RenameModal({
  isOpen,
  onClose,
  currentName,
  onRename,
  type,
}: RenameModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newName = form.newName.value.trim();
    if (newName) {
      onRename(newName);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Rename ${type}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="newName"
            defaultValue={currentName}
            placeholder={`Enter new ${type} name`}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Rename</Button>
        </div>
      </form>
    </Modal>
  );
} 