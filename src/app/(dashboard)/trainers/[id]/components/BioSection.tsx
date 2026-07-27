"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck } from "lucide-react";

interface BioSectionProps {
  isEditing: boolean;
  bio: string;
  dispatch: React.Dispatch<any>;
}

export function BioSection({ isEditing, bio, dispatch }: BioSectionProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <Card className="glass-card border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <UserCheck className="size-4 text-primary" />
            Biografía Profesional
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          {isEditing ? (
            <Textarea
              value={bio}
              onChange={(e) => dispatch({ type: "UPDATE_FORM", payload: { bio: e.target.value } })}
              placeholder="Escriba la reseña o biografía del entrenador..."
              rows={8}
              className="bg-white/5 border-white/15 focus-visible:ring-primary/30 resize-none rounded-2xl text-xs text-foreground font-medium leading-relaxed placeholder:text-muted-foreground/50"
            />
          ) : (
            <p className="text-foreground/90 leading-relaxed text-xs font-medium whitespace-pre-wrap">
              {bio || "No hay información biográfica registrada para este instructor."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
