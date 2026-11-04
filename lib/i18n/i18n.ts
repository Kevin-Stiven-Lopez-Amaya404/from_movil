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
    "profile.personalInfo": "Información personal",
    "profile.registeredName": "Nombre registrado",
    "profile.registeredEmail": "Correo electrónico",
    "profile.securityTitle": "Seguridad de mi cuenta",
    "profile.securityDescription": "Actualiza tu contraseña y administra tus sesiones.",
    "profile.manageSessions": "Sesiones de la cuenta",
    "profile.manageSessionsDescription": "Revisa las opciones para cerrar las sesiones activas.",
    "profile.settingsDescription": "Apariencia, idioma y preferencias",
    "profile.dataUnavailable": "No disponible",
    "profile.openPersonalInfoHint": "Abre la información de tu cuenta.",
    "profile.accountRole": "Rol de la cuenta",
    "profile.roleAdmin": "Administrador",
    "profile.roleMember": "Miembro",
    "profile.roleGuest": "Invitado",

    "profile.helpCenter": "Centro de ayuda",
    "profile.helpSubtitle": "Soporte y preguntas frecuentes",

    "profile.language": "Idioma",
    "profile.languageDescription": "Selecciona el idioma principal de la app.",

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
    "settings.accountSecurity": "Seguridad de la cuenta",
    "settings.accountSecurityDescription":
      "Revisa alertas, sesiones y el estado de los dispositivos.",
    "settings.backToProfileHint": "Regresa a tu perfil.",
    "settings.changePassword": "Cambiar contraseña",
    "settings.changePasswordDescription":
      "Actualiza la contraseña de tu cuenta.",
    "settings.passwordChangeError":
      "No se pudo cambiar la contraseña. Revisa la contraseña actual e inténtalo de nuevo.",
    "settings.dangerZone": "Zona de peligro",
    "settings.deactivateHint":
      "Solicita desactivar tu cuenta después de confirmar.",
    "settings.deactivationError":
      "No se pudo desactivar la cuenta. Inténtalo de nuevo más tarde.",

    "settings.about": "Información",
    "settings.aboutDescription":
      "Información sobre Smart Home y la aplicación.",

    "settings.appearance": "Apariencia",
    "settings.appearanceDescription":
      "Selecciona el modo visual de la aplicación.",
    "settings.colorPalette": "Paleta de colores",
    "settings.paletteClassic": "Azul Clásico",
    "settings.paletteEmerald": "Esmeralda Tecnológico",

    "settings.dark": "Oscuro",

    "settings.deactivateDescription":
      "Pausa el acceso y la sincronización de la cuenta.",

    "settings.helpSupport": "Ayuda y soporte",
    "settings.resources": "Ayuda e información",

    "settings.light": "Claro",

    "settings.messageDescription": "Avisos y comunicaciones de Smart Home.",

    "settings.pendingBody":
      "Apartado preparado para conectar con el backend cuando esté disponible.",

    "profile.reportProblem": "Reportar un problema",
    "settings.reportProblemDescription":
      "Informa errores o problemas de la aplicación.",

    "settings.subtitle": "Preferencias, ayuda y opciones de cuenta.",
    "settings.openLanguageHint": "Abre la selección de idioma.",
    "settings.openPasswordHint": "Abre el formulario para cambiar la contraseña.",
    "settings.sync": "Sincronización automática",
    "settings.syncDescription":
      "La app recibe cambios en tiempo real cuando el servicio está disponible.",
    "settings.system": "Sistema",

    "settings.title": "Configuración",

    "settings.voiceDescription":
      "Controla hogares y dispositivos con asistentes compatibles.",
    "settings.voiceIntegrations": "Integraciones de voz",
    "settings.voiceAssistant": "Asistente de voz",
    "settings.voiceAssistantDescription":
      "Control de hogares y dispositivos por comandos de voz.",
    "settings.voiceAlexaDescription":
      "Preparado para vincular Alexa cuando exista backend OAuth.",

    "action.accept": "Aceptar",
    "action.close": "Cerrar",
    "action.confirm": "Confirmar",
    "action.reject": "Rechazar",
    "common.retry": "Reintentar",

    "about.android": "Android",
    "about.description":
      "Smart Home reúne la administración de hogares, dispositivos y consumo energético en una sola aplicación.",
    "about.ios": "iOS",
    "about.otherPlatform": "No disponible",
    "about.platform": "Plataforma",
    "about.sectionTitle": "Información de la aplicación",
    "about.subtitle": "Información técnica de Smart Home.",
    "about.title": "Smart Home",
    "about.version": "Versión",

    "favorites.emptyDescription":
      "Marca un hogar con la estrella para tenerlo disponible aquí.",
    "favorites.emptyTitle": "Aún no tienes favoritos",
    "favorites.openHome": "Abrir {name}",
    "favorites.removeError": "No se pudo quitar el favorito. Vuelve a intentarlo.",
    "favorites.removeErrorTitle": "No se pudo quitar el favorito",
    "favorites.removeFavorite": "Quitar {name} de favoritos",
    "favorites.section": "Mis hogares favoritos",
    "favorites.subtitle": "Tus hogares guardados para acceder rápidamente.",
    "favorites.title": "Favoritos",
    "favorites.viewHomes": "Ver mis hogares",

    "help.contactUnavailable":
      "Todavía no hay un canal de contacto conectado en la aplicación. Las preguntas frecuentes son la ayuda disponible.",
    "help.faqAlertsAnswer":
      "Una alerta puede indicar que un dispositivo perdió conexión. Revisa el hogar y el estado del dispositivo antes de tomar medidas.",
    "help.faqAlertsQuestion": "¿Qué significa una alerta de dispositivo?",
    "help.faqAppearanceAnswer":
      "Abre Configuración > Apariencia para elegir el modo claro, oscuro o del sistema y seleccionar una paleta.",
    "help.faqAppearanceQuestion": "¿Cómo cambio la apariencia?",
    "help.faqDevicesAnswer":
      "En Dispositivos, elige un hogar y busca en la red local los Shelly conectados a su Wi-Fi. La detección BLE es experimental, solo consulta información y no vincula equipos.",
    "help.faqDevicesQuestion": "¿Cómo busco un dispositivo Shelly?",
    "help.faqHomesAnswer":
      "Abre Hogares y usa la acción para crear uno. Después selecciónalo para consultar y gestionar sus dispositivos según tu rol.",
    "help.faqHomesQuestion": "¿Cómo creo o abro un hogar?",
    "help.faqTitle": "Preguntas frecuentes",
    "help.faqToggleHint": "Muestra u oculta la respuesta.",
    "help.subtitle": "Resuelve dudas sobre el uso de la aplicación.",
    "help.title": "Centro de ayuda",

    "home.roleOwner": "Propietario",

    "invitations.acceptedBody":
      "Aceptaste la invitación. Actualizaremos tus hogares para mostrar el nuevo acceso.",
    "invitations.acceptedTitle": "Invitación aceptada",
    "invitations.emptyBody": "Cuando alguien te invite a un hogar, aparecerá aquí.",
    "invitations.emptyTitle": "No tienes invitaciones pendientes",
    "invitations.errorTitle": "No se pudo procesar la invitación",
    "invitations.homeLabel": "Hogar",
    "invitations.homeUnavailable": "Nombre no disponible",
    "invitations.loading": "Cargando invitaciones...",
    "invitations.cardTitle": "Invitación recibida",
    "invitations.rejectedBody": "La invitación fue rechazada.",
    "invitations.rejectedTitle": "Invitación rechazada",
    "invitations.subtitle": "Consulta las invitaciones que recibiste para unirte a otros hogares.",
    "invitations.title": "Mis invitaciones",

    "personal.name": "Nombre",
    "personal.email": "Correo electrónico",
    "personal.role": "Rol",
    "personal.subtitle": "Datos asociados a tu cuenta.",

    "route.home": "Ir al inicio",
    "route.notFoundBody": "No pudimos encontrar la ruta solicitada.",
    "route.notFoundTitle": "Pantalla no encontrada",

    "security.deviceStatus": "Estado de dispositivos",
    "security.disconnectedDevices": "{count} dispositivos desconectados",
    "security.disconnectedDevice": "1 dispositivo desconectado",
    "security.noDisconnections": "Sin desconexiones confirmadas",
    "security.partial": "Información parcialmente disponible",
    "security.sessions": "Sesiones de la cuenta",
    "security.sessionsDescription": "Solicitar el cierre de todas las sesiones de la cuenta.",
    "security.subtitle": "Revisa el estado de los dispositivos y las sesiones de la cuenta.",
    "security.title": "Controles de seguridad",
    "security.verifying": "Verificando dispositivos...",

    "closeSessions.confirmPrompt":
      "Se solicitará al servidor cerrar todas las sesiones de tu cuenta. ¿Deseas continuar?",
    "closeSessions.description":
      "Esta acción enviará al servidor una solicitud para cerrar todas las sesiones activas de tu cuenta. No se seleccionan dispositivos ni se verifica una contraseña localmente.",
    "closeSessions.failureBody":
      "No se pudo confirmar el cierre global de sesiones. Intenta nuevamente.",
    "closeSessions.failureTitle": "Cierre no confirmado",
    "closeSessions.info": "El resultado depende de la confirmación del servicio de autenticación.",
    "closeSessions.successBody": "La solicitud de cierre global de sesiones fue procesada.",
    "closeSessions.successTitle": "Solicitud confirmada",
    "closeSessions.title": "Cerrar todas las sesiones",

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
    "profile.personalInfo": "Personal information",
    "profile.registeredName": "Registered name",
    "profile.registeredEmail": "Email address",
    "profile.securityTitle": "Account security",
    "profile.securityDescription": "Update your password and manage your sessions.",
    "profile.manageSessions": "Account sessions",
    "profile.manageSessionsDescription": "Review options for closing active sessions.",
    "profile.settingsDescription": "Appearance, language and preferences",
    "profile.dataUnavailable": "Not available",
    "profile.openPersonalInfoHint": "Opens your account information.",
    "profile.accountRole": "Account role",
    "profile.roleAdmin": "Administrator",
    "profile.roleMember": "Member",
    "profile.roleGuest": "Guest",

    "profile.helpCenter": "Help center",
    "profile.helpSubtitle": "Support and frequently asked questions",

    "profile.language": "Language",
    "profile.languageDescription": "Select the app primary language.",

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
    "settings.accountSecurity": "Account security",
    "settings.accountSecurityDescription":
      "Review alerts, sessions, and device status.",
    "settings.backToProfileHint": "Returns to your profile.",
    "settings.changePassword": "Change password",
    "settings.changePasswordDescription":
      "Update your account password.",
    "settings.passwordChangeError":
      "The password could not be changed. Check your current password and try again.",
    "settings.dangerZone": "Danger zone",
    "settings.deactivateHint":
      "Requests account deactivation after confirmation.",
    "settings.deactivationError":
      "The account could not be deactivated. Try again later.",

    "settings.about": "About",
    "settings.aboutDescription":
      "Information about Smart Home and the application.",

    "settings.appearance": "Appearance",
    "settings.appearanceDescription": "Select the visual mode of the app.",
    "settings.colorPalette": "Color palette",
    "settings.paletteClassic": "Classic Blue",
    "settings.paletteEmerald": "Technological Emerald",

    "settings.dark": "Dark",

    "settings.deactivateDescription":
      "Pause account access and synchronization.",

    "settings.helpSupport": "Help and support",
    "settings.resources": "Help and information",

    "settings.light": "Light",

    "settings.messageDescription": "Smart Home notices and communications.",

    "settings.pendingBody":
      "Section ready to connect with the backend when available.",

    "profile.reportProblem": "Report a problem",
    "settings.reportProblemDescription":
      "Report errors or application problems.",

    "settings.subtitle": "Preferences, help and account options.",
    "settings.openLanguageHint": "Opens language selection.",
    "settings.openPasswordHint": "Opens the password change form.",
    "settings.sync": "Automatic synchronization",
    "settings.syncDescription":
      "The app receives real-time updates when the service is available.",
    "settings.system": "System",

    "settings.title": "Settings",

    "settings.voiceDescription":
      "Control homes and devices with compatible assistants.",
    "settings.voiceIntegrations": "Voice integrations",
    "settings.voiceAssistant": "Voice assistant",
    "settings.voiceAssistantDescription":
      "Control homes and devices with voice commands.",
    "settings.voiceAlexaDescription":
      "Ready to link Alexa when OAuth backend exists.",

    "action.accept": "Accept",
    "action.close": "Close",
    "action.confirm": "Confirm",
    "action.reject": "Decline",
    "common.retry": "Try again",

    "about.android": "Android",
    "about.description":
      "Smart Home brings together home, device, and energy consumption management in one app.",
    "about.ios": "iOS",
    "about.otherPlatform": "Unavailable",
    "about.platform": "Platform",
    "about.sectionTitle": "Application information",
    "about.subtitle": "Technical information about Smart Home.",
    "about.title": "Smart Home",
    "about.version": "Version",

    "favorites.emptyDescription":
      "Tap the star on a home to make it available here.",
    "favorites.emptyTitle": "No favorites yet",
    "favorites.openHome": "Open {name}",
    "favorites.removeError": "Could not remove the favorite. Try again.",
    "favorites.removeErrorTitle": "Could not remove favorite",
    "favorites.removeFavorite": "Remove {name} from favorites",
    "favorites.section": "Favorite homes",
    "favorites.subtitle": "Saved homes for quick access.",
    "favorites.title": "Favorites",
    "favorites.viewHomes": "View my homes",

    "help.contactUnavailable":
      "There is no support contact channel connected to the app yet. The FAQs are the available help.",
    "help.faqAlertsAnswer":
      "An alert can mean that a device lost connectivity. Check the home and device status before taking action.",
    "help.faqAlertsQuestion": "What does a device alert mean?",
    "help.faqAppearanceAnswer":
      "Open Settings > Appearance to choose light, dark, or system mode and select a palette.",
    "help.faqAppearanceQuestion": "How do I change the appearance?",
    "help.faqDevicesAnswer":
      "In Devices, select a home and search the local network for Shelly devices connected to its Wi-Fi. BLE discovery is experimental, read-only, and does not pair devices.",
    "help.faqDevicesQuestion": "How do I find a Shelly device?",
    "help.faqHomesAnswer":
      "Open Homes and use the create action. Then select a home to view and manage its devices according to your role.",
    "help.faqHomesQuestion": "How do I create or open a home?",
    "help.faqTitle": "Frequently asked questions",
    "help.faqToggleHint": "Shows or hides the answer.",
    "help.subtitle": "Answers to common questions about the app.",
    "help.title": "Help center",

    "home.roleOwner": "Owner",

    "invitations.acceptedBody":
      "You accepted the invitation. Your homes will refresh to show the new access.",
    "invitations.acceptedTitle": "Invitation accepted",
    "invitations.emptyBody": "Invitations to join homes will appear here.",
    "invitations.emptyTitle": "No pending invitations",
    "invitations.errorTitle": "Could not process the invitation",
    "invitations.homeLabel": "Home",
    "invitations.homeUnavailable": "Name unavailable",
    "invitations.loading": "Loading invitations...",
    "invitations.cardTitle": "Home invitation",
    "invitations.rejectedBody": "The invitation was declined.",
    "invitations.rejectedTitle": "Invitation declined",
    "invitations.subtitle": "Review invitations to join other homes.",
    "invitations.title": "My invitations",

    "personal.name": "Name",
    "personal.email": "Email address",
    "personal.role": "Role",
    "personal.subtitle": "Details associated with your account.",

    "route.home": "Go to home",
    "route.notFoundBody": "We could not find the requested route.",
    "route.notFoundTitle": "Screen not found",

    "security.deviceStatus": "Device status",
    "security.disconnectedDevices": "{count} disconnected devices",
    "security.disconnectedDevice": "1 disconnected device",
    "security.noDisconnections": "No confirmed disconnections",
    "security.partial": "Some information is unavailable",
    "security.sessions": "Account sessions",
    "security.sessionsDescription": "Request that all account sessions be closed.",
    "security.subtitle": "Review device status and account sessions.",
    "security.title": "Security controls",
    "security.verifying": "Checking devices...",

    "closeSessions.confirmPrompt":
      "The server will be asked to close every session on your account. Do you want to continue?",
    "closeSessions.description":
      "This sends the server a request to close all active sessions on your account. It does not select individual devices or verify a password locally.",
    "closeSessions.failureBody":
      "The global session closure could not be confirmed. Try again.",
    "closeSessions.failureTitle": "Closure not confirmed",
    "closeSessions.info": "The result depends on confirmation from the authentication service.",
    "closeSessions.successBody": "The request to close all sessions was processed.",
    "closeSessions.successTitle": "Request confirmed",
    "closeSessions.title": "Close all sessions",

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
    "profile.personalInfo": "Informações pessoais",
    "profile.registeredName": "Nome registrado",
    "profile.registeredEmail": "E-mail",
    "profile.securityTitle": "Segurança da minha conta",
    "profile.securityDescription": "Atualize sua senha e gerencie suas sessões.",
    "profile.manageSessions": "Sessões da conta",
    "profile.manageSessionsDescription": "Veja as opções para encerrar as sessões ativas.",
    "profile.settingsDescription": "Aparência, idioma e preferências",
    "profile.dataUnavailable": "Não disponível",
    "profile.openPersonalInfoHint": "Abre as informações da sua conta.",
    "profile.accountRole": "Papel da conta",
    "profile.roleAdmin": "Administrador",
    "profile.roleMember": "Membro",
    "profile.roleGuest": "Convidado",

    "profile.helpCenter": "Central de ajuda",
    "profile.helpSubtitle": "Suporte e perguntas frequentes",

    "profile.language": "Idioma",
    "profile.languageDescription": "Selecione o idioma principal do app.",

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
    "settings.accountSecurity": "Segurança da conta",
    "settings.accountSecurityDescription":
      "Revise alertas, sessões e o estado dos dispositivos.",
    "settings.backToProfileHint": "Volta ao seu perfil.",
    "settings.changePassword": "Alterar senha",
    "settings.changePasswordDescription":
      "Atualize a senha da sua conta.",
    "settings.passwordChangeError":
      "Não foi possível alterar a senha. Verifique a senha atual e tente novamente.",
    "settings.dangerZone": "Zona de perigo",
    "settings.deactivateHint":
      "Solicita a desativação da conta após a confirmação.",
    "settings.deactivationError":
      "Não foi possível desativar a conta. Tente novamente mais tarde.",

    "settings.about": "Informações",
    "settings.aboutDescription":
      "Informações sobre o Smart Home e o aplicativo.",

    "settings.appearance": "Aparência",
    "settings.appearanceDescription": "Selecione o modo visual do aplicativo.",
    "settings.colorPalette": "Paleta de cores",
    "settings.paletteClassic": "Azul clássico",
    "settings.paletteEmerald": "Esmeralda tecnológico",

    "settings.dark": "Escuro",

    "settings.deactivateDescription":
      "Pause o acesso e a sincronização da conta.",

    "settings.helpSupport": "Ajuda e suporte",
    "settings.resources": "Ajuda e informações",

    "settings.light": "Claro",

    "settings.messageDescription": "Avisos e comunicações do Smart Home.",

    "settings.pendingBody":
      "Seção pronta para conectar com o backend quando disponível.",

    "profile.reportProblem": "Relatar um problema",
    "settings.reportProblemDescription":
      "Informe erros ou problemas do aplicativo.",

    "settings.subtitle": "Preferências, ajuda e opções da conta.",
    "settings.openLanguageHint": "Abre a seleção de idioma.",
    "settings.openPasswordHint": "Abre o formulário para alterar a senha.",
    "settings.sync": "Sincronização automática",
    "settings.syncDescription":
      "O app recebe atualizações em tempo real quando o serviço está disponível.",
    "settings.system": "Sistema",

    "settings.title": "Configurações",

    "settings.voiceDescription":
      "Controle lares e dispositivos com assistentes compatíveis.",
    "settings.voiceIntegrations": "Integrações de voz",
    "settings.voiceAssistant": "Assistente de voz",
    "settings.voiceAssistantDescription":
      "Controle lares e dispositivos por comandos de voz.",
    "settings.voiceAlexaDescription":
      "Pronto para vincular Alexa quando existir backend OAuth.",

    "action.accept": "Aceitar",
    "action.close": "Fechar",
    "action.confirm": "Confirmar",
    "action.reject": "Recusar",
    "common.retry": "Tentar novamente",

    "about.android": "Android",
    "about.description":
      "O Smart Home reúne o gerenciamento de lares, dispositivos e consumo de energia em um só aplicativo.",
    "about.ios": "iOS",
    "about.otherPlatform": "Indisponível",
    "about.platform": "Plataforma",
    "about.sectionTitle": "Informações do aplicativo",
    "about.subtitle": "Informações técnicas do Smart Home.",
    "about.title": "Smart Home",
    "about.version": "Versão",

    "favorites.emptyDescription":
      "Marque um lar com a estrela para deixá-lo disponível aqui.",
    "favorites.emptyTitle": "Você ainda não tem favoritos",
    "favorites.openHome": "Abrir {name}",
    "favorites.removeError": "Não foi possível remover o favorito. Tente novamente.",
    "favorites.removeErrorTitle": "Não foi possível remover favorito",
    "favorites.removeFavorite": "Remover {name} dos favoritos",
    "favorites.section": "Lares favoritos",
    "favorites.subtitle": "Seus lares salvos para acesso rápido.",
    "favorites.title": "Favoritos",
    "favorites.viewHomes": "Ver meus lares",

    "help.contactUnavailable":
      "Ainda não há um canal de contato conectado ao aplicativo. As perguntas frequentes são a ajuda disponível.",
    "help.faqAlertsAnswer":
      "Um alerta pode indicar que um dispositivo perdeu a conexão. Confira o lar e o estado do dispositivo antes de agir.",
    "help.faqAlertsQuestion": "O que significa um alerta do dispositivo?",
    "help.faqAppearanceAnswer":
      "Abra Configurações > Aparência para escolher o modo claro, escuro ou do sistema e selecionar uma paleta.",
    "help.faqAppearanceQuestion": "Como altero a aparência?",
    "help.faqDevicesAnswer":
      "Em Dispositivos, escolha um lar e busque na rede local Shelly conectados ao Wi-Fi dele. A detecção BLE é experimental, apenas consulta informações e não vincula dispositivos.",
    "help.faqDevicesQuestion": "Como encontro um dispositivo Shelly?",
    "help.faqHomesAnswer":
      "Abra Lares e use a ação para criar um. Depois selecione-o para consultar e gerenciar os dispositivos de acordo com seu papel.",
    "help.faqHomesQuestion": "Como crio ou abro um lar?",
    "help.faqTitle": "Perguntas frequentes",
    "help.faqToggleHint": "Mostra ou oculta a resposta.",
    "help.subtitle": "Respostas para dúvidas comuns sobre o aplicativo.",
    "help.title": "Central de ajuda",

    "home.roleOwner": "Proprietário",

    "invitations.acceptedBody":
      "Você aceitou o convite. Seus lares serão atualizados para mostrar o novo acesso.",
    "invitations.acceptedTitle": "Convite aceito",
    "invitations.emptyBody": "Convites para participar de lares aparecerão aqui.",
    "invitations.emptyTitle": "Nenhum convite pendente",
    "invitations.errorTitle": "Não foi possível processar o convite",
    "invitations.homeLabel": "Lar",
    "invitations.homeUnavailable": "Nome indisponível",
    "invitations.loading": "Carregando convites...",
    "invitations.cardTitle": "Convite para um lar",
    "invitations.rejectedBody": "O convite foi recusado.",
    "invitations.rejectedTitle": "Convite recusado",
    "invitations.subtitle": "Consulte os convites recebidos para participar de outros lares.",
    "invitations.title": "Meus convites",

    "personal.name": "Nome",
    "personal.email": "E-mail",
    "personal.role": "Papel",
    "personal.subtitle": "Dados associados à sua conta.",

    "route.home": "Ir para o início",
    "route.notFoundBody": "Não foi possível encontrar a rota solicitada.",
    "route.notFoundTitle": "Tela não encontrada",

    "security.deviceStatus": "Estado dos dispositivos",
    "security.disconnectedDevices": "{count} dispositivos desconectados",
    "security.disconnectedDevice": "1 dispositivo desconectado",
    "security.noDisconnections": "Sem desconexões confirmadas",
    "security.partial": "Algumas informações estão indisponíveis",
    "security.sessions": "Sessões da conta",
    "security.sessionsDescription": "Solicite o encerramento de todas as sessões da conta.",
    "security.subtitle": "Confira o estado dos dispositivos e as sessões da conta.",
    "security.title": "Controles de segurança",
    "security.verifying": "Verificando dispositivos...",

    "closeSessions.confirmPrompt":
      "O servidor receberá uma solicitação para encerrar todas as sessões da sua conta. Deseja continuar?",
    "closeSessions.description":
      "Esta ação solicitará ao servidor o encerramento de todas as sessões ativas da conta. Não seleciona dispositivos nem verifica uma senha localmente.",
    "closeSessions.failureBody":
      "Não foi possível confirmar o encerramento global das sessões. Tente novamente.",
    "closeSessions.failureTitle": "Encerramento não confirmado",
    "closeSessions.info": "O resultado depende da confirmação do serviço de autenticação.",
    "closeSessions.successBody": "A solicitação para encerrar todas as sessões foi processada.",
    "closeSessions.successTitle": "Solicitação confirmada",
    "closeSessions.title": "Encerrar todas as sessões",

    "tab.dashboard": "Dashboard",
    "tab.homes": "Lares",
    "tab.profile": "Perfil",
    "tab.reports": "Relatórios",
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
