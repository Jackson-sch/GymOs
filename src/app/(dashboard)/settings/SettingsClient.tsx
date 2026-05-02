"use client";

import React from "react";
import { 
  Globe, 
  Bell, 
  Key, 
  Shield, 
  Save, 
  Smartphone,
  Mail,
  CreditCard,
  Sparkles,
  Loader2,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateConfigsAction } from "@/lib/actions/settings-actions";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/ImageUpload";

export function SettingsClient({ initialData }: { initialData: any[] }) {
  const [activeTab, setActiveTab] = React.useState("general");
  const [loading, setLoading] = React.useState(false);
  const [showSecrets, setShowSecrets] = React.useState<Record<string, boolean>>({});
  
  // Transform flat array to key-value object for easier form management
  const [formState, setFormState] = React.useState<Record<string, string>>(() => {
    const state: Record<string, string> = {};
    initialData.forEach(item => {
      state[item.key] = item.value;
    });
    return state;
  });

  const handleChange = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    const configsToUpdate = Object.entries(formState).map(([key, value]) => {
      // Find original category if exists
      const original = initialData.find(d => d.key === key);
      return {
        key,
        value,
        category: original?.category || "GENERAL"
      };
    });

    const result = await updateConfigsAction(configsToUpdate);
    if (result.success) {
      toast.success("Configuraciones actualizadas correctamente.");
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "branding", label: "Marca & UI", icon: Sparkles },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "api", label: "Canales API", icon: Key },
    { id: "security", label: "Seguridad", icon: Shield },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Globe className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Núcleo del Sistema</span>
          </div>
          <h1 className="text-6xl font-serif leading-tight">Configuración</h1>
          <p className="text-muted-foreground font-sans max-w-md">
            Personalizando el motor de <span className="text-foreground font-medium">GymOS</span> para adaptarse a tu marca y necesidades.
          </p>
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 h-12 font-sans font-semibold tracking-wide shadow-lg shadow-primary/20 interactive-hover gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Settings Navigation */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium",
                activeTab === tab.id ? "bg-white/5 border border-white/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-9 space-y-10">
          {activeTab === "general" && (
            <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-serif mb-1">General</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Información básica del gimnasio</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nombre del Gimnasio</Label>
                  <Input 
                    value={formState["GYM_NAME"] || ""} 
                    onChange={(e) => handleChange("GYM_NAME", e.target.value)}
                    placeholder="GymOS Elite" 
                    className="bg-white/5 border-white/10 h-12 rounded-xl" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">RUC / ID Fiscal</Label>
                  <Input 
                    value={formState["GYM_RUC"] || ""} 
                    onChange={(e) => handleChange("GYM_RUC", e.target.value)}
                    placeholder="20123456789" 
                    className="bg-white/5 border-white/10 h-12 rounded-xl" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Dirección Principal</Label>
                  <Input 
                    value={formState["GYM_ADDRESS"] || ""} 
                    onChange={(e) => handleChange("GYM_ADDRESS", e.target.value)}
                    placeholder="Av. Las Camelias 123" 
                    className="bg-white/5 border-white/10 h-12 rounded-xl" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Teléfono Contacto</Label>
                  <Input 
                    value={formState["GYM_PHONE"] || ""} 
                    onChange={(e) => handleChange("GYM_PHONE", e.target.value)}
                    placeholder="+51 987 654 321" 
                    className="bg-white/5 border-white/10 h-12 rounded-xl" 
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === "branding" && (
            <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-serif mb-1">Identidad Visual</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Configuración de marca y apariencia global</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Eslogan Editorial</Label>
                  <Input 
                    value={formState["GYM_SLOGAN"] || ""} 
                    onChange={(e) => handleChange("GYM_SLOGAN", e.target.value)}
                    placeholder="La excelencia es un hábito" 
                    className="bg-white/5 border-white/10 h-12 rounded-xl" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Color Primario (Hex)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formState["PRIMARY_COLOR"] || "#000000"} 
                      onChange={(e) => handleChange("PRIMARY_COLOR", e.target.value)}
                      placeholder="#000000" 
                      className="bg-white/5 border-white/10 h-12 rounded-xl" 
                    />
                    <div 
                      className="w-12 h-12 rounded-xl border border-white/10" 
                      style={{ backgroundColor: formState["PRIMARY_COLOR"] || "#000000" }}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Logo del Gimnasio</Label>
                  <div className="flex flex-col items-center md:items-start">
                    <ImageUpload 
                      value={formState["GYM_LOGO"] || ""} 
                      onChange={(url) => handleChange("GYM_LOGO", url)}
                      onRemove={() => handleChange("GYM_LOGO", "")}
                      className="w-full max-w-[200px]"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Favicon (32x32)</Label>
                  <div className="flex flex-col items-center md:items-start">
                    <ImageUpload 
                      value={formState["GYM_FAVICON"] || ""} 
                      onChange={(url) => handleChange("GYM_FAVICON", url)}
                      onRemove={() => handleChange("GYM_FAVICON", "")}
                      className="w-full max-w-[100px]"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "notifications" && (
            <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-serif mb-1">Notificaciones</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Mensajería y alertas automáticas</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/2 border border-white/5">
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Emails de Bienvenida</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Enviar automáticamente al registrar socios</p>
                    </div>
                  </div>
                  <Button 
                    variant={formState["NOTIFY_WELCOME"] === "true" ? "default" : "outline"}
                    onClick={() => handleChange("NOTIFY_WELCOME", formState["NOTIFY_WELCOME"] === "true" ? "false" : "true")}
                    className="rounded-lg h-9 text-[10px] uppercase tracking-widest font-bold"
                  >
                    {formState["NOTIFY_WELCOME"] === "true" ? "Activado" : "Desactivado"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/2 border border-white/5">
                  <div className="flex items-center gap-4">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Recordatorios WhatsApp</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Alertas de vencimiento de membresía</p>
                    </div>
                  </div>
                  <Button 
                    variant={formState["NOTIFY_EXPIRY"] === "true" ? "default" : "outline"}
                    onClick={() => handleChange("NOTIFY_EXPIRY", formState["NOTIFY_EXPIRY"] === "true" ? "false" : "true")}
                    className="rounded-lg h-9 text-[10px] uppercase tracking-widest font-bold"
                  >
                    {formState["NOTIFY_EXPIRY"] === "true" ? "Activado" : "Desactivado"}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {activeTab === "api" && (
            <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-serif mb-1">Canales API</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Conectividad con servicios externos</p>
              </div>

              <div className="space-y-6">
                {[
                  { key: "RESEND_API_KEY", name: "Resend API Key", icon: Mail, category: "RESEND" },
                  { key: "TWILIO_SID", name: "Twilio Account SID", icon: Smartphone, category: "TWILIO" },
                  { key: "TWILIO_TOKEN", name: "Twilio Auth Token", icon: Lock, category: "TWILIO" },
                  { key: "MP_ACCESS_TOKEN", name: "Mercado Pago Token", icon: CreditCard, category: "PAYMENT" },
                  { key: "CLOUDINARY_CLOUD_NAME", name: "Cloudinary Cloud Name", icon: Globe, category: "CLOUDINARY" },
                  { key: "CLOUDINARY_API_KEY", name: "Cloudinary API Key", icon: Key, category: "CLOUDINARY" },
                  { key: "CLOUDINARY_API_SECRET", name: "Cloudinary API Secret", icon: Lock, category: "CLOUDINARY" },
                ].map((api) => (
                  <div key={api.key} className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">{api.name}</Label>
                    <div className="relative">
                      <Input 
                        type={showSecrets[api.key] ? "text" : "password"}
                        value={formState[api.key] || ""} 
                        onChange={(e) => handleChange(api.key, e.target.value)}
                        className="bg-white/5 border-white/10 h-12 rounded-xl pr-12 font-mono text-xs" 
                      />
                      <button 
                        type="button"
                        onClick={() => toggleSecret(api.key)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets[api.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guía de Configuración */}
              <div className="mt-12 pt-8 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="text-sm font-medium uppercase tracking-widest">Guía de Configuración</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3 interactive-hover">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider">Resend (Emails)</p>
                    </div>
                    <ul className="text-[10px] text-muted-foreground space-y-1 list-disc pl-4 leading-relaxed font-sans">
                      <li>Crea una cuenta en <span className="text-foreground">resend.com</span></li>
                      <li>Ve a la sección "API Keys" en el sidebar izquierdo.</li>
                      <li>Crea una key con nombre "GymOS" y copia el valor.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3 interactive-hover">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Smartphone className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider">Twilio (WhatsApp/SMS)</p>
                    </div>
                    <ul className="text-[10px] text-muted-foreground space-y-1 list-disc pl-4 leading-relaxed font-sans">
                      <li>Inicia sesión en <span className="text-foreground">twilio.com/console</span></li>
                      <li>En el Dashboard principal verás "Account SID" y "Auth Token".</li>
                      <li>Asegúrate de tener saldo para el envío de mensajes.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3 interactive-hover">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider">Mercado Pago (Pagos)</p>
                    </div>
                    <ul className="text-[10px] text-muted-foreground space-y-1 list-disc pl-4 leading-relaxed font-sans">
                      <li>Ingresa a <span className="text-foreground">Mercado Pago Developers</span>.</li>
                      <li>Crea una aplicación y ve a "Credenciales de Producción".</li>
                      <li>Copia el "Access Token" (empieza con APP_USR).</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3 interactive-hover">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider">Cloudinary (Imágenes)</p>
                    </div>
                    <ul className="text-[10px] text-muted-foreground space-y-1 list-disc pl-4 leading-relaxed font-sans">
                      <li>Logueate en <span className="text-foreground">cloudinary.com</span></li>
                      <li>En el "Dashboard" verás Cloud Name, API Key y API Secret.</li>
                      <li>Usa estos datos para habilitar la subida de fotos de socios.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "security" && (
            <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-serif mb-1">Seguridad</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Protección de datos y accesos</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/2 border border-white/5">
                  <div className="flex items-center gap-4">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Registro de Auditoría</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Guardar historial de todas las acciones</p>
                    </div>
                  </div>
                  <Button 
                    variant={formState["AUDIT_LOG"] === "true" ? "default" : "outline"}
                    onClick={() => handleChange("AUDIT_LOG", formState["AUDIT_LOG"] === "true" ? "false" : "true")}
                    className="rounded-lg h-9 text-[10px] uppercase tracking-widest font-bold"
                  >
                    {formState["AUDIT_LOG"] === "true" ? "Activado" : "Desactivado"}
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
