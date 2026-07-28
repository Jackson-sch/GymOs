"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Globe, ChevronDown, Check, Building2 } from "lucide-react";
import { useBranchStore } from "@/store/use-branch-store";
import { getBranchesAction } from "@/lib/actions/branch-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function BranchSwitcher() {
  const { selectedBranchId, branches, setSelectedBranchId, setBranches } = useBranchStore();

  useEffect(() => {
    let isCancelled = false;
    async function loadBranches() {
      if (branches.length === 0) {
        const res = await getBranchesAction();
        if (isCancelled) return;
        if (res.success && res.data) {
          setBranches(res.data);
        }
      }
    }
    loadBranches();
    return () => {
      isCancelled = true;
    };
  }, [branches.length, setBranches]);

  const activeBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-3.5 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-foreground font-bold text-xs gap-2 transition-colors hover:scale-102"
        >
          {selectedBranchId === "ALL" ? (
            <div className="flex items-center gap-2 text-primary">
              <Globe className="size-4" />
              <span>Todas las Sedes (Consolidado)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="size-4 text-primary" />
              <span>{activeBranch?.name || "Sede Seleccionada"}</span>
            </div>
          )}
          <ChevronDown className="size-3.5 text-muted-foreground ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-64 bg-card/95 border-white/10 backdrop-blur-2xl text-foreground p-2 rounded-2xl shadow-2xl space-y-1"
      >
        <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-2 py-1 flex items-center justify-between">
          <span>Seleccionar Sucursal</span>
          <Building2 className="size-3.5 text-primary" />
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          onClick={() => setSelectedBranchId("ALL")}
          className={`rounded-xl px-3 py-2.5 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
            selectedBranchId === "ALL"
              ? "bg-primary/20 text-primary"
              : "hover:bg-white/5 text-foreground"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Globe className="size-4 text-primary" />
            <div>
              <p className="font-bold">Todas las Sedes</p>
              <p className="text-[10px] font-normal text-muted-foreground">Consolidado multisede</p>
            </div>
          </div>
          {selectedBranchId === "ALL" && <Check className="size-4 text-primary" />}
        </DropdownMenuItem>

        {branches.length > 0 && <DropdownMenuSeparator className="bg-white/10" />}

        {branches.map((branch) => {
          const isSelected = selectedBranchId === branch.id;
          return (
            <DropdownMenuItem
              key={branch.id}
              onClick={() => setSelectedBranchId(branch.id)}
              className={`rounded-xl px-3 py-2.5 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-white/5 text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 text-primary" />
                <div>
                  <p className="font-bold">{branch.name}</p>
                  {branch.address && (
                    <p className="text-[10px] font-normal text-muted-foreground truncate max-w-37.5">
                      {branch.address}
                    </p>
                  )}
                </div>
              </div>
              {isSelected && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
