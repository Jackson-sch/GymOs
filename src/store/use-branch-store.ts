"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Branch {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  isActive: boolean;
}

interface BranchState {
  selectedBranchId: string; // "ALL" or specific branch ID
  branches: Branch[];
  setSelectedBranchId: (branchId: string) => void;
  setBranches: (branches: Branch[]) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      selectedBranchId: "ALL",
      branches: [],
      setSelectedBranchId: (selectedBranchId: string) => set({ selectedBranchId }),
      setBranches: (branches: Branch[]) => set({ branches }),
    }),
    {
      name: "gymos-branch-storage",
    }
  )
);
