"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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

interface ComboboxProps {
  items: { label: string; value: string; description?: string }[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  triggerClassName?: string;
  icon?: React.ElementType;
}

export function Combobox({
  items,
  value,
  onSelect,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  className,
  triggerClassName,
  icon: Icon,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = React.useMemo(
    () => items.find((item) => item.value === value),
    [items, value]
  );

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-white/5 border-white/10 h-10 rounded-xl hover:bg-white/8 text-left font-normal px-3 transition-all",
              triggerClassName
            )}
          >
            <div className="flex items-center gap-2 truncate">
              {Icon && <Icon className="size-3.5 text-primary/70 shrink-0" />}
              {selectedItem ? (
                <span className="truncate">{selectedItem.label}</span>
              ) : (
                <span className="text-muted-foreground/50 truncate">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-black/95 backdrop-blur-2xl border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100]"
          align="start"
        >
          <Command className="bg-transparent">
            <CommandInput 
              placeholder={searchPlaceholder} 
              className="h-11 border-none focus:ring-0 text-sm"
            />
            <CommandList className="max-h-[300px] custom-scrollbar">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label}
                    onSelect={() => {
                      onSelect(item.value);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-sm truncate">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {item.description}
                        </span>
                      )}
                    </div>
                    {value === item.value && (
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
