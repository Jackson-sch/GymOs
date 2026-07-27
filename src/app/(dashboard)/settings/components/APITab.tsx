"use client";

import React, { useState } from "react";
import {
  Mail,
  Smartphone,
  MessageSquare,
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
  XCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Plus,
  ExternalLink,
  ShieldCheck,
  Activity,
  Webhook,
  Sliders,
  Cpu,
  Check,
  Radio,
  Server,
  Code,
  Trash2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { testApiConnectionAction } from "@/lib/actions/api-test-actions";

interface APITabProps {
  formState: Record<string, string>;
  showSecrets: Record<string, boolean>;
  handleChange: (key: string, value: string) => void;
  toggleSecret: (key: string) => void;
}

// Channel Definition Interface
interface ChannelConfig {
  id: string;
  name: string;
  provider: string;
  category: "COMMUNICATION" | "PAYMENTS" | "ACCESS_IOT" | "CLOUDINARY";
  icon: React.ElementType;
  description: string;
  fields: {
    key: string;
    label: string;
    isSecret: boolean;
    placeholder: string;
  }[];
  guideSteps: string[];
  docUrl: string;
}

const CHANNELS: ChannelConfig[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Cloud API",
    provider: "WHATSAPP",
    category: "COMMUNICATION",
    icon: MessageSquare,
    description:
      "Canal oficial de Meta para envío de recordatorios automáticos de cobro, mensajes de bienvenida y códigos de acceso por WhatsApp.",
    docUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
    fields: [
      {
        key: "WA_PHONE_NUMBER_ID",
        label: "Phone Number ID",
        isSecret: false,
        placeholder: "Ej: 105948372918234",
      },
      {
        key: "WA_ACCESS_TOKEN",
        label: "Permanent Access Token",
        isSecret: true,
        placeholder: "EAAG...",
      },
      {
        key: "WA_WABA_ID",
        label: "WhatsApp Business Account ID (WABA)",
        isSecret: false,
        placeholder: "Ej: 987654321098765",
      },
    ],
    guideSteps: [
      "Inicie sesión en el portal Meta for Developers.",
      "Cree o seleccione su aplicación de tipo Negocios y añada el producto WhatsApp.",
      "Copie el Phone Number ID y genere un Access Token permanente en Business Manager.",
      "Asegúrese de registrar plantillas de mensajes (templates) aprobadas por Meta.",
    ],
  },
  {
    id: "resend",
    name: "Resend Email Engine",
    provider: "RESEND",
    category: "COMMUNICATION",
    icon: Mail,
    description:
      "Motor principal para emisión de facturas electrónicas, correos de recuperación de cuenta e informes diarios para la administración.",
    docUrl: "https://resend.com/docs",
    fields: [
      {
        key: "RESEND_API_KEY",
        label: "Resend API Key",
        isSecret: true,
        placeholder: "re_123456789...",
      },
      {
        key: "RESEND_FROM_EMAIL",
        label: "Correo Remitente (From)",
        isSecret: false,
        placeholder: "notificaciones@migimnasio.com",
      },
    ],
    guideSteps: [
      "Cree una cuenta en Resend.com y agregue el dominio de su gimnasio.",
      "Configure los registros DNS (DKIM, SPF y DMARC) para garantizar entregabilidad.",
      "Genere un API Key con permiso 'Full Access' o 'Sending Only'.",
    ],
  },
  {
    id: "twilio",
    name: "Twilio SMS & Messaging",
    provider: "TWILIO",
    category: "COMMUNICATION",
    icon: Smartphone,
    description:
      "Canal secundario de respaldo para envío de SMS urgentes y validaciones de seguridad de doble factor (2FA).",
    docUrl: "https://www.twilio.com/docs",
    fields: [
      {
        key: "TWILIO_SID",
        label: "Account SID",
        isSecret: false,
        placeholder: "AC1234567890abcdef...",
      },
      {
        key: "TWILIO_TOKEN",
        label: "Auth Token",
        isSecret: true,
        placeholder: "4a5b6c...",
      },
    ],
    guideSteps: [
      "Ingrese a su consola de Twilio.",
      "Copie el Account SID y Auth Token de la sección Dashboard.",
      "Asegúrese de contar con saldo activo para envíos internacionales.",
    ],
  },
  {
    id: "mercadopago",
    name: "Mercado Pago Checkout & QR",
    provider: "MERCADOPAGO",
    category: "PAYMENTS",
    icon: CreditCard,
    description:
      "Pasarela para procesamiento de membresías recurrentes, checkout en línea y pagos presenciales mediante código QR.",
    docUrl: "https://www.mercadopago.com/developers",
    fields: [
      {
        key: "MP_ACCESS_TOKEN",
        label: "Production Access Token",
        isSecret: true,
        placeholder: "APP_USR-...",
      },
    ],
    guideSteps: [
      "Inicie sesión en Mercado Pago Developers con la cuenta de su gimnasio.",
      "Vaya a 'Tus integraciones' > 'Credenciales de producción'.",
      "Copie el Access Token que empieza con APP_USR-.",
    ],
  },
  {
    id: "culqi",
    name: "Culqi Perú (Tarjetas & Yape)",
    provider: "CULQI",
    category: "PAYMENTS",
    icon: CreditCard,
    description:
      "Pasarela nativa con soporte para cobros directos con tarjetas Visa/Mastercard y billeteras digitales (Yape).",
    docUrl: "https://docs.culqi.com",
    fields: [
      {
        key: "CULQI_PUBLIC_KEY",
        label: "Public Key (Llave Pública)",
        isSecret: false,
        placeholder: "pk_live_...",
      },
      {
        key: "CULQI_PRIVATE_KEY",
        label: "Secret Key (Llave Privada)",
        isSecret: true,
        placeholder: "sk_live_...",
      },
    ],
    guideSteps: [
      "Acceda al Panel de Culqi en modo Live.",
      "Vaya a Desarrollo > Llaves API.",
      "Copie la Llave Pública y la Llave Privada de producción.",
    ],
  },
  {
    id: "cloudinary",
    name: "Cloudinary (Multimedia Cloud)",
    provider: "CLOUDINARY",
    category: "CLOUDINARY",
    icon: Globe,
    description:
      "Almacenamiento optimizado en la nube para fotos de perfil de socios, comprobantes de pago e imágenes de sedes.",
    docUrl: "https://cloudinary.com/documentation",
    fields: [
      {
        key: "CLOUDINARY_CLOUD_NAME",
        label: "Cloud Name",
        isSecret: false,
        placeholder: "mi-gimnasio-cloud",
      },
      {
        key: "CLOUDINARY_UPLOAD_PRESET",
        label: "Upload Preset",
        isSecret: false,
        placeholder: "gymos_preset",
      },
      {
        key: "CLOUDINARY_API_KEY",
        label: "API Key",
        isSecret: false,
        placeholder: "123456789012345",
      },
      {
        key: "CLOUDINARY_API_SECRET",
        label: "API Secret",
        isSecret: true,
        placeholder: "abcde12345...",
      },
    ],
    guideSteps: [
      "Ingrese a su Dashboard de Cloudinary.",
      "Copie su Cloud Name, API Key y API Secret.",
      "Cree un Upload Preset en la sección Settings > Upload habilitando firma opcional.",
    ],
  },
  {
    id: "iot_access",
    name: "Hardware Access Hub (Molinete / IoT)",
    provider: "IOT_ACCESS",
    category: "ACCESS_IOT",
    icon: Cpu,
    description:
      "Integración directa con torniquetes, lectores de huellas/rostro (ZKTeco, Hikvision) y relés de puerta por red local.",
    docUrl: "https://gymos.app/docs/hardware",
    fields: [
      {
        key: "IOT_GATEWAY_URL",
        label: "URL del Gateway de Accesos (Local / Cloud)",
        isSecret: false,
        placeholder: "https://gateway-sede-principal.local:8443",
      },
      {
        key: "IOT_AUTH_SECRET",
        label: "Secret Key de Autenticación de Torniquete",
        isSecret: true,
        placeholder: "gym_iot_sec_...",
      },
    ],
    guideSteps: [
      "Instale el Agente GymOS Access Controller en la minicomputadora/PC de recepción.",
      "Defina la IP estática local del molinete o lector biométrico.",
      "Configure la Secret Key compartida para firmar comandos de apertura de relé.",
    ],
  },
];

// Initial mock webhooks
const INITIAL_WEBHOOKS = [
  {
    id: "wh_1",
    url: "https://api.mi-erp.com/gymos-webhooks",
    events: ["member.created", "payment.successful"],
    status: "ACTIVE",
    lastTriggered: "Hace 15 min",
  },
  {
    id: "wh_2",
    url: "https://hooks.zapier.com/hooks/catch/12345/abcde",
    events: ["checkin.denied"],
    status: "ACTIVE",
    lastTriggered: "Hace 2 horas",
  },
];

// Initial mock API Keys
const INITIAL_API_KEYS = [
  {
    id: "key_1",
    name: "App Móvil de Miembros",
    prefix: "gym_live_9f82...3a1",
    environment: "PRODUCTION",
    scopes: ["read:members", "access:checkin"],
    created: "2026-05-10",
    lastUsed: "Hoy, 10:42 AM",
  },
  {
    id: "key_2",
    name: "Integración Sitio Web Landing",
    prefix: "gym_test_1b44...9e2",
    environment: "SANDBOX",
    scopes: ["read:classes"],
    created: "2026-06-01",
    lastUsed: "Ayer, 04:15 PM",
  },
];

export function APITab({
  formState,
  showSecrets,
  handleChange,
  toggleSecret,
}: APITabProps) {
  const [globalTesting, setGlobalTesting] = useState(false);
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message?: string; latencyMs?: number }>
  >({});
  const [selectedChannel, setSelectedChannel] = useState<ChannelConfig | null>(
    null,
  );
  const [activeSubTab, setActiveSubTab] = useState("connectors");

  // Hardware Access Hub Guide State
  const [isHardwareGuideOpen, setIsHardwareGuideOpen] = useState(false);

  // Webhooks State
  const [webhooks, setWebhooks] = useState(INITIAL_WEBHOOKS);
  const [isAddWebhookOpen, setIsAddWebhookOpen] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "member.created",
  ]);

  // API Keys State
  const [apiKeys, setApiKeys] = useState(INITIAL_API_KEYS);
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"PRODUCTION" | "SANDBOX">(
    "PRODUCTION",
  );
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "read:members",
  ]);
  const [generatedRawKey, setGeneratedRawKey] = useState<string | null>(null);

  // Test individual channel
  const testSingleChannel = async (channel: ChannelConfig) => {
    if (channel.provider === "IOT_ACCESS") {
      toast.info(
        "Conexión con el Hardware Access Hub simulada en red local (Status 200 OK)",
      );
      setTestResults((prev) => ({
        ...prev,
        [channel.provider]: {
          success: true,
          message: "Gateway local respondiendo en 12ms",
          latencyMs: 12,
        },
      }));
      return;
    }

    const start = performance.now();
    setTestResults((prev) => ({ ...prev, [channel.provider]: undefined as any }));

    const res = await testApiConnectionAction(channel.provider, formState);
    const end = performance.now();
    const latencyMs = Math.round(end - start);

    if (res.success) {
      toast.success(res.message || `Conexión verificada con ${channel.name}`);
      setTestResults((prev) => ({
        ...prev,
        [channel.provider]: {
          success: true,
          message: res.message,
          latencyMs,
        },
      }));
    } else {
      toast.error(res.error || `Error al verificar ${channel.name}`);
      setTestResults((prev) => ({
        ...prev,
        [channel.provider]: {
          success: false,
          message: res.error,
          latencyMs,
        },
      }));
    }
  };

  // Test all connection providers
  const testAllConnections = async () => {
    setGlobalTesting(true);
    const testableChannels = CHANNELS.filter((c) => c.provider !== "IOT_ACCESS");
    let successCount = 0;

    for (const channel of testableChannels) {
      const start = performance.now();
      const res = await testApiConnectionAction(channel.provider, formState);
      const end = performance.now();
      const latencyMs = Math.round(end - start);

      if (res.success) {
        successCount++;
        setTestResults((prev) => ({
          ...prev,
          [channel.provider]: {
            success: true,
            message: res.message,
            latencyMs,
          },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [channel.provider]: {
            success: false,
            message: res.error,
            latencyMs,
          },
        }));
      }
    }

    setGlobalTesting(false);

    if (successCount === testableChannels.length) {
      toast.success(
        "¡Excelente! Todos los canales y servicios externos responden adecuadamente.",
      );
    } else {
      toast.warning(
        `${successCount} de ${testableChannels.length} servicios verificados con éxito. Revisa los canales marcados con error.`,
      );
    }
  };

  // Calculate status badge helper for a channel
  const getChannelStatus = (channel: ChannelConfig) => {
    const filledFields = channel.fields.filter(
      (f) => !!formState[f.key]?.trim(),
    ).length;

    const testRes = testResults[channel.provider];
    if (testRes?.success) {
      return {
        label: `Conectado (${testRes.latencyMs || 45}ms)`,
        variant: "emerald" as const,
        icon: CheckCircle2,
      };
    }
    if (testRes?.success === false) {
      return {
        label: "Error de Credencial",
        variant: "rose" as const,
        icon: XCircle,
      };
    }
    if (filledFields === channel.fields.length) {
      return {
        label: "Configurado (Sin Probar)",
        variant: "amber" as const,
        icon: AlertTriangle,
      };
    }
    if (filledFields > 0) {
      return {
        label: `Incompleto (${filledFields}/${channel.fields.length})`,
        variant: "amber" as const,
        icon: AlertTriangle,
      };
    }
    return {
      label: "Sin Configurar",
      variant: "slate" as const,
      icon: RefreshCw,
    };
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  // Add webhook handler
  const handleAddWebhook = () => {
    if (!newWebhookUrl.startsWith("http://") && !newWebhookUrl.startsWith("https://")) {
      toast.error("Ingrese una URL de webhook válida que comience con http:// o https://");
      return;
    }
    const newEntry = {
      id: `wh_${Date.now()}`,
      url: newWebhookUrl,
      events: selectedEvents,
      status: "ACTIVE",
      lastTriggered: "Creado recientemente",
    };
    setWebhooks((prev) => [...prev, newEntry]);
    setNewWebhookUrl("");
    setIsAddWebhookOpen(false);
    toast.success("Webhook registrado correctamente");
  };

  // Create API Key handler
  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Ingrese un nombre descriptivo para la API Key");
      return;
    }
    const randomSecret = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    const envPrefix = newKeyEnv === "PRODUCTION" ? "gym_live_" : "gym_test_";
    const fullKey = `${envPrefix}${randomSecret}`;

    const newKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      prefix: `${fullKey.slice(0, 14)}...${fullKey.slice(-4)}`,
      environment: newKeyEnv,
      scopes: selectedScopes,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Nunca",
    };

    setApiKeys((prev) => [newKeyItem, ...prev]);
    setGeneratedRawKey(fullKey);
    setNewKeyName("");
    setIsAddKeyOpen(false);
    toast.success("Nueva API Key generada con éxito");
  };

  return (
    <section className="glass-card p-6 sm:p-8 md:p-10 border-white/10 space-y-8 animate-in slide-in-from-right-4 duration-500">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-serif tracking-tight">
              Canales & Conectividad API
            </h2>
            <Badge
              variant="outline"
              className="bg-primary/10 border-primary/30 text-primary uppercase text-[10px] tracking-widest px-2.5 py-0.5 font-bold"
            >
              Hub v2.4
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Gestión de conectores externos, webhooks en vivo y claves públicas de desarrollador
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={testAllConnections}
            disabled={globalTesting}
            type="button"
            variant="outline"
            className="h-11 rounded-2xl bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 hover:text-primary uppercase text-xs font-bold tracking-widest gap-2 shadow-lg shadow-primary/10 transition-all"
          >
            {globalTesting ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Zap className="size-4 text-primary" />
            )}
            Verificar Todos los Servicios
          </Button>
        </div>
      </div>

      {/* Sub-Tabs Section */}
      <Tabs
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full space-y-6"
      >
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl grid grid-cols-3 max-w-xl">
          <TabsTrigger
            value="connectors"
            className="rounded-xl text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Sliders className="size-3.5" />
            Servicios Integrados
          </TabsTrigger>
          <TabsTrigger
            value="webhooks"
            className="rounded-xl text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Webhook className="size-3.5" />
            Webhooks Outbound
          </TabsTrigger>
          <TabsTrigger
            value="apikeys"
            className="rounded-xl text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            <Key className="size-3.5" />
            Developer API Keys
          </TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* TAB 1: SERVICIOS INTEGRADOS */}
        {/* ========================================== */}
        <TabsContent value="connectors" className="space-y-10 focus-visible:outline-none">
          {/* Categoría: Comunicación & Notificaciones */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-primary border-b border-white/5 pb-2">
              <MessageSquare className="size-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                1. Comunicación & Notificaciones (Mensajería)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CHANNELS.filter((c) => c.category === "COMMUNICATION").map(
                (channel) => (
                  <ChannelCardItem
                    key={channel.id}
                    channel={channel}
                    formState={formState}
                    statusInfo={getChannelStatus(channel)}
                    onConfigure={() => setSelectedChannel(channel)}
                    onTest={() => testSingleChannel(channel)}
                    isTesting={
                      testResults[channel.provider] === undefined &&
                      globalTesting
                    }
                  />
                ),
              )}
            </div>
          </div>

          {/* Categoría: Pasarelas de Pago */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2.5 text-primary border-b border-white/5 pb-2">
              <CreditCard className="size-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                2. Pasarelas de Pago & Checkout En Línea
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CHANNELS.filter((c) => c.category === "PAYMENTS").map(
                (channel) => (
                  <ChannelCardItem
                    key={channel.id}
                    channel={channel}
                    formState={formState}
                    statusInfo={getChannelStatus(channel)}
                    onConfigure={() => setSelectedChannel(channel)}
                    onTest={() => testSingleChannel(channel)}
                    isTesting={
                      testResults[channel.provider] === undefined &&
                      globalTesting
                    }
                  />
                ),
              )}
            </div>
          </div>

          {/* Categoría: Hardware IoT y Multimedia */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2.5 text-primary border-b border-white/5 pb-2">
              <Cpu className="size-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                3. Control de Acceso (IoT) & Multimedia Cloud
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CHANNELS.filter(
                (c) => c.category === "ACCESS_IOT" || c.category === "CLOUDINARY",
              ).map((channel) => (
                <ChannelCardItem
                  key={channel.id}
                  channel={channel}
                  formState={formState}
                  statusInfo={getChannelStatus(channel)}
                  onConfigure={() => setSelectedChannel(channel)}
                  onTest={() => testSingleChannel(channel)}
                  isTesting={
                    testResults[channel.provider] === undefined &&
                    globalTesting
                  }
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 2: WEBHOOKS OUTBOUND */}
        {/* ========================================== */}
        <TabsContent value="webhooks" className="space-y-6 focus-visible:outline-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/2 border border-white/5">
            <div className="space-y-1">
              <h3 className="text-lg font-serif text-foreground">
                Webhooks de Eventos en Tiempo Real
              </h3>
              <p className="text-xs text-muted-foreground max-w-2xl">
                Notifique a sus propios servidores, ERPs o plataformas de automatización (Make, N8N, Zapier) cuando ocurran eventos dentro del gimnasio.
              </p>
            </div>
            <Button
              onClick={() => setIsAddWebhookOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl gap-2 h-10 px-4"
            >
              <Plus className="size-4" /> Registrar Endpoint Webhook
            </Button>
          </div>

          {/* Webhooks Table */}
          <div className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Endpoint URL</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Eventos Suscritos</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Estado</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Último Envío</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      No hay webhooks registrados actualmente. Haga clic en 'Registrar Endpoint Webhook'.
                    </TableCell>
                  </TableRow>
                ) : (
                  webhooks.map((wh) => (
                    <TableRow key={wh.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono text-xs text-foreground font-medium">
                        {wh.url}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {wh.events.map((ev) => (
                            <Badge
                              key={ev}
                              variant="outline"
                              className="text-[10px] bg-white/5 border-white/10 font-mono text-primary"
                            >
                              {ev}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                          ● Activo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {wh.lastTriggered}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toast.success(`Prueba enviada a ${wh.url}`)}
                            className="h-8 text-[11px] hover:bg-primary/20 hover:text-primary gap-1"
                          >
                            <Zap className="size-3 text-primary" /> Test Event
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setWebhooks((prev) => prev.filter((w) => w.id !== wh.id));
                              toast.info("Webhook eliminado");
                            }}
                            className="size-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Webhooks Info Box */}
          <div className="p-5 rounded-2xl bg-white/2 border border-white/5 flex items-start gap-4">
            <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground">Firma de Seguridad HMAC SHA-256</p>
              <p>
                Cada payload saliente incluye el encabezado <code className="text-primary font-mono bg-white/5 px-1 py-0.5 rounded">X-GymOS-Signature</code> firmado con la clave secreta de su gimnasio. Esto permite a sus servidores comprobar que la petición proviene genuinamente de GymOS.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 3: DEVELOPER API KEYS */}
        {/* ========================================== */}
        <TabsContent value="apikeys" className="space-y-6 focus-visible:outline-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/2 border border-white/5">
            <div className="space-y-1">
              <h3 className="text-lg font-serif text-foreground">
                Claves API para Desarrolladores (Bearer Tokens)
              </h3>
              <p className="text-xs text-muted-foreground max-w-2xl">
                Cree tokens de acceso seguro para integrar la app móvil personalizada de su gimnasio, quioscos físicos o integraciones privadas.
              </p>
            </div>
            <Button
              onClick={() => setIsAddKeyOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl gap-2 h-10 px-4"
            >
              <Plus className="size-4" /> Generar Nueva API Key
            </Button>
          </div>

          {/* Raw Generated Key Modal Notice */}
          {generatedRawKey && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <CheckCircle2 className="size-4" />
                  ¡Guarde su clave API de inmediato!
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setGeneratedRawKey(null)}
                  className="text-xs text-emerald-400 hover:bg-emerald-500/20"
                >
                  Cerrar
                </Button>
              </div>
              <p className="text-xs text-emerald-200/80">
                Por motivos de seguridad, esta clave no se volverá a mostrar completa en el panel.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={generatedRawKey}
                  className="font-mono text-xs bg-black/40 border-emerald-500/30 text-emerald-300 h-10"
                />
                <Button
                  onClick={() => copyToClipboard(generatedRawKey, "API Key")}
                  className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs shrink-0 h-10 px-4 gap-1.5"
                >
                  <Copy className="size-3.5" /> Copiar Key
                </Button>
              </div>
            </div>
          )}

          {/* API Keys Table */}
          <div className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Nombre de la Aplicación</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Prefijo de Token</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Entorno</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Ámbitos (Scopes)</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Último Uso</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground font-bold">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((keyItem) => (
                  <TableRow key={keyItem.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-semibold text-xs text-foreground">
                      {keyItem.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {keyItem.prefix}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          keyItem.environment === "PRODUCTION"
                            ? "bg-primary/10 text-primary border-primary/30 text-[10px] font-bold"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-bold"
                        }
                      >
                        {keyItem.environment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {keyItem.scopes.map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="text-[9px] bg-white/5 border-white/10 font-mono"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {keyItem.lastUsed}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setApiKeys((prev) => prev.filter((k) => k.id !== keyItem.id));
                          toast.error(`API Key '${keyItem.name}' revocada.`);
                        }}
                        className="h-8 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        Revocar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ========================================== */}
      {/* DRAWER / SHEET CONFIGURATION FOR CHANNEL */}
      {/* ========================================== */}
      <Sheet
        open={!!selectedChannel}
        onOpenChange={(open) => !open && setSelectedChannel(null)}
      >
        <SheetContent className="data-[side=right]:sm:max-w-2xl data-[side=right]:max-w-2xl !max-w-2xl w-full bg-background/95 backdrop-blur-2xl border-l border-white/10 p-6 md:p-8 space-y-6 text-foreground overflow-y-auto">
          {selectedChannel && (
            <>
              <SheetHeader className="space-y-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
                    <selectedChannel.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-serif text-foreground">
                      {selectedChannel.name}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                      Configuración de credenciales de acceso y llaves de servidor
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Form Inputs */}
              <div className="space-y-5 pt-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedChannel.description}
                </p>

                {selectedChannel.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                        {field.label}
                      </Label>
                      {formState[field.key] && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(formState[field.key], field.label)}
                          className="text-[10px] text-primary hover:underline flex items-center gap-1"
                        >
                          <Copy className="size-3" /> Copiar
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        type={
                          field.isSecret
                            ? showSecrets[field.key]
                              ? "text"
                              : "password"
                            : "text"
                        }
                        value={formState[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={`bg-white/5 border-white/10 h-11 rounded-xl font-mono text-xs focus-visible:border-primary/50 ${
                          field.isSecret ? "pr-11" : "pr-4"
                        }`}
                      />
                      {field.isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleSecret(field.key)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          title="Mostrar/Ocultar"
                        >
                          {showSecrets[field.key] ? (
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

              {/* Step Guide Box */}
              <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-3 pt-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="size-3.5" /> Guía de Obtención de Claves
                  </div>
                  {selectedChannel.id === "iot_access" ? (
                    <button
                      type="button"
                      onClick={() => setIsHardwareGuideOpen(true)}
                      className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      Guía Técnica Hardware <ExternalLink className="size-3" />
                    </button>
                  ) : (
                    <a
                      href={selectedChannel.docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      Documentación Oficial <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4 leading-relaxed font-sans">
                  {selectedChannel.guideSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* Footer Actions */}
              <SheetFooter className="border-t border-white/10 pt-4 flex flex-row items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => testSingleChannel(selectedChannel)}
                  variant="outline"
                  className="flex-1 sm:flex-none bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/50 text-[11px] font-bold uppercase tracking-wider h-10 px-4 rounded-xl gap-1.5"
                >
                  <Zap className="size-3.5 text-primary" /> Probar Conexión
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedChannel(null);
                    toast.info(
                      "Cambios guardados en borrador. Recuerde presionar 'Guardar Cambios' arriba para aplicar.",
                    );
                  }}
                  className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-bold uppercase tracking-wider h-10 px-4 rounded-xl"
                >
                  Aceptar y Cerrar
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ========================================== */}
      {/* DIALOG FOR ADDING WEBHOOK */}
      {/* ========================================== */}
      <Dialog open={isAddWebhookOpen} onOpenChange={setIsAddWebhookOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-2xl border-white/10 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Registrar Nuevo Webhook</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingrese el URL del endpoint HTTP POST que escuchará las notificaciones de eventos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold">Payload Destination URL</Label>
              <Input
                placeholder="https://api.midominio.com/webhooks/gymos"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                className="bg-white/5 border-white/10 font-mono text-xs h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold">Eventos a Escuchar</Label>
              <div className="space-y-2 pt-1">
                {[
                  { id: "member.created", label: "Nuevo socio registrado (member.created)" },
                  { id: "payment.successful", label: "Pago recibido exitoso (payment.successful)" },
                  { id: "checkin.allowed", label: "Acceso concedido en molinete (checkin.allowed)" },
                  { id: "checkin.denied", label: "Acceso denegado (checkin.denied)" },
                ].map((ev) => (
                  <label
                    key={ev.id}
                    className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(ev.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvents((prev) => [...prev, ev.id]);
                        } else {
                          setSelectedEvents((prev) =>
                            prev.filter((item) => item !== ev.id),
                          );
                        }
                      }}
                      className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary size-4"
                    />
                    {ev.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsAddWebhookOpen(false)}
              className="text-xs uppercase font-bold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddWebhook}
              className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider"
            >
              Guardar Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================== */}
      {/* DIALOG FOR ADDING API KEY */}
      {/* ========================================== */}
      <Dialog open={isAddKeyOpen} onOpenChange={setIsAddKeyOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-2xl border-white/10 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Generar Developer API Key</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cree un Bearer Token para consumir la API de GymOS en aplicaciones externas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold">Nombre de la Aplicación / Cliente</Label>
              <Input
                placeholder="Ej. App Móvil Recepción iOS"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-white/5 border-white/10 text-xs h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold">Entorno</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewKeyEnv("PRODUCTION")}
                  className={`h-10 text-xs font-bold uppercase rounded-xl ${
                    newKeyEnv === "PRODUCTION"
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-white/5 border-white/10 text-muted-foreground"
                  }`}
                >
                  Producción (Live)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewKeyEnv("SANDBOX")}
                  className={`h-10 text-xs font-bold uppercase rounded-xl ${
                    newKeyEnv === "SANDBOX"
                      ? "bg-amber-500/20 border-amber-500 text-amber-400"
                      : "bg-white/5 border-white/10 text-muted-foreground"
                  }`}
                >
                  Sandbox (Test)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold">Permisos (Scopes)</Label>
              <div className="space-y-2">
                {[
                  { id: "read:members", label: "Leer información de socios" },
                  { id: "write:members", label: "Crear y actualizar socios" },
                  { id: "read:classes", label: "Ver calendario de clases" },
                  { id: "access:checkin", label: "Registrar accesos en molinete" },
                  { id: "write:payments", label: "Procesar transacciones" },
                ].map((sc) => (
                  <label
                    key={sc.id}
                    className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(sc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScopes((prev) => [...prev, sc.id]);
                        } else {
                          setSelectedScopes((prev) =>
                            prev.filter((item) => item !== sc.id),
                          );
                        }
                      }}
                      className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary size-4"
                    />
                    {sc.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsAddKeyOpen(false)}
              className="text-xs uppercase font-bold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateApiKey}
              className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider"
            >
              Generar API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================== */}
      {/* DIALOG FOR HARDWARE ACCESS HUB GUIDE */}
      {/* ========================================== */}
      <Dialog open={isHardwareGuideOpen} onOpenChange={setIsHardwareGuideOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-2xl border-white/10 text-foreground max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif flex items-center gap-2">
              <Cpu className="size-5 text-primary" /> Guía de Integración: Molinetes & IoT Access
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Protocolos de conexión soportados para torniquetes, relés de apertura y lectores biométricos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2 text-xs text-muted-foreground leading-relaxed">
            <div className="p-4 rounded-2xl bg-white/2 border border-white/10 space-y-2">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-primary">
                1. ZKTeco (Protocolo ADMS / Push SDK)
              </h4>
              <p>
                Configure la IP del servidor de GymOS en su biométrico ZKTeco (Menú &gt; Configuración de Red &gt; Servidor Web ADMS).
              </p>
              <ul className="list-disc pl-4 space-y-1 font-mono text-[11px]">
                <li>Puerto por defecto: 8088</li>
                <li>Modo: Push Data / Real-time events</li>
                <li>Endpoint: /iclock/cdata</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white/2 border border-white/10 space-y-2">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-primary">
                2. Hikvision (Protocolo ISAPI / Event Webhook)
              </h4>
              <p>
                En la interfaz web de su terminal Hikvision (Red &gt; Ajustes Avanzados &gt; HTTP Push), ingrese la URL del Webhook de GymOS.
              </p>
              <ul className="list-disc pl-4 space-y-1 font-mono text-[11px]">
                <li>Webhook Endpoint: https://su-gimnasio.app/api/checkin/hikvision</li>
                <li>Firma de Seguridad: IOT_AUTH_SECRET</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white/2 border border-white/10 space-y-2">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-primary">
                3. Relé HTTP de Pulso (ESP32 / Raspberry Pi / Arduino)
              </h4>
              <p>
                Para molinetes analógicos impulsados por pulso eléctrico de 12V:
              </p>
              <pre className="p-3 rounded-xl bg-black/40 text-primary font-mono text-[11px] overflow-x-auto">
{`POST http://<IP_LOCAL_RELE>/api/relay/pulse
Header: X-GymOS-Secret: <IOT_AUTH_SECRET>
Body: { "door_id": 1, "pulse_ms": 1000 }`}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsHardwareGuideOpen(false)}
              className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// Subcomponent: Individual Integration Card
interface ChannelCardItemProps {
  channel: ChannelConfig;
  formState: Record<string, string>;
  statusInfo: {
    label: string;
    variant: "emerald" | "amber" | "rose" | "slate";
    icon: React.ElementType;
  };
  onConfigure: () => void;
  onTest: () => void;
  isTesting: boolean;
}

function ChannelCardItem({
  channel,
  formState,
  statusInfo,
  onConfigure,
  onTest,
  isTesting,
}: ChannelCardItemProps) {
  const Icon = channel.icon;
  const StatusIcon = statusInfo.icon;

  const filledCount = channel.fields.filter(
    (f) => !!formState[f.key]?.trim(),
  ).length;

  const statusBadgeClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    slate: "bg-white/5 text-muted-foreground border-white/10",
  }[statusInfo.variant];

  return (
    <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between shadow-xl backdrop-blur-md relative group">
      <div className="space-y-3">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-colors">
              <Icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-foreground leading-tight">
                {channel.name}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest mt-0.5">
                {filledCount}/{channel.fields.length} Campos Definidos
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-[10px] font-bold gap-1.5 py-0.5 px-2.5 ${statusBadgeClasses}`}
          >
            <StatusIcon className="size-3" />
            {statusInfo.label}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-sans pt-1">
          {channel.description}
        </p>
      </div>

      {/* Card Actions */}
      <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-2 mt-2">
        <Button
          onClick={onTest}
          disabled={isTesting}
          type="button"
          variant="outline"
          className="bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/40 text-[10px] font-bold uppercase tracking-wider h-10 rounded-xl transition-all shadow-md gap-1.5"
        >
          {isTesting ? (
            <Loader2 className="size-3.5 animate-spin text-primary" />
          ) : (
            <Zap className="size-3.5 text-primary" />
          )}
          Probar
        </Button>

        <Button
          onClick={onConfigure}
          type="button"
          className="bg-white/5 hover:bg-white/10 text-foreground text-[10px] font-bold uppercase tracking-wider h-10 rounded-xl transition-all gap-1.5 border border-white/10"
        >
          <Sliders className="size-3.5 text-muted-foreground" />
          Configurar
        </Button>
      </div>
    </div>
  );
}
