"use client";

import React, { useState } from "react";
import {
  Mail,
  Smartphone,
  Lock,
  CreditCard,
  Globe,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { testApiConnectionAction } from "@/lib/actions/api-test-actions";

interface APITabProps {
  formState: Record<string, string>;
  showSecrets: Record<string, boolean>;
  handleChange: (key: string, value: string) => void;
  toggleSecret: (key: string) => void;
}

export function APITab({
  formState,
  showSecrets,
  handleChange,
  toggleSecret,
}: APITabProps) {
  const [globalTesting, setGlobalTesting] = useState(false);

  const apiChannels = [
    {
      key: "RESEND_API_KEY",
      name: "Resend API Key",
      icon: Mail,
      category: "RESEND",
      isSecret: true,
    },
    {
      key: "RESEND_FROM_EMAIL",
      name: "Remitente Resend",
      icon: Mail,
      category: "RESEND",
      isSecret: false,
    },
    {
      key: "TWILIO_SID",
      name: "Twilio Account SID",
      icon: Smartphone,
      category: "TWILIO",
      isSecret: false,
    },
    {
      key: "TWILIO_TOKEN",
      name: "Twilio Auth Token",
      icon: Lock,
      category: "TWILIO",
      isSecret: true,
    },
    {
      key: "MP_ACCESS_TOKEN",
      name: "Mercado Pago Token",
      icon: CreditCard,
      category: "PAYMENT",
      isSecret: true,
    },
    {
      key: "CULQI_PUBLIC_KEY",
      name: "Culqi Public Key",
      icon: CreditCard,
      category: "PAYMENT",
      isSecret: false,
    },
    {
      key: "CULQI_PRIVATE_KEY",
      name: "Culqi Private Key",
      icon: Lock,
      category: "PAYMENT",
      isSecret: true,
    },
    {
      key: "CLOUDINARY_CLOUD_NAME",
      name: "Cloudinary Cloud Name",
      icon: Globe,
      category: "CLOUDINARY",
      isSecret: false,
    },
    {
      key: "CLOUDINARY_UPLOAD_PRESET",
      name: "Cloudinary Preset",
      icon: Globe,
      category: "CLOUDINARY",
      isSecret: false,
    },
    {
      key: "CLOUDINARY_API_KEY",
      name: "Cloudinary API Key",
      icon: Key,
      category: "CLOUDINARY",
      isSecret: false,
    },
    {
      key: "CLOUDINARY_API_SECRET",
      name: "Cloudinary API Secret",
      icon: Lock,
      category: "CLOUDINARY",
      isSecret: true,
    },
  ];

  const testAllConnections = async () => {
    setGlobalTesting(true);
    const providers = ["RESEND", "TWILIO", "MERCADOPAGO", "CULQI", "CLOUDINARY"];
    let successCount = 0;

    for (const p of providers) {
      const res = await testApiConnectionAction(p, formState);
      if (res.success) {
        successCount++;
      }
    }
    setGlobalTesting(false);

    if (successCount === providers.length) {
      toast.success("¡Todos los servicios externos conectados y respondiendo!");
    } else {
      toast.warning(`${successCount} de ${providers.length} servicios verificados con éxito.`);
    }
  };

  return (
    <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-serif mb-1">Canales y Conectividad API</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Gestión y verificación en vivo de credenciales externas
          </p>
        </div>
        <Button
          onClick={testAllConnections}
          disabled={globalTesting}
          type="button"
          variant="outline"
          className="h-11 rounded-2xl bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 hover:text-primary uppercase text-xs font-bold tracking-widest gap-2 shadow-lg shadow-primary/10"
        >
          {globalTesting ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
          Verificar Todos los Servicios
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apiChannels.map((api) => (
          <div key={api.key} className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3 relative group hover:border-white/20 transition-all">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <api.icon className="size-3.5 text-primary" />
              </div>
              <Label className="text-xs uppercase tracking-wider font-semibold text-foreground">
                {api.name}
              </Label>
            </div>
            <div className="relative pt-1">
              <Input
                type={api.isSecret ? (showSecrets[api.key] ? "text" : "password") : "text"}
                value={formState[api.key] || ""}
                onChange={(e) => handleChange(api.key, e.target.value)}
                placeholder="Ingresar valor..."
                className={`bg-white/5 border-white/10 h-11 rounded-xl font-mono text-xs focus-visible:border-primary/50 ${api.isSecret ? "pr-11" : "pr-4"}`}
              />
              {api.isSecret && (
                <button
                  type="button"
                  onClick={() => toggleSecret(api.key)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors mt-0.5"
                  title="Mostrar/Ocultar"
                >
                  {showSecrets[api.key] ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-5" />
          <h3 className="text-base font-serif uppercase tracking-widest">
            Pruebas Individuales & Guía de Servicios
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ConfigGuideCard
            icon={Mail}
            title="Resend (Emails)"
            provider="RESEND"
            formState={formState}
            steps={[
              "Envío de correos de bienvenida, alertas de vencimiento y facturas.",
              "Requiere un dominio verificado para evitar bandeja de spam.",
              "El token debe contar con permisos de envío.",
            ]}
          />
          <ConfigGuideCard
            icon={Smartphone}
            title="Twilio (WhatsApp/SMS)"
            provider="TWILIO"
            formState={formState}
            steps={[
              "Notificaciones móviles directas al teléfono del socio.",
              "Requiere Account SID y Auth Token configurados.",
              "Asegúrese de tener saldo en su balance de Twilio.",
            ]}
          />
          <ConfigGuideCard
            icon={Globe}
            title="Cloudinary (Imágenes)"
            provider="CLOUDINARY"
            formState={formState}
            steps={[
              "Almacenamiento de avatares y fotos de perfil en la nube.",
              "Configuración de Cloud Name, API Key y Secret Key.",
              "Respaldo automático de imágenes optimizadas.",
            ]}
          />
          <ConfigGuideCard
            icon={CreditCard}
            title="Mercado Pago"
            provider="MERCADOPAGO"
            formState={formState}
            steps={[
              "Pasarela de pagos en línea e integración con códigos QR.",
              "Ingrese el Access Token de Producción (APP_USR-...).",
              "Permite renovaciones automáticas desde el portal web.",
            ]}
          />
          <ConfigGuideCard
            icon={CreditCard}
            title="Culqi Perú"
            provider="CULQI"
            formState={formState}
            steps={[
              "Soporte nativo para tarjetas Visa, Mastercard, Amex y Yape.",
              "Requiere Llave Pública y Privada activas en modo live.",
              "Cobros instantáneos en Soles (PEN).",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

interface ConfigGuideCardProps {
  icon: any;
  title: string;
  steps: string[];
  provider: string;
  formState: Record<string, string>;
}

function ConfigGuideCard({ icon: Icon, title, steps, provider, formState }: ConfigGuideCardProps) {
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    const res = await testApiConnectionAction(provider, formState);
    if (res.success) {
      toast.success(res.message || `Conexión verificada con ${title}`);
    } else {
      toast.error(res.error || `Error al verificar ${title}`);
    }
    setTesting(false);
  };

  return (
    <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4 hover:border-primary/30 transition-all flex flex-col justify-between shadow-xl backdrop-blur-md">
      <div className="space-y-3">
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
          <div className="size-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
            <Icon className="size-4 text-primary" />
          </div>
          <p className="text-sm font-bold uppercase tracking-wider text-foreground">
            {title}
          </p>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 leading-relaxed font-sans">
          {steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t border-white/5 mt-4">
        <Button
          onClick={handleTest}
          disabled={testing}
          type="button"
          variant="outline"
          className="w-full bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/50 text-[10px] font-bold uppercase tracking-widest h-10 rounded-xl transition-all shadow-md gap-2"
        >
          {testing ? (
            <>
              <Loader2 className="size-4 animate-spin text-primary" />
              Conectando...
            </>
          ) : (
            <>
              <Zap className="size-3.5 text-primary" />
              Probar Conexión
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
