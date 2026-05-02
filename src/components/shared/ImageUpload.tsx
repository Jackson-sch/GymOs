"use client"

import * as React from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  onRemove: () => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled: externalDisabled,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const disabled = externalDisabled || isUploading

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.url) {
        onChange(data.url)
        toast.success("Imagen subida correctamente")
      } else {
        throw new Error(data.error || "Error al subir la imagen")
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error(error.message || "No se pudo subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("El archivo debe ser una imagen")
        return
      }
      uploadFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      uploadFile(file)
    }
  }

  return (
    <div className={cn("space-y-4 w-full flex flex-col items-center justify-center", className)}>
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative group cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-300",
          "w-48 h-48 rounded-3xl overflow-hidden border-2 border-dashed",
          value
            ? "border-primary/50 bg-primary/5 shadow-inner"
            : "border-border/40 bg-muted/5 hover:border-primary/40 hover:bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={disabled}
        />

        {isUploading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-primary text-center px-4">Subiendo...</p>
          </div>
        )}

        {value ? (
          <>
            <Image
              src={value}
              alt="Preview"
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-8 h-8 text-white animate-bounce" />
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 w-8 h-8 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform hover:scale-110 active:scale-90"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          !isUploading && (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              <div className="p-4 bg-muted/10 rounded-2xl group-hover:bg-primary/10 transition-colors">
                <ImageIcon className="w-10 h-10" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Subir Imagen</span>
            </div>
          )
        )}
      </div>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
        PNG, JPG, WEBP (Máx. 4MB)
      </p>
    </div>
  )
}
