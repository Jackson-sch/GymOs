"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEquipmentAction, updateEquipmentAction } from "@/lib/actions/inventory-actions";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { DatePicker } from "@/components/ui/date-picker";

const equipmentSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  category: z.string().min(1, "Categoría requerida"),
  photo: z.string().optional(),
  serialNumber: z.string().optional(),
  purchasePrice: z.string().optional(),
  purchaseDate: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
  status: z.enum(["OPERATIONAL", "MAINTENANCE", "OUT_OF_SERVICE"]),
  notes: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

interface EquipmentFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export function EquipmentForm({ initialData, onSuccess }: EquipmentFormProps) {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          purchasePrice: initialData.purchasePrice?.toString() || "0",
          purchaseDate: initialData.purchaseDate
            ? new Date(initialData.purchaseDate).toISOString().split("T")[0]
            : "",
          lastMaintenance: initialData.lastMaintenance
            ? new Date(initialData.lastMaintenance).toISOString().split("T")[0]
            : "",
          nextMaintenance: initialData.nextMaintenance
            ? new Date(initialData.nextMaintenance).toISOString().split("T")[0]
            : "",
        }
      : {
          status: "OPERATIONAL",
          category: "CARDIO",
        },
  });

  const status = watch("status");

  const onSubmit = async (values: EquipmentFormValues) => {
    setLoading(true);
    const result = initialData
      ? await updateEquipmentAction(initialData.id, values)
      : await createEquipmentAction(values);

    if (result.success) {
      toast.success(initialData ? "Equipo actualizado" : "Equipo registrado");
      onSuccess();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Photo + Notes */}
        <div className="md:col-span-4 space-y-5">
          <div className="flex flex-col items-center justify-center space-y-2 p-4 rounded-2xl bg-muted/40 border border-border">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Foto del Equipo
            </Label>
            <ImageUpload
              value={watch("photo")}
              onChange={(url) => setValue("photo", url)}
              onRemove={() => setValue("photo", "")}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Notas de Mantenimiento
            </Label>
            <Textarea
              {...register("notes")}
              rows={4}
              className="bg-muted/40 border-border text-foreground resize-none"
              placeholder="Detalles relevantes..."
            />
          </div>
        </div>

        {/* Right Column: Equipment Fields (2-col grid) */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Nombre del Equipo
            </Label>
            <Input
              {...register("name")}
              className="w-full h-10 bg-muted/40 border-border text-foreground"
              placeholder="Treadmill X100"
            />
            {errors.name && (
              <p className="text-[10px] text-rose-500 font-bold uppercase">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Categoría
            </Label>
            <Select
              onValueChange={(v) => setValue("category", v)}
              defaultValue={watch("category")}
            >
              <SelectTrigger className="w-full h-10 bg-muted/40 border-border text-foreground">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground backdrop-blur-xl">
                <SelectItem value="CARDIO">Cardio</SelectItem>
                <SelectItem value="STRENGTH">Fuerza</SelectItem>
                <SelectItem value="WEIGHTS">Pesas Libres</SelectItem>
                <SelectItem value="ACCESSORIES">Accesorios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              N° de Serie
            </Label>
            <Input
              {...register("serialNumber")}
              className="w-full h-10 bg-muted/40 border-border text-foreground"
              placeholder="SN-123456"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Estado Operativo
            </Label>
            <Select
              onValueChange={(v: any) => setValue("status", v)}
              defaultValue={status}
            >
              <SelectTrigger className="w-full h-10 bg-muted/40 border-border text-foreground">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground backdrop-blur-xl">
                <SelectItem value="OPERATIONAL">Operativo</SelectItem>
                <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                <SelectItem value="OUT_OF_SERVICE">Fuera de Servicio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Precio Adquisición (S/.)
            </Label>
            <Input
              {...register("purchasePrice")}
              className="w-full h-10 bg-muted/40 border-border text-foreground"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Fecha Compra
            </Label>
            <DatePicker
              value={watch("purchaseDate")}
              onChange={(date) =>
                setValue("purchaseDate", date ? date.toISOString().split("T")[0] : "")
              }
              placeholder="Seleccionar fecha..."
              className="w-full h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Último Mantenimiento
            </Label>
            <DatePicker
              value={watch("lastMaintenance")}
              onChange={(date) =>
                setValue("lastMaintenance", date ? date.toISOString().split("T")[0] : "")
              }
              placeholder="Seleccionar fecha..."
              className="w-full h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Próximo Mantenimiento
            </Label>
            <DatePicker
              value={watch("nextMaintenance")}
              onChange={(date) =>
                setValue("nextMaintenance", date ? date.toISOString().split("T")[0] : "")
              }
              placeholder="Seleccionar fecha..."
              className="w-full h-10"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-xl font-bold uppercase tracking-widest gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {initialData ? "Actualizar Equipo" : "Registrar Activo"}
      </Button>
    </form>
  );
}
