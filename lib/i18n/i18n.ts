import { useCallback } from "react";

import { useSmartHome } from "@/lib/context/smart-home-context";
import type { AppLanguage } from "@/lib/domain/preferences";

/**
 * Diccionarios de traducción de la aplicación.
 *
 * Cada clave representa un texto reutilizable. Las pantallas llaman `t("clave")`
 * en vez de escribir el texto fijo directamente.
 *
 * Nota técnica:
 * algunos textos muestran caracteres dañados por codificación previa. La mejora
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
    "profile.noHomeConfigured": "Sin hogar configurado",
    "profile.homeAvailable": "hogar disponible",
    "profile.homesAvailable": "hogares disponibles",
    "profile.quickAccess": "Tus accesos rápidos",
    "profile.quickAccessSubtitle": "Funciones principales de Smart Home",
    "profile.myHomes": "Mis hogares",
    "profile.availableCount": "{count} disponibles",
    "profile.devices": "Dispositivos",
    "profile.connectedCount": "{count} conectados",
    "profile.consumption": "Consumo",
    "profile.consumptionDescription": "Consulta tus reportes",
    "profile.alerts": "Alertas",
    "profile.noAlerts": "Sin alertas",
    "profile.favorites": "Favoritos",
    "profile.savedCount": "{count} guardados",
    "profile.sync": "Sincronizar",
    "profile.lastSync": "Última: {value}",

    "profile.audit": "Auditoría",
    "profile.auditBody":
      "Alertas pendientes: {alerts}\nDispositivos activos: {devices}",
    "profile.auditDescription":
      "Consulta actividad reciente y eventos de seguridad.",

    "profile.dataRestored": "Datos restaurados",
    "profile.dataRestoredBody":
      "Las preferencias locales volvieron a su estado inicial.",

    "profile.deactivateAccount": "Desactivar cuenta",
    "profile.deactivateDescription":
      "Pausa el acceso y la sincronización de tu cuenta.",
    "profile.deactivatePrompt":
      "Tu cuenta dejará de iniciar sesión y se pausará la sincronización.",

    "profile.editInfo": "Editar información de perfil",
    "profile.greeting": "Hola, {name}",

    "profile.helpCenter": "Centro de ayuda",
    "profile.helpSubtitle": "Soporte y preguntas frecuentes",

    "profile.language": "Idioma",
    "profile.languageDescription": "Selecciona el idioma principal de la app.",
    "language.switchToFrench": "Cambiar toda la aplicación a francés",
    "language.switchToFrenchDescription": "La interfaz se mostrará en francés.",

    "profile.logoutPrompt": "Tu sesión local se cerrará y volverás al inicio.",

    "profile.manageHomes": "Administrar hogares",
    "profile.messageCenter": "Centro de mensajes",

    "profile.preferences": "Preferencias",
    "profile.preferencesSubtitle": "Idioma y preferencias de la aplicación.",

    "profile.restoreData": "Restauración de datos",
    "profile.restoreDataAction": "Restaurar datos",
    "profile.restoreDescription":
      "Restablece preferencias locales y datos de prueba.",
    "profile.restorePrompt":
      "Se restaurarán preferencias locales y datos de prueba sin eliminar la cuenta.",

    "profile.securityData": "Seguridad y datos",
    "profile.securityDataSubtitle":
      "Auditoría, restauración y control de cuenta.",

    "profile.session": "Sesión",

    "settings.account": "Cuenta",

    "settings.about": "Información",
    "settings.aboutDescription":
      "Información sobre Smart Home y la aplicación.",

    "settings.appearance": "Apariencia",
    "settings.appearanceDescription":
      "Selecciona el modo visual de la aplicación.",

    "settings.dark": "Oscuro",

    "settings.deactivateDescription":
      "Pausa el acceso y la sincronización de la cuenta.",

    "settings.helpSupport": "Ayuda y soporte",

    "settings.light": "Claro",

    "settings.messageDescription": "Avisos y comunicaciones de Smart Home.",

    "settings.pendingBody":
      "Apartado preparado para conectar con el backend cuando esté disponible.",

    "profile.reportProblem": "Reportar un problema",
    "settings.reportProblemDescription":
      "Informa errores o problemas de la aplicación.",

    "settings.subtitle": "Cuenta, preferencias y seguridad.",

    "settings.title": "Configuración",

    "settings.voiceDescription":
      "Controla hogares y dispositivos con asistentes compatibles.",
    "settings.voiceIntegrations": "Integraciones de voz",
    "settings.voiceAssistant": "Asistente de voz",
    "settings.voiceAssistantDescription":
      "Control de hogares y dispositivos por comandos de voz.",
    "settings.voiceAlexaDescription":
      "Preparado para vincular Alexa cuando exista backend OAuth.",

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
    "profile.noHomeConfigured": "No home configured",
    "profile.homeAvailable": "home available",
    "profile.homesAvailable": "homes available",
    "profile.quickAccess": "Quick access",
    "profile.quickAccessSubtitle": "Main Smart Home functions",
    "profile.myHomes": "My homes",
    "profile.availableCount": "{count} available",
    "profile.devices": "Devices",
    "profile.connectedCount": "{count} connected",
    "profile.consumption": "Consumption",
    "profile.consumptionDescription": "View your reports",
    "profile.alerts": "Alerts",
    "profile.noAlerts": "No alerts",
    "profile.favorites": "Favorites",
    "profile.savedCount": "{count} saved",
    "profile.sync": "Sync",
    "profile.lastSync": "Last: {value}",

    "profile.audit": "Audit",
    "profile.auditBody":
      "Pending alerts: {alerts}\nActive devices: {devices}",
    "profile.auditDescription": "Review recent activity and security events.",

    "profile.dataRestored": "Data restored",
    "profile.dataRestoredBody":
      "Local preferences returned to their initial state.",

    "profile.deactivateAccount": "Deactivate account",
    "profile.deactivateDescription":
      "Pause account access and synchronization.",
    "profile.deactivatePrompt":
      "Your account will stop signing in and synchronization will pause.",

    "profile.editInfo": "Edit profile information",
    "profile.greeting": "Hello, {name}",

    "profile.helpCenter": "Help center",
    "profile.helpSubtitle": "Support and frequently asked questions",

    "profile.language": "Language",
    "profile.languageDescription": "Select the app primary language.",
    "language.switchToFrench": "Switch the whole app to French",
    "language.switchToFrenchDescription": "The interface will be displayed in French.",

    "profile.logoutPrompt":
      "Your local session will close and return to start.",

    "profile.manageHomes": "Manage homes",
    "profile.messageCenter": "Message center",

    "profile.preferences": "Preferences",
    "profile.preferencesSubtitle": "Language and app preferences.",

    "profile.restoreData": "Data restoration",
    "profile.restoreDataAction": "Restore data",
    "profile.restoreDescription": "Reset local preferences and test data.",
    "profile.restorePrompt":
      "Local preferences and test data will be restored without deleting the account.",

    "profile.securityData": "Security and data",
    "profile.securityDataSubtitle": "Audit, restoration and account control.",

    "profile.session": "Session",

    "settings.account": "Account",

    "settings.about": "About",
    "settings.aboutDescription":
      "Information about Smart Home and the application.",

    "settings.appearance": "Appearance",
    "settings.appearanceDescription": "Select the visual mode of the app.",

    "settings.dark": "Dark",

    "settings.deactivateDescription":
      "Pause account access and synchronization.",

    "settings.helpSupport": "Help and support",

    "settings.light": "Light",

    "settings.messageDescription": "Smart Home notices and communications.",

    "settings.pendingBody":
      "Section ready to connect with the backend when available.",

    "profile.reportProblem": "Report a problem",
    "settings.reportProblemDescription":
      "Report errors or application problems.",

    "settings.subtitle": "Account, preferences and security.",

    "settings.title": "Settings",

    "settings.voiceDescription":
      "Control homes and devices with compatible assistants.",
    "settings.voiceIntegrations": "Voice integrations",
    "settings.voiceAssistant": "Voice assistant",
    "settings.voiceAssistantDescription":
      "Control homes and devices with voice commands.",
    "settings.voiceAlexaDescription":
      "Ready to link Alexa when OAuth backend exists.",

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
    "profile.noHomeConfigured": "Nenhum lar configurado",
    "profile.homeAvailable": "lar disponível",
    "profile.homesAvailable": "lares disponíveis",
    "profile.quickAccess": "Acessos rápidos",
    "profile.quickAccessSubtitle": "Funções principais do Smart Home",
    "profile.myHomes": "Meus lares",
    "profile.availableCount": "{count} disponíveis",
    "profile.devices": "Dispositivos",
    "profile.connectedCount": "{count} conectados",
    "profile.consumption": "Consumo",
    "profile.consumptionDescription": "Consulte seus relatórios",
    "profile.alerts": "Alertas",
    "profile.noAlerts": "Sem alertas",
    "profile.favorites": "Favoritos",
    "profile.savedCount": "{count} salvos",
    "profile.sync": "Sincronizar",
    "profile.lastSync": "Última: {value}",

    "profile.audit": "Auditoria",
    "profile.auditBody":
      "Alertas pendentes: {alerts}\nDispositivos ativos: {devices}",
    "profile.auditDescription":
      "Consulte atividade recente e eventos de segurança.",

    "profile.dataRestored": "Dados restaurados",
    "profile.dataRestoredBody":
      "As preferências locais voltaram ao estado inicial.",

    "profile.deactivateAccount": "Desativar conta",
    "profile.deactivateDescription":
      "Pause o acesso e a sincronização da conta.",
    "profile.deactivatePrompt":
      "Sua conta deixará de iniciar sessão e a sincronização será pausada.",

    "profile.editInfo": "Editar informações do perfil",
    "profile.greeting": "Olá, {name}",

    "profile.helpCenter": "Central de ajuda",
    "profile.helpSubtitle": "Suporte e perguntas frequentes",

    "profile.language": "Idioma",
    "profile.languageDescription": "Selecione o idioma principal do app.",
    "language.switchToFrench": "Mudar todo o aplicativo para francês",
    "language.switchToFrenchDescription": "A interface será exibida em francês.",

    "profile.logoutPrompt":
      "Sua sessão local será encerrada e voltará ao início.",

    "profile.manageHomes": "Gerenciar lares",
    "profile.messageCenter": "Central de mensagens",

    "profile.preferences": "Preferências",
    "profile.preferencesSubtitle": "Idioma e preferências do aplicativo.",

    "profile.restoreData": "Restauração de dados",
    "profile.restoreDataAction": "Restaurar dados",
    "profile.restoreDescription":
      "Redefine preferências locais e dados de teste.",
    "profile.restorePrompt":
      "Preferências locais e dados de teste serão restaurados sem excluir a conta.",

    "profile.securityData": "Segurança e dados",
    "profile.securityDataSubtitle":
      "Auditoria, restauração e controle da conta.",

    "profile.session": "Sessão",

    "settings.account": "Conta",

    "settings.about": "Informações",
    "settings.aboutDescription":
      "Informações sobre o Smart Home e o aplicativo.",

    "settings.appearance": "Aparência",
    "settings.appearanceDescription": "Selecione o modo visual do aplicativo.",

    "settings.dark": "Escuro",

    "settings.deactivateDescription":
      "Pause o acesso e a sincronização da conta.",

    "settings.helpSupport": "Ajuda e suporte",

    "settings.light": "Claro",

    "settings.messageDescription": "Avisos e comunicações do Smart Home.",

    "settings.pendingBody":
      "Seção pronta para conectar com o backend quando disponível.",

    "profile.reportProblem": "Relatar um problema",
    "settings.reportProblemDescription":
      "Informe erros ou problemas do aplicativo.",

    "settings.subtitle": "Conta, preferências e segurança.",

    "settings.title": "Configurações",

    "settings.voiceDescription":
      "Controle lares e dispositivos com assistentes compatíveis.",
    "settings.voiceIntegrations": "Integrações de voz",
    "settings.voiceAssistant": "Assistente de voz",
    "settings.voiceAssistantDescription":
      "Controle lares e dispositivos por comandos de voz.",
    "settings.voiceAlexaDescription":
      "Pronto para vincular Alexa quando existir backend OAuth.",

    "tab.dashboard": "Dashboard",
    "tab.homes": "Lares",
    "tab.profile": "Perfil",
    "tab.reports": "Relatórios",
  },
  fr: {
    "action.back": "Retour",
    "action.cancel": "Annuler",
    "action.configure": "Configurer",
    "action.deactivate": "Désactiver",
    "action.logout": "Se déconnecter",
    "action.restore": "Restaurer",
    "action.save": "Enregistrer",
    "action.viewAudit": "Voir l’audit",

    "common.active": "Actif",
    "common.inactive": "Inactif",
    "common.noNews": "Aucune nouveauté",
    "common.pendingAlert": "{count} alerte en attente",
    "common.pendingAlerts": "{count} alertes en attente",
    "common.readyBackend": "Module prêt à être connecté au serveur.",

    "profile.accountHome": "Domicile de {name} · {count} logements",
    "profile.accountModule": "Compte et logements",
    "profile.accountModuleSubtitle": "Profil, logements, messages et assistance.",
    "profile.activeDevices": "{count} appareils actifs",
    "profile.noHomeConfigured": "Aucun logement configuré",
    "profile.homeAvailable": "logement disponible",
    "profile.homesAvailable": "logements disponibles",
    "profile.quickAccess": "Vos raccourcis",
    "profile.quickAccessSubtitle": "Fonctions principales de Smart Home",
    "profile.myHomes": "Mes logements",
    "profile.availableCount": "{count} disponibles",
    "profile.devices": "Appareils",
    "profile.connectedCount": "{count} connectés",
    "profile.consumption": "Consommation",
    "profile.consumptionDescription": "Consultez vos rapports",
    "profile.alerts": "Alertes",
    "profile.noAlerts": "Aucune alerte",
    "profile.favorites": "Favoris",
    "profile.savedCount": "{count} enregistrés",
    "profile.sync": "Synchroniser",
    "profile.lastSync": "Dernière synchronisation : {value}",

    "profile.audit": "Audit",
    "profile.auditBody": "Alertes en attente : {alerts}\nAppareils actifs : {devices}",
    "profile.auditDescription": "Consultez l’activité récente et les événements de sécurité.",

    "profile.dataRestored": "Données restaurées",
    "profile.dataRestoredBody": "Les préférences locales ont été réinitialisées.",

    "profile.deactivateAccount": "Désactiver le compte",
    "profile.deactivateDescription": "Suspend l’accès à votre compte et sa synchronisation.",
    "profile.deactivatePrompt": "Vous ne pourrez plus vous connecter et la synchronisation sera suspendue.",

    "profile.editInfo": "Modifier les informations du profil",
    "profile.greeting": "Bonjour, {name}",

    "profile.helpCenter": "Centre d’aide",
    "profile.helpSubtitle": "Assistance et questions fréquentes",

    "profile.language": "Langue",
    "profile.languageDescription": "Choisissez la langue principale de l’application.",

    "profile.logoutPrompt": "Votre session locale sera fermée et vous reviendrez à l’accueil.",

    "profile.manageHomes": "Gérer les logements",
    "profile.messageCenter": "Centre de messages",

    "profile.preferences": "Préférences",
    "profile.preferencesSubtitle": "Langue et préférences de l’application.",

    "profile.restoreData": "Restauration des données",
    "profile.restoreDataAction": "Restaurer les données",
    "profile.restoreDescription": "Réinitialise les préférences locales et les données de test.",
    "profile.restorePrompt": "Les préférences locales et les données de test seront restaurées sans supprimer le compte.",

    "profile.securityData": "Sécurité et données",
    "profile.securityDataSubtitle": "Audit, restauration et gestion du compte.",

    "profile.session": "Session",

    "settings.account": "Compte",

    "settings.about": "À propos",
    "settings.aboutDescription": "Informations sur Smart Home et l’application.",

    "settings.appearance": "Apparence",
    "settings.appearanceDescription": "Choisissez le thème de l’application.",

    "settings.dark": "Sombre",

    "settings.deactivateDescription": "Suspend l’accès au compte et sa synchronisation.",

    "settings.helpSupport": "Aide et assistance",

    "settings.light": "Clair",

    "settings.messageDescription": "Alertes et communications de Smart Home.",

    "settings.pendingBody": "Section prête à être connectée au serveur lorsqu’il sera disponible.",

    "profile.reportProblem": "Signaler un problème",
    "settings.reportProblemDescription": "Signalez les erreurs ou les problèmes de l’application.",

    "settings.subtitle": "Compte, préférences et sécurité.",

    "settings.title": "Paramètres",

    "settings.voiceDescription": "Contrôlez les logements et les appareils avec des assistants compatibles.",
    "settings.voiceIntegrations": "Intégrations vocales",
    "settings.voiceAssistant": "Assistant vocal",
    "settings.voiceAssistantDescription": "Contrôlez les logements et les appareils par commande vocale.",
    "settings.voiceAlexaDescription": "Prêt à connecter Alexa lorsqu’un serveur OAuth sera disponible.",

    "tab.dashboard": "Tableau de bord",
    "tab.homes": "Logements",
    "tab.profile": "Profil",
    "tab.reports": "Rapports",
    "language.switchToFrench": "Passer toute l’application en français",
    "language.switchToFrenchDescription": "L’interface sera affichée en français.",
  },
} as const;

// Las claves válidas salen del diccionario base en español.
export type TranslationKey = keyof typeof dictionaries.es;

// Parámetros usados para reemplazar placeholders como {name} o {count}.
type Params = Record<string, string | number>;

/**
 * Traduce una clave al idioma indicado.
 *
 * Si falta la clave en el idioma seleccionado, usa español como fallback.
 * También reemplaza parámetros dinámicos dentro del texto.
 */
export function translate(
  language: AppLanguage,
  key: TranslationKey,
  params?: Params,
): string {
  const dictionary = dictionaries[language] ?? dictionaries.es;
  const template = String(dictionary[key] ?? dictionaries.es[key] ?? key);

  if (!params) {
    return template;
  }

  return Object.entries(params).reduce<string>(
    (text, [param, value]) => text.replaceAll(`{${param}}`, String(value)),
    template,
  );
}

/**
 * Hook usado por componentes y pantallas.
 *
 * Lee el idioma actual del contexto global y entrega una función `t` estable
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
