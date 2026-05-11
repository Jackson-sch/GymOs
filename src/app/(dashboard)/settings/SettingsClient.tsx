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
  EyeOff,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldCheck,
  LogOut,
  Monitor,
  History,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateConfigsAction } from "@/lib/actions/settings-actions";
import { getAuditLogsAction } from "@/lib/actions/audit-actions";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export function SettingsClient({ initialData }: { initialData: any[] }) {
  const [activeTab, setActiveTab] = useQueryState("tab", parseAsString.withDefault("general").withOptions({ shallow: false }));
  const [loading, setLoading] = React.useState(false);
  const [showSecrets, setShowSecrets] = React.useState<Record<string, boolean>>({});

  // Security & Account states
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = React.useState(false);
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ shallow: false }));
  const [totalPages, setTotalPages] = React.useState(1);

  React.useEffect(() => {
    if (activeTab === "audit") {
      loadLogs(currentPage);
    }
  }, [activeTab, currentPage]);

  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setPasswordLoading(true);
    const { error } = await authClient.changePassword({
      newPassword: passwordForm.newPassword,
      currentPassword: passwordForm.currentPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      toast.error(error.message || "Error al cambiar la contraseña");
    } else {
      toast.success("Contraseña actualizada correctamente");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
    setPasswordLoading(false);
  };

  const loadLogs = async (page: number = 1) => {
    setLoadingLogs(true);
    const result = await getAuditLogsAction({ page, limit: 15 });
    if (result.success) {
      setAuditLogs(result.data || []);
      setTotalPages(result.totalPages || 1);
    }
    setLoadingLogs(false);
  };
  
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
    { id: "account", label: "Mi Cuenta", icon: User },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "api", label: "Canales API", icon: Key },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "audit", label: "Registro de Auditoría", icon: Eye },
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
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== activeTab) setCurrentPage(1);
              }}
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
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Formato de Comprobante</Label>
                  <Select 
                    value={formState["RECEIPT_FORMAT"] || "A4"} 
                    onValueChange={(value) => handleChange("RECEIPT_FORMAT", value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">Documento A4 (Estándar)</SelectItem>
                      <SelectItem value="TICKET">Ticket 80mm (Térmico)</SelectItem>
                    </SelectContent>
                  </Select>
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

          {activeTab === "account" && (
            <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-serif mb-1">Mi Cuenta</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Información personal y perfil de administrador</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-4 space-y-4">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Foto de Perfil</Label>
                  <ImageUpload 
                    value={user?.image || ""} 
                    onChange={async (url) => {
                      await authClient.updateUser({ image: url });
                      toast.success("Foto de perfil actualizada");
                    }}
                    onRemove={async () => {
                      await authClient.updateUser({ image: "" });
                      toast.success("Foto de perfil eliminada");
                    }}
                    className="w-full aspect-square"
                  />
                </div>

                <div className="md:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nombre Completo</Label>
                      <Input 
                        value={user?.name || ""} 
                        disabled
                        className="bg-white/5 border-white/10 h-12 rounded-xl opacity-70" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Correo Electrónico</Label>
                      <Input 
                        value={user?.email || ""} 
                        disabled
                        className="bg-white/5 border-white/10 h-12 rounded-xl opacity-70" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Rol en el Sistema</Label>
                      <div className="flex">
                        <Badge variant="outline" className="px-4 py-2 border-primary/20 text-primary bg-primary/5 rounded-lg font-bold tracking-widest text-[10px]">
                          {(user as any)?.role || "ADMIN"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center gap-3 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <p className="text-[10px] uppercase tracking-widest">Tu cuenta está protegida por políticas de acceso administrativo de GymOS.</p>
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
            <section className="glass-card p-10 border-white/5 space-y-12 animate-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-2xl font-serif mb-1">Seguridad</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Protección de acceso y credenciales</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Nivel de Seguridad: Alto</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Password Change Form */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl text-foreground">Cambiar Contraseña</h3>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Contraseña Actual</Label>
                      <Input 
                        type="password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="bg-white/5 border-white/10 h-12 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Nueva Contraseña</Label>
                      <Input 
                        type="password"
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-white/5 border-white/10 h-12 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Confirmar Nueva Contraseña</Label>
                      <Input 
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-white/5 border-white/10 h-12 rounded-xl" 
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={passwordLoading}
                      className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 rounded-xl font-bold tracking-widest text-xs uppercase transition-all"
                    >
                      {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                      Actualizar Credenciales
                    </Button>
                  </form>
                </div>

                {/* Session & Info */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-serif text-xl text-foreground">Sesión Actual</h3>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/5">
                            <Monitor className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Chrome / Windows</p>
                            <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest">En línea ahora</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5">
                          ACTIVA
                        </Badge>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                        <span>IP: 190.235.xxx.xxx</span>
                        <span>Último acceso: Hoy</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <p className="text-xs font-bold uppercase tracking-widest">Protección Activa</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Tu cuenta está protegida con cifrado <span className="text-foreground font-medium">Argon2id</span>. 
                      Para mayor seguridad, te recomendamos cambiar tu contraseña cada 90 días y evitar compartir tus credenciales.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter">Cifrado AES-256</Badge>
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter">SSL/TLS 1.3</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "audit" && (
            <section className="glass-card p-10 border-white/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-serif mb-1">Registro de Auditoría</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Historial de acciones administrativas críticas</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadLogs(currentPage)} disabled={loadingLogs} className="rounded-xl h-10 px-4 gap-2">
                  <Sparkles className={cn("w-4 h-4", loadingLogs && "animate-spin")} />
                  Actualizar
                </Button>
              </div>

              <div className="border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/2 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground">Fecha</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground">Usuario</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground">Acción</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground">Entidad</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingLogs ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-6 py-4 bg-white/1 h-12" />
                        </tr>
                      ))
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">No hay registros de auditoría disponibles</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/1 transition-colors">
                          <td className="px-6 py-4 text-muted-foreground">
                            {format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: es })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{log.user.name}</span>
                              <span className="text-[10px] text-muted-foreground">{log.user.role}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={cn(
                              "text-[9px] uppercase font-bold",
                              log.action === "DELETE" ? "border-destructive/50 text-destructive" :
                              log.action === "CREATE" ? "border-primary/50 text-primary" :
                              "border-white/10"
                            )}>
                              {log.action}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{log.entity}</span>
                              <span className="text-[10px] text-muted-foreground tracking-tighter">{log.entityId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-mono">
                            {log.ipAddress}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <p className="text-xs text-muted-foreground">
                    Página <span className="text-foreground font-medium">{currentPage}</span> de <span className="text-foreground font-medium">{totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === 1 || loadingLogs}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="rounded-xl h-10 px-4 border-white/10"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Anterior
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === totalPages || loadingLogs}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="rounded-xl h-10 px-4 border-white/10"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
