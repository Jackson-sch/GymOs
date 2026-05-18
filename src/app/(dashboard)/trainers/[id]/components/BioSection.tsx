"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Activity } from "lucide-react";

interface BioSectionProps {
  isEditing: boolean;
  bio: string;
  dispatch: React.Dispatch<any>;
}

export function BioSection({ isEditing, bio, dispatch }: BioSectionProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <Card className="border-border/10 shadow-sm bg-secondary/10 group overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Biografía
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={bio}
              onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { bio: e.target.value } })}
              placeholder="Escribe aquí la biografía profesional..."
              rows={8}
              className="bg-background/20 border-border/10 focus:border-primary/30 resize-none rounded-xl text-sm leading-relaxed"
            />
          ) : (
            <p className="text-foreground/80 leading-relaxed text-sm font-light italic opacity-90 whitespace-pre-wrap">
              {bio || "No hay información adicional disponible."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
