import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Save } from "lucide-react";
import React from "react";

export interface ExpenseFormData {
  amount: string;
  description: string;
  categoryId: string;
  reference: string;
}

interface ExpenseFormProps {
  formData: ExpenseFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExpenseFormData>>;
  catData: any[];
  handleCreateExpense: (e: React.FormEvent) => void;
  isSaving: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ExpenseForm({
  formData,
  setFormData,
  catData,
  handleCreateExpense,
  isSaving,
  setIsOpen,
}: ExpenseFormProps) {
  return (
    <form onSubmit={handleCreateExpense} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Monto</Label>
          <InputGroup className="bg-background/50 border-white/10 h-11">
            <InputGroupAddon>S/.</InputGroupAddon>
            <InputGroupInput
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="text-lg font-mono"
              placeholder="0.00"
            />
          </InputGroup>
        </div>
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, categoryId: v }))
            }
          >
            <SelectTrigger className="bg-background/50 border-white/10 h-11 w-full">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {catData.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descripción del Gasto</Label>
        <Input
          required
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="bg-background/50 border-white/10 h-11"
          placeholder="Ej. Pago recibo de luz"
        />
      </div>
      <div className="space-y-2">
        <Label>N° Comprobante / Referencia (Opcional)</Label>
        <Input
          value={formData.reference}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, reference: e.target.value }))
          }
          className="bg-background/50 border-white/10 h-11"
          placeholder="Ej. OPE-12345"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
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
          Registrar Gasto
        </Button>
      </div>
    </form>
  );
}
