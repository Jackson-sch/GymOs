import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Save } from "lucide-react";
import React from "react";

export interface CategoryFormData {
  name: string;
  description: string;
}

interface CategoryFormProps {
  catFormData: CategoryFormData;
  setCatFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  handleCreateCategory: (e: React.FormEvent) => void;
  isSaving: boolean;
  setIsCatOpen: (isOpen: boolean) => void;
}

export default function CategoryForm({
  catFormData,
  setCatFormData,
  handleCreateCategory,
  isSaving,
  setIsCatOpen,
}: CategoryFormProps) {
  return (
    <form onSubmit={handleCreateCategory} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label>Nombre de la Categoría</Label>
        <Input
          required
          value={catFormData.name}
          onChange={(e) =>
            setCatFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="bg-background/50 border-white/10 h-11"
        />
      </div>
      <div className="space-y-2">
        <Label>Descripción (Opcional)</Label>
        <Input
          value={catFormData.description}
          onChange={(e) =>
            setCatFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="bg-background/50 border-white/10 h-11"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsCatOpen(false)}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-primary text-primary-foreground"
        >
          {isSaving ? (
            <Activity className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Categoría
        </Button>
      </div>
    </form>
  );
}
