import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useResponsiveLayout } from "@/lib/responsive";
import { useSmartHome } from "@/lib/smart-home-context";

const BLUE = "#0864C8";
const TEXT = "#3F3F3F";
const LILAC = "#EDEEFF";
const MUTED = "#6B7280";
const RED = "#FF3B20";

const languages = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
] as const;

function AmazonSmile() {
  return (
    <Svg width={86} height={22} viewBox="0 0 86 22">
      <Path
        d="M8 5c19 15 48 15 70 0"
        fill="none"
        stroke="#0582C9"
        strokeLinecap="round"
        strokeWidth={5}
      />
      <Path d="M73 3l8 1-5 7" fill="none" stroke="#0582C9" strokeLinecap="round" strokeWidth={4} />
    </Svg>
  );
}

type TopActionsProps = {
  onComingSoon: (title: string) => void;
  onOpenSettings: () => void;
};

function TopActions({ onComingSoon, onOpenSettings }: TopActionsProps) {
  return (
    <View style={styles.topActions}>
      <Pressable onPress={() => onComingSoon("Favoritos")}>
        <MaterialCommunityIcons name="star-four-points" size={35} color="#000000" />
      </Pressable>
      <Pressable onPress={() => onComingSoon("Automatizaciones")}>
        <MaterialCommunityIcons name="hexagon-slice-6" size={39} color="#000000" />
      </Pressable>
      <Pressable
        onPress={onOpenSettings}
        style={({ pressed }) => [styles.settingsButton, pressed && { opacity: 0.6 }]}
      >
        <Ionicons name="settings-outline" size={30} color={TEXT} />
      </Pressable>
    </View>
  );
}

type ProfileHeaderProps = {
  onlineDevices: number;
  sessionName: string;
};

function ProfileHeader({ onlineDevices, sessionName }: ProfileHeaderProps) {
  return (
    <View style={styles.profileRow}>
      <View style={styles.avatar}>
        <Ionicons name="person-outline" size={43} color={TEXT} />
      </View>
      <View style={styles.profileCopy}>
        <Text style={styles.greeting}>Hola, {sessionName}</Text>
        <Text style={styles.profileMeta}>{onlineDevices} dispositivos activos</Text>
      </View>
    </View>
  );
}

type AlexaIntegrationCardProps = {
  onPress: () => void;
};

function AlexaIntegrationCard({ onPress }: AlexaIntegrationCardProps) {
  return (
    <Pressable style={styles.alexaCard} onPress={onPress}>
      <Text style={styles.alexaText}>alexa</Text>
      <AmazonSmile />
      <Text style={styles.integrationText}>Sincronización disponible</Text>
    </Pressable>
  );
}

type ProfileMenuProps = {
  alerts: number;
  onComingSoon: (title: string) => void;
};

function ProfileMenu({ alerts, onComingSoon }: ProfileMenuProps) {
  return (
    <View style={styles.menuCard}>
      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
        onPress={() => onComingSoon("Gestion del hogar")}
      >
        <Ionicons name="home-outline" size={38} color="#000000" />
        <View style={styles.menuCopy}>
          <Text style={styles.menuText}>Gestion del hogar</Text>
          <Text style={styles.menuSubtext}>Habitaciones, permisos y escenas</Text>
        </View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
        onPress={() => onComingSoon("Centro de mensajes")}
      >
        <Ionicons name="chatbubble-outline" size={38} color="#000000" />
        <View style={styles.menuCopy}>
          <Text style={styles.menuText}>Centro de mensajes</Text>
          <Text style={styles.menuSubtext}>{alerts ? `${alerts} alerta pendiente` : "Sin novedades"}</Text>
        </View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
        onPress={() => onComingSoon("Centro de ayuda")}
      >
        <Ionicons name="help-circle-outline" size={38} color="#000000" />
        <View style={styles.menuCopy}>
          <Text style={styles.menuText}>Centro de ayuda</Text>
          <Text style={styles.menuSubtext}>Soporte y preguntas frecuentes</Text>
        </View>
      </Pressable>
    </View>
  );
}

type LanguageSectionProps = {
  language: (typeof languages)[number]["code"];
  onLanguageChange: (language: (typeof languages)[number]["code"]) => void;
};

function LanguageSection({ language, onLanguageChange }: LanguageSectionProps) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name="language-outline" size={22} color={BLUE} />
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>Idioma</Text>
          <Text style={styles.sectionDescription}>Selecciona el idioma principal de la app.</Text>
        </View>
      </View>
      <View style={styles.languageRow}>
        {languages.map((item) => {
          const active = language === item.code;

          return (
            <Pressable
              key={item.code}
              style={[styles.languageButton, active && styles.languageButtonActive]}
              onPress={() => onLanguageChange(item.code)}
            >
              <Text style={[styles.languageText, active && styles.languageTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type OfflineSectionProps = {
  offlineMode: boolean;
  onOfflineModeChange: (enabled: boolean) => void;
};

function OfflineSection({ offlineMode, onOfflineModeChange }: OfflineSectionProps) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name="cloud-offline-outline" size={22} color={BLUE} />
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>Modo sin conexión</Text>
          <Text style={styles.sectionDescription}>Conserva datos recientes y pausa sincronizaciones externas.</Text>
        </View>
      </View>
      <View style={styles.settingRow}>
        <View style={styles.settingCopy}>
          <Text style={styles.settingTitle}>{offlineMode ? "Activo" : "Inactivo"}</Text>
          <Text style={styles.settingText}>
            {offlineMode ? "La app usará datos guardados." : "La app sincronizará cuando haya conexión."}
          </Text>
        </View>
        <Switch
          value={offlineMode}
          onValueChange={onOfflineModeChange}
          trackColor={{ false: "#CDD2E4", true: "#BDE8CB" }}
          thumbColor={offlineMode ? "#35AD61" : "#FFFFFF"}
        />
      </View>
    </View>
  );
}

type ActionSectionProps = {
  actionIcon: keyof typeof Ionicons.glyphMap;
  actionLabel: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  title: string;
};

function ActionSection({ actionIcon, actionLabel, description, icon, onPress, title }: ActionSectionProps) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={22} color={BLUE} />
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.secondaryAction, pressed && styles.actionPressed]}
        onPress={onPress}
      >
        <Ionicons name={actionIcon} size={19} color={BLUE} />
        <Text style={styles.secondaryActionText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

type DangerSectionProps = {
  onDeactivate: () => void;
};

function DangerSection({ onDeactivate }: DangerSectionProps) {
  return (
    <View style={[styles.sectionCard, styles.dangerSection]}>
      <View style={styles.sectionHeader}>
        <Ionicons name="person-remove-outline" size={22} color={RED} />
        <View style={styles.sectionCopy}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Desactivación de cuenta</Text>
          <Text style={styles.sectionDescription}>Pausa el acceso y la sincronización de tu cuenta.</Text>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.deactivateButton, pressed && styles.deactivatePressed]}
        onPress={onDeactivate}
      >
        <Ionicons name="person-remove-outline" size={19} color={RED} />
        <Text style={styles.deactivateText}>Desactivar cuenta</Text>
      </Pressable>
    </View>
  );
}

type SettingsLinkProps = {
  onPress: () => void;
};

function SettingsLink({ onPress }: SettingsLinkProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ajustesButton, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name="settings-outline" size={20} color={BLUE} />
      <Text style={styles.ajustesText}>Ajustes y sincronización</Text>
      <Ionicons name="chevron-forward" size={20} color={BLUE} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const {
    activeDevices,
    deactivateAccount,
    devices,
    language,
    offlineMode,
    sessionName,
    setLanguage,
    setOfflineMode,
  } = useSmartHome();
  const alerts = activeDevices.filter((device) => !device.verified).length;
  const onlineDevices = devices.filter((device) => device.online).length;

  function showComingSoon(title: string) {
    Alert.alert(title, "Modulo listo para conectar con el backend o integracion externa.");
  }

  function confirmDeactivation() {
    Alert.alert(
      "Desactivar cuenta",
      "Tu cuenta dejará de iniciar sesión y se pausará la sincronización. Podrás reactivarla desde el inicio de sesión en esta versión de prueba.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: () => {
            deactivateAccount();
            router.replace("/welcome");
          },
        },
      ],
    );
  }

  function showAuditDetail() {
    Alert.alert(
      "Auditoría",
      `Último acceso: hoy\nAlertas pendientes: ${alerts}\nDispositivos activos: ${onlineDevices}\nModo sin conexión: ${offlineMode ? "activo" : "inactivo"}`,
    );
  }

  function confirmRestoreData() {
    Alert.alert(
      "Restaurar datos",
      "Se restauraran preferencias locales y datos de prueba sin eliminar la cuenta.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: () => {
            setLanguage("es");
            setOfflineMode(false);
            Alert.alert("Datos restaurados", "Las preferencias locales volvieron a su estado inicial.");
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingTop: layout.compact ? 12 : 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
        <TopActions
          onComingSoon={showComingSoon}
          onOpenSettings={() => router.push("/settings")}
        />

        <ProfileHeader onlineDevices={onlineDevices} sessionName={sessionName} />

        <AlexaIntegrationCard onPress={() => showComingSoon("Alexa")} />

        <ProfileMenu alerts={alerts} onComingSoon={showComingSoon} />

        <LanguageSection language={language} onLanguageChange={setLanguage} />

        <OfflineSection offlineMode={offlineMode} onOfflineModeChange={setOfflineMode} />

        <ActionSection
          actionIcon="list-outline"
          actionLabel="Ver auditoría"
          description="Consulta actividad reciente y eventos de seguridad."
          icon="shield-checkmark-outline"
          onPress={showAuditDetail}
          title="Auditoría"
        />

        <ActionSection
          actionIcon="refresh-outline"
          actionLabel="Restaurar datos"
          description="Restablece preferencias locales y datos de prueba."
          icon="refresh-circle-outline"
          onPress={confirmRestoreData}
          title="Restauración de datos"
        />

        <DangerSection onDeactivate={confirmDeactivation} />

        <SettingsLink onPress={() => router.push("/settings")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const appFont = "sans-serif-medium";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    alignItems: "center",
    paddingBottom: 128,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  topActions: {
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 14,
  },
  settingsButton: {
    padding: 4,
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 8,
    marginTop: 35,
  },
  avatar: {
    width: 78,
    height: 78,
    alignItems: "center",
    backgroundColor: "#DDDDFB",
    borderRadius: 39,
    justifyContent: "center",
  },
  profileCopy: {
    flex: 1,
    marginLeft: 22,
    minWidth: 0,
  },
  greeting: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 19,
    fontWeight: "800",
  },
  profileMeta: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },
  alexaCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FBFBFD",
    borderRadius: 16,
    justifyContent: "center",
    marginTop: 33,
    minHeight: 102,
    paddingVertical: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 7,
    width: "100%",
  },
  alexaText: {
    color: "#0582C9",
    fontFamily: appFont,
    fontSize: 41,
    fontWeight: "800",
    lineHeight: 42,
  },
  integrationText: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  menuCard: {
    backgroundColor: LILAC,
    borderRadius: 16,
    marginTop: 38,
    paddingHorizontal: 12,
    paddingVertical: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  menuRow: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    minHeight: 72,
    paddingHorizontal: 4,
  },
  menuRowPressed: {
    backgroundColor: "rgba(8, 100, 200, 0.08)",
  },
  menuCopy: {
    flex: 1,
    marginLeft: 18,
    minWidth: 0,
  },
  menuText: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 19,
    fontWeight: "800",
  },
  menuSubtext: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: "#F4F6FF",
    borderRadius: 14,
    gap: 16,
    marginTop: 24,
    padding: 14,
  },
  dangerSection: {
    backgroundColor: "#FFF7F6",
    borderColor: "#FFD1CB",
    borderWidth: 1,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  sectionCopy: {
    flex: 1,
  },
  sectionTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  dangerTitle: {
    color: RED,
  },
  sectionDescription: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3,
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE2F5",
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  languageButtonActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  languageText: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
  languageTextActive: {
    color: "#FFFFFF",
  },
  settingRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  secondaryAction: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE2F5",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 44,
  },
  actionPressed: {
    opacity: 0.75,
  },
  secondaryActionText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
  settingCopy: {
    flex: 1,
    minWidth: 0,
  },
  settingTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
  settingText: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3,
  },
  deactivateButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#FFF1EF",
    borderColor: "#FFD1CB",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  deactivatePressed: {
    opacity: 0.75,
  },
  deactivateText: {
    color: RED,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
  ajustesButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#F0F4FF",
    borderColor: BLUE,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    height: 48,
    justifyContent: "center",
    marginTop: 32,
    paddingHorizontal: 16,
  },
  ajustesText: {
    color: BLUE,
    flex: 1,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "700",
    minWidth: 0,
  },
});
