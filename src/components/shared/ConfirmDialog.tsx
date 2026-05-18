"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-card border-white/10 bg-zinc-950/95 backdrop-blur-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-serif">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground font-sans">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-xl border-white/10 hover:bg-white/5 bg-transparent">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              "rounded-xl font-semibold tracking-wide shadow-lg",
              variant === "danger" && "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20",
              variant === "primary" && "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20",
              variant === "warning" && "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20"
            )}
          >
            {isLoading ? "Procesando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
