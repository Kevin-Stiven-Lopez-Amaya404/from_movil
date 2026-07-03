import { useCallback } from "react";

import { AppLanguage, useSmartHome } from "@/lib/smart-home-context";

/**
 * Diccionarios de traduccion de la aplicacion.
 *
 * Cada clave representa un texto reutilizable. Las pantallas llaman `t("clave")`
 * en vez de escribir el texto fijo directamente.
 *
 * Nota tecnica:
 * algunos textos muestran caracteres dañados por codificacion previa. La mejora
 * recomendada es normalizar este archivo completo a UTF-8.
 */
const dictionaries = {
  es: {
    "action.back": "Volver",
    "action.cancel": "Cancelar",
    "action.configure": "Configurar",
    "action.deactivate": "Desactivar",
    "action.logout": "Cerrar sesión",
    "action.restore": "Restaurar",
    "action.save": "Guardar",
    "action.viewAudit": "Ver auditoría",
    "common.active": "Activo",
    "common.inactive": "Inactivo",
    "common.noNews": "Sin novedades",
    "common.pendingAlert": "{count} alerta pendiente",
    "common.pendingAlerts": "{count} alertas pendientes",
    "common.readyBackend": "Módulo listo para conectar con el backend.",
    "profile.accountHome": "Casa de {name} · {count} hogares",
    "profile.accountModule": "Cuenta y hogares",
    "profile.accountModuleSubtitle": "Perfil, hogares, mensajes y soporte.",
    "profile.activeDevices": "{count} dispositivos activos",
    "profile.audit": "Auditoría",
    "profile.auditBody": "Último acceso: hoy\nAlertas pendientes: {alerts}\nDispositivos activos: {devices}\nModo sin conexión: {offline}",
    "profile.auditDescription": "Consulta actividad reciente y eventos de seguridad.",
    "profile.dataRestored": "Datos restaurados",
    "profile.dataRestoredBody": "Las preferencias locales volvieron a su estado inicial.",
    "profile.deactivateAccount": "Desactivar cuenta",
    "profile.deactivateDescription": "Pausa el acceso y la sincronización de tu cuenta.",
    "profile.deactivatePrompt": "Tu cuenta dejará de iniciar sesión y se pausará la sincronización.",
    "profile.editInfo": "Editar información de perfil",
    "profile.greeting": "Hola, {name}",
    "profile.helpCenter": "Centro de ayuda",
    "profile.helpSubtitle": "Soporte y preguntas frecuentes",
    "profile.language": "Idioma",
    "profile.languageDescription": "Selecciona el idioma principal de la app.",
    "profile.logoutPrompt": "Tu sesión local se cerrará y volverás al inicio.",
    "profile.manageHomes": "Administrar hogares",
    "profile.messageCenter": "Centro de mensajes",
    "profile.offline": "Modo sin conexión",
    "profile.offlineDescription": "Conserva datos recientes y pausa sincronizaciones externas.",
    "profile.offlineOffText": "La app sincronizará cuando haya conexión.",
    "profile.offlineOnText": "La app usará datos guardados.",
    "profile.preferences": "Preferencias",
    "profile.preferencesSubtitle": "Idioma y comportamiento de sincronización.",
    "profile.restoreData": "Restauración de datos",
    "profile.restoreDataAction": "Restaurar datos",
    "profile.restoreDescription": "Restablece preferencias locales y datos de prueba.",
    "profile.restorePrompt": "Se restaurarán preferencias locales y datos de prueba sin eliminar la cuenta.",
    "profile.securityData": "Seguridad y datos",
    "profile.securityDataSubtitle": "Auditoría, restauración y control de cuenta.",
    "profile.session": "Sesión",
    "settings.account": "Cuenta",
    "settings.appearance": "Apariencia",
    "settings.appearanceDescription": "Selecciona el modo visual de la aplicación.",
    "settings.dark": "Oscuro",
    "settings.deactivateDescription": "Pausa el acceso y la sincronización de la cuenta.",
    "settings.light": "Claro",
    "settings.pendingBody": "Apartado preparado para conectar con el backend cuando esté disponible.",
    "settings.subtitle": "Cuenta, tema e integraciones.",
    "settings.title": "Configuración",
    "settings.voiceDescription": "Controla hogares y dispositivos con asistentes compatibles.",
    "settings.voiceIntegrations": "Integraciones de voz",
    "settings.voiceAssistant": "Asistente de voz",
    "settings.voiceAssistantDescription": "Control de hogares y dispositivos por comandos de voz.",
    "settings.voiceAlexaDescription": "Preparado para vincular Alexa cuando exista backend OAuth.",
    "tab.dashboard": "Dashboard",
    "tab.homes": "Hogares",
    "tab.profile": "Perfil",
    "tab.reports": "Reportes",
  },
  en: {
    "action.back": "Back",
    "action.cancel": "Cancel",
    "action.configure": "Configure",
    "action.deactivate": "Deactivate",
    "action.logout": "Log out",
    "action.restore": "Restore",
    "action.save": "Save",
    "action.viewAudit": "View audit",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.noNews": "No updates",
    "common.pendingAlert": "{count} pending alert",
    "common.pendingAlerts": "{count} pending alerts",
    "common.readyBackend": "Module ready to connect with the backend.",
    "profile.accountHome": "{name}'s home · {count} homes",
    "profile.accountModule": "Account and homes",
    "profile.accountModuleSubtitle": "Profile, homes, messages and support.",
    "profile.activeDevices": "{count} active devices",
    "profile.audit": "Audit",
    "profile.auditBody": "Last access: today\nPending alerts: {alerts}\nActive devices: {devices}\nOffline mode: {offline}",
    "profile.auditDescription": "Review recent activity and security events.",
    "profile.dataRestored": "Data restored",
    "profile.dataRestoredBody": "Local preferences returned to their initial state.",
    "profile.deactivateAccount": "Deactivate account",
    "profile.deactivateDescription": "Pause account access and synchronization.",
    "profile.deactivatePrompt": "Your account will stop signing in and synchronization will pause.",
    "profile.editInfo": "Edit profile information",
    "profile.greeting": "Hello, {name}",
    "profile.helpCenter": "Help center",
    "profile.helpSubtitle": "Support and frequently asked questions",
    "profile.language": "Language",
    "profile.languageDescription": "Select the app primary language.",
    "profile.logoutPrompt": "Your local session will close and return to start.",
    "profile.manageHomes": "Manage homes",
    "profile.messageCenter": "Message center",
    "profile.offline": "Offline mode",
    "profile.offlineDescription": "Keep recent data and pause external sync.",
    "profile.offlineOffText": "The app will sync when connected.",
    "profile.offlineOnText": "The app will use saved data.",
    "profile.preferences": "Preferences",
    "profile.preferencesSubtitle": "Language and sync behavior.",
    "profile.restoreData": "Data restoration",
    "profile.restoreDataAction": "Restore data",
    "profile.restoreDescription": "Reset local preferences and test data.",
    "profile.restorePrompt": "Local preferences and test data will be restored without deleting the account.",
    "profile.securityData": "Security and data",
    "profile.securityDataSubtitle": "Audit, restoration and account control.",
    "profile.session": "Session",
    "settings.account": "Account",
    "settings.appearance": "Appearance",
    "settings.appearanceDescription": "Select the visual mode of the app.",
    "settings.dark": "Dark",
    "settings.deactivateDescription": "Pause account access and synchronization.",
    "settings.light": "Light",
    "settings.pendingBody": "Section ready to connect with the backend when available.",
    "settings.subtitle": "Account, theme and integrations.",
    "settings.title": "Settings",
    "settings.voiceDescription": "Control homes and devices with compatible assistants.",
    "settings.voiceIntegrations": "Voice integrations",
    "settings.voiceAssistant": "Voice assistant",
    "settings.voiceAssistantDescription": "Control homes and devices with voice commands.",
    "settings.voiceAlexaDescription": "Ready to link Alexa when OAuth backend exists.",
    "tab.dashboard": "Dashboard",
    "tab.homes": "Homes",
    "tab.profile": "Profile",
    "tab.reports": "Reports",
  },
  pt: {
    "action.back": "Voltar",
    "action.cancel": "Cancelar",
    "action.configure": "Configurar",
    "action.deactivate": "Desativar",
    "action.logout": "Sair",
    "action.restore": "Restaurar",
    "action.save": "Salvar",
    "action.viewAudit": "Ver auditoria",
    "common.active": "Ativo",
    "common.inactive": "Inativo",
    "common.noNews": "Sem novidades",
    "common.pendingAlert": "{count} alerta pendente",
    "common.pendingAlerts": "{count} alertas pendentes",
    "common.readyBackend": "Módulo pronto para conectar com o backend.",
    "profile.accountHome": "Casa de {name} · {count} lares",
    "profile.accountModule": "Conta e lares",
    "profile.accountModuleSubtitle": "Perfil, lares, mensagens e suporte.",
    "profile.activeDevices": "{count} dispositivos ativos",
    "profile.audit": "Auditoria",
    "profile.auditBody": "Último acesso: hoje\nAlertas pendentes: {alerts}\nDispositivos ativos: {devices}\nModo offline: {offline}",
    "profile.auditDescription": "Consulte atividade recente e eventos de segurança.",
    "profile.dataRestored": "Dados restaurados",
    "profile.dataRestoredBody": "As preferências locais voltaram ao estado inicial.",
    "profile.deactivateAccount": "Desativar conta",
    "profile.deactivateDescription": "Pause o acesso e a sincronização da conta.",
    "profile.deactivatePrompt": "Sua conta deixará de iniciar sessão e a sincronização será pausada.",
    "profile.editInfo": "Editar informações do perfil",
    "profile.greeting": "Olá, {name}",
    "profile.helpCenter": "Central de ajuda",
    "profile.helpSubtitle": "Suporte e perguntas frequentes",
    "profile.language": "Idioma",
    "profile.languageDescription": "Selecione o idioma principal do app.",
    "profile.logoutPrompt": "Sua sessão local será encerrada e voltará ao início.",
    "profile.manageHomes": "Gerenciar lares",
    "profile.messageCenter": "Central de mensagens",
    "profile.offline": "Modo offline",
    "profile.offlineDescription": "Mantém dados recentes e pausa sincronizações externas.",
    "profile.offlineOffText": "O app sincronizará quando houver conexão.",
    "profile.offlineOnText": "O app usará dados salvos.",
    "profile.preferences": "Preferências",
    "profile.preferencesSubtitle": "Idioma e comportamento de sincronização.",
    "profile.restoreData": "Restauração de dados",
    "profile.restoreDataAction": "Restaurar dados",
    "profile.restoreDescription": "Redefine preferências locais e dados de teste.",
    "profile.restorePrompt": "Preferências locais e dados de teste serão restaurados sem excluir a conta.",
    "profile.securityData": "Segurança e dados",
    "profile.securityDataSubtitle": "Auditoria, restauração e controle da conta.",
    "profile.session": "Sessão",
    "settings.account": "Conta",
    "settings.appearance": "Aparência",
    "settings.appearanceDescription": "Selecione o modo visual do aplicativo.",
    "settings.dark": "Escuro",
    "settings.deactivateDescription": "Pause o acesso e a sincronização da conta.",
    "settings.light": "Claro",
    "settings.pendingBody": "Seção pronta para conectar com o backend quando disponível.",
    "settings.subtitle": "Conta, tema e integrações.",
    "settings.title": "Configurações",
    "settings.voiceDescription": "Controle lares e dispositivos com assistentes compatíveis.",
    "settings.voiceIntegrations": "Integrações de voz",
    "settings.voiceAssistant": "Assistente de voz",
    "settings.voiceAssistantDescription": "Controle lares e dispositivos por comandos de voz.",
    "settings.voiceAlexaDescription": "Pronto para vincular Alexa quando existir backend OAuth.",
    "tab.dashboard": "Dashboard",
    "tab.homes": "Lares",
    "tab.profile": "Perfil",
    "tab.reports": "Relatórios",
  },
} as const;

// Las claves validas salen del diccionario base en espanol.
export type TranslationKey = keyof typeof dictionaries.es;

// Parametros usados para reemplazar placeholders como {name} o {count}.
type Params = Record<string, string | number>;

/**
 * Traduce una clave al idioma indicado.
 *
 * Si falta la clave en el idioma seleccionado, usa espanol como fallback.
 * Tambien reemplaza parametros dinamicos dentro del texto.
 */
export function translate(language: AppLanguage, key: TranslationKey, params?: Params): string {
  const dictionary = dictionaries[language] ?? dictionaries.es;
  const template = String(dictionary[key] ?? dictionaries.es[key] ?? key);

  if (!params) return template;

  return Object.entries(params).reduce<string>(
    (text, [param, value]) => text.replaceAll(`{${param}}`, String(value)),
    template,
  );
}

/**
 * Hook usado por componentes y pantallas.
 *
 * Lee el idioma actual del contexto global y entrega una funcion `t` estable
 * para traducir textos.
 */
export function useTranslation() {
  const { language } = useSmartHome();

  const t = useCallback(
    (key: TranslationKey, params?: Params) => translate(language, key, params),
    [language],
  );

  return { language, t };
}
