"use client";

import * as React from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MemberComboboxProps {
  members: any[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string; // For form submission if needed
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MemberCombobox({
  members,
  value,
  onChange,
  placeholder = "Seleccionar socio...",
  className,
  name,
  open: externalOpen,
  onOpenChange: setExternalOpen,
}: MemberComboboxProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;

  const selectedMember = React.useMemo(
    () => members.find((m) => m.id === value),
    [members, value]
  );

  return (
    <div className={cn("relative w-full", className)}>
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white/5 border-white/10 h-12 rounded-2xl hover:bg-white/8 text-left font-normal px-4"
          >
            {selectedMember ? (
              <span className="flex items-center gap-3 truncate">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="size-3.5 text-primary" />
                </div>
                <span className="font-medium truncate">
                  {selectedMember.fullName}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({selectedMember.dni || "S/N"})
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground/50">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-black/95 backdrop-blur-2xl border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100]"
          align="start"
        >
          <Command className="bg-transparent">
            <CommandInput 
              placeholder="Buscar por nombre, DNI o teléfono..." 
              className="h-12 border-none focus:ring-0 text-sm"
            />
            <CommandList className="max-h-[300px] custom-scrollbar">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No se encontraron socios.
              </CommandEmpty>
              <CommandGroup>
                {members.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={`${member.fullName} ${member.dni || ""} ${member.phone || ""}`}
                    onSelect={() => {
                      onChange(member.id);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                  >
                    <div className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      value === member.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground"
                    )}>
                      <User className="size-4" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-sm truncate">
                        {member.fullName}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-mono">DNI: {member.dni || "—"}</span>
                        {member.phone && (
                          <>
                            <span>·</span>
                            <span>{member.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {value === member.id && (
                      <Check className="size-4 text-primary shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
