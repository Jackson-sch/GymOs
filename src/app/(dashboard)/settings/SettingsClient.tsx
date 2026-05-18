"use client";

import React, { useState, useEffect, useReducer, type SyntheticEvent } from "react";
import {
  Globe,
  Bell,
  Key,
  Shield,
  Smartphone,
  User,
  Eye,
  Cpu,
} from "lucide-react";
import {
  updateConfigsAction,
  triggerCronJobsAction,
} from "@/lib/actions/settings-actions";
import { getAuditLogsAction } from "@/lib/actions/audit-actions";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

// Sub-components
import { SettingsHeader } from "./components/SettingsHeader";
import { SettingsTabs } from "./components/SettingsTabs";
import { GeneralTab } from "./components/GeneralTab";
import { BrandingTab } from "./components/BrandingTab";
import { AccountTab } from "./components/AccountTab";
import { NotificationsTab } from "./components/NotificationsTab";
import { APITab } from "./components/APITab";
import { SecurityTab } from "./components/SecurityTab";
import { AuditTab } from "./components/AuditTab";
import { SystemTab } from "./components/SystemTab";

// Reducers
const passwordReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return { currentPassword: "", newPassword: "", confirmPassword: "" };
    default:
      return state;
  }
};

const auditReducer = (state: any, action: any) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        logs: action.logs,
        totalPages: action.totalPages,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export function SettingsClient({ initialData }: { initialData: any[] }) {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsString.withDefault("general").withOptions({ shallow: false }),
  );
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Security state with useReducer
  const [passwordForm, dispatchPassword] = useReducer(passwordReducer, {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Audit logs state with useReducer
  const [auditState, dispatchAudit] = useReducer(auditReducer, {
    logs: [],
    loading: false,
    totalPages: 1,
  });

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  );

  useEffect(() => {
    if (activeTab === "audit") {
      loadLogs(currentPage);
    }
  }, [activeTab, currentPage]);

  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;

  const handlePasswordChange = async (e: SyntheticEvent<HTMLFormElement>) => {
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
      dispatchPassword({ type: "RESET" });
    }
    setPasswordLoading(false);
  };

  const loadLogs = async (page: number = 1) => {
    dispatchAudit({ type: "FETCH_START" });
    const result = await getAuditLogsAction({ page, limit: 15 });
    if (result.success) {
      dispatchAudit({
        type: "FETCH_SUCCESS",
        logs: result.data || [],
        totalPages: result.totalPages || 1,
      });
    } else {
      dispatchAudit({ type: "FETCH_ERROR" });
    }
  };

  // Transform flat array to key-value object for easier form management
  const [formState, setFormState] = React.useState<Record<string, string>>(
    () => {
      const state: Record<string, string> = {};
      initialData.forEach((item) => {
        state[item.key] = item.value;
      });
      return state;
    },
  );

  const handleChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    const configsToUpdate = Object.entries(formState).map(([key, value]) => {
      const original = initialData.find((d) => d.key === key);
      return {
        key,
        value,
        category: original?.category || "GENERAL",
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
    { id: "branding", label: "Marca & UI", icon: Cpu },
    { id: "account", label: "Mi Cuenta", icon: User },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "api", label: "Canales API", icon: Key },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "audit", label: "Registro de Auditoría", icon: Eye },
    { id: "system", label: "Sistema & Mantenimiento", icon: Cpu },
  ];

  const handleTriggerCron = async () => {
    setLoading(true);
    const res = await triggerCronJobsAction();
    if (res.success) {
      toast.success("Mantenimiento completado con éxito");
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <SettingsHeader loading={loading} onSave={handleSave} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <SettingsTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setCurrentPage={setCurrentPage}
        />

        <div className="lg:col-span-9 space-y-10">
          {activeTab === "general" && (
            <GeneralTab formState={formState} handleChange={handleChange} />
          )}

          {activeTab === "branding" && (
            <BrandingTab formState={formState} handleChange={handleChange} />
          )}

          {activeTab === "account" && <AccountTab user={user} />}

          {activeTab === "notifications" && (
            <NotificationsTab
              formState={formState}
              handleChange={handleChange}
            />
          )}

          {activeTab === "api" && (
            <APITab
              formState={formState}
              showSecrets={showSecrets}
              handleChange={handleChange}
              toggleSecret={toggleSecret}
            />
          )}

          {activeTab === "security" && (
            <SecurityTab
              passwordForm={passwordForm}
              setPasswordForm={(form) => {
                // Since sub-component expects a setter, we adapt it
                if (typeof form === "function") {
                  const nextForm = form(passwordForm);
                  Object.entries(nextForm).forEach(([field, value]) => {
                    dispatchPassword({ type: "SET_FIELD", field, value });
                  });
                } else {
                  Object.entries(form).forEach(([field, value]) => {
                    dispatchPassword({ type: "SET_FIELD", field, value });
                  });
                }
              }}
              passwordLoading={passwordLoading}
              onPasswordChange={handlePasswordChange}
            />
          )}

          {activeTab === "audit" && (
            <AuditTab
              auditLogs={auditState.logs}
              loadingLogs={auditState.loading}
              currentPage={currentPage}
              totalPages={auditState.totalPages}
              onRefresh={() => loadLogs(currentPage)}
              setCurrentPage={setCurrentPage}
            />
          )}

          {activeTab === "system" && (
            <SystemTab loading={loading} onTriggerCron={handleTriggerCron} />
          )}
        </div>
      </div>
    </div>
  );
}
