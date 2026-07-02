import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ProfileMenuItem } from "@/components/profile/ProfileMenuItem";
import { ProfileModule } from "@/components/profile/ProfileModule";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { profileFont, profileTheme } from "@/components/profile/profileTheme";
import { useResponsiveLayout } from "@/lib/responsive";
import { useSmartHome } from "@/lib/smart-home-context";

const BLUE = profileTheme.blue;
const DARK = "#FFFFFF";
const CARD = profileTheme.card;
const ROW = profileTheme.row;
const TEXT = profileTheme.text;
const MUTED = profileTheme.muted;
const RED = profileTheme.danger;

const languages = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const {
    activeDevices,
    deactivateAccount,
    devices,
    homes,
    language,
    offlineMode,
    sessionName,
    setLanguage,
    setOfflineMode,
  } = useSmartHome();
  const alerts = activeDevices.filter((device) => !device.verified).length;
  const onlineDevices = devices.filter((device) => device.online).length;

  function showComingSoon(title: string) {
    Alert.alert(title, "Módulo listo para conectar con el backend.");
  }

  function showSubscription() {
    Alert.alert("Suscripciones", "Apartado preparado para planes y beneficios.");
  }

  function confirmLogout() {
    Alert.alert("Cerrar sesión", "Tu sesión local se cerrará y volverás al inicio.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => router.replace("/welcome") },
    ]);
  }

  function confirmDeactivation() {
    Alert.alert(
      "Desactivar cuenta",
      "Tu cuenta dejará de iniciar sesión y se pausará la sincronización.",
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
      "Se restaurarán preferencias locales y datos de prueba sin eliminar la cuenta.",
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
          <View style={styles.topActions}>
            <Pressable onPress={() => router.push("/devices")}>
              <MaterialCommunityIcons name="home-city-outline" size={34} color={TEXT} />
            </Pressable>
            <Pressable onPress={() => router.push("/settings")} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={30} color={TEXT} />
            </Pressable>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{sessionName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.greeting}>Hola, {sessionName}</Text>
              <Text style={styles.profileMeta}>{onlineDevices} dispositivos activos</Text>
            </View>
          </View>

          <View style={styles.accountCard}>
            <View style={styles.handle} />

            <View style={styles.accountHeader}>
              <View style={styles.accountAvatar}>
                <Text style={styles.accountInitial}>{sessionName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.accountCopy}>
                <Text numberOfLines={1} style={styles.accountName}>{sessionName}@smarthome.local</Text>
                <Text numberOfLines={1} style={styles.accountEmail}>{sessionName.toLowerCase()}@smarthome.com</Text>
              </View>
              <Ionicons name="swap-horizontal-outline" size={27} color={TEXT} />
            </View>

            <Pressable style={styles.homeAccountRow} onPress={() => router.push("/devices")}>
              <View style={styles.homeAccountIcon}>
                <Ionicons name="home" size={20} color={BLUE} />
              </View>
              <Text numberOfLines={1} style={styles.homeAccountText}>
                Casa de {sessionName} · {homes.length} hogares
              </Text>
            </Pressable>
          </View>

          <ProfileModule title="Cuenta y hogares" subtitle="Perfil, hogares, mensajes y soporte.">
            <ProfileMenuItem icon="person-add-outline" title="Editar información de perfil" onPress={() => router.push("/settings")} />
            <ProfileMenuItem icon="home-outline" title="Administrar hogares" onPress={() => router.push("/devices")} />
            <ProfileMenuItem
              description={alerts ? `${alerts} alerta pendiente` : "Sin novedades"}
              icon="chatbubble-outline"
              intent="primary"
              onPress={() => showComingSoon("Centro de mensajes")}
              title="Centro de mensajes"
              variant="boxed"
            />
            <ProfileMenuItem
              description="Soporte y preguntas frecuentes"
              icon="help-circle-outline"
              intent="primary"
              onPress={() => showComingSoon("Centro de ayuda")}
              title="Centro de ayuda"
              variant="boxed"
            />
            <ProfileMenuItem icon="diamond-outline" title="Suscripciones" onPress={showSubscription} />
          </ProfileModule>

          <ProfileModule title="Preferencias" subtitle="Idioma y comportamiento de sincronización.">
            <ProfileSectionHeader
              description="Selecciona el idioma principal de la app."
              icon="language-outline"
              title="Idioma"
            />
            <View style={styles.languageRow}>
              {languages.map((item) => {
                const active = language === item.code;

                return (
                  <Pressable
                    key={item.code}
                    style={[styles.languageButton, active && styles.languageButtonActive]}
                    onPress={() => setLanguage(item.code)}
                  >
                    <Text style={[styles.languageText, active && styles.languageTextActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.moduleDivider} />

            <ProfileSectionHeader
              description="Conserva datos recientes y pausa sincronizaciones externas."
              icon="cloud-offline-outline"
              title="Modo sin conexión"
            />
            <View style={styles.settingRow}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>{offlineMode ? "Activo" : "Inactivo"}</Text>
                <Text style={styles.settingText}>
                  {offlineMode ? "La app usará datos guardados." : "La app sincronizará cuando haya conexión."}
                </Text>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={setOfflineMode}
                trackColor={{ false: "#CDD2E4", true: "#BDE8CB" }}
                thumbColor={offlineMode ? "#35AD61" : "#FFFFFF"}
              />
            </View>
          </ProfileModule>

          <ProfileModule title="Seguridad y datos" subtitle="Auditoría, restauración y control de cuenta.">
            <ProfileSectionHeader
              description="Consulta actividad reciente y eventos de seguridad."
              icon="shield-checkmark-outline"
              title="Auditoría"
            />
            <Pressable style={styles.secondaryAction} onPress={showAuditDetail}>
              <Ionicons name="list-outline" size={19} color={BLUE} />
              <Text style={styles.secondaryActionText}>Ver auditoría</Text>
            </Pressable>

            <View style={styles.moduleDivider} />

            <ProfileSectionHeader
              description="Restablece preferencias locales y datos de prueba."
              icon="refresh-circle-outline"
              title="Restauración de datos"
            />
            <Pressable style={styles.secondaryAction} onPress={confirmRestoreData}>
              <Ionicons name="refresh-outline" size={19} color={BLUE} />
              <Text style={styles.secondaryActionText}>Restaurar datos</Text>
            </Pressable>

            <View style={styles.moduleDivider} />

            <ProfileSectionHeader
              danger
              description="Pausa el acceso y la sincronización de tu cuenta."
              icon="person-remove-outline"
              title="Desactivación de cuenta"
            />
            <Pressable style={styles.deactivateButton} onPress={confirmDeactivation}>
              <Ionicons name="person-remove-outline" size={19} color={RED} />
              <Text style={styles.deactivateText}>Desactivar cuenta</Text>
            </Pressable>
          </ProfileModule>

          <ProfileModule title="Sesión">
            <ProfileMenuItem icon="close-circle-outline" intent="danger" title="Cerrar sesión" onPress={confirmLogout} />
          </ProfileModule>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const appFont = profileFont;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK,
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
    marginTop: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    alignItems: "center",
    backgroundColor: "#DDDDFB",
    borderRadius: 36,
    justifyContent: "center",
  },
  avatarText: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 28,
    fontWeight: "900",
  },
  profileCopy: {
    flex: 1,
    marginLeft: 18,
    minWidth: 0,
  },
  greeting: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "900",
  },
  profileMeta: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },
  accountCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    marginTop: 28,
    padding: 14,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "#C7D2FE",
    borderRadius: 3,
    height: 5,
    marginBottom: 18,
    width: 70,
  },
  accountHeader: {
    alignItems: "center",
    backgroundColor: ROW,
    borderRadius: 14,
    flexDirection: "row",
    padding: 12,
  },
  accountAvatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    backgroundColor: "#74D87C",
    borderRadius: 24,
    justifyContent: "center",
  },
  accountInitial: {
    color: "#102314",
    fontFamily: appFont,
    fontSize: 22,
    fontWeight: "900",
  },
  accountCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  accountName: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "900",
  },
  accountEmail: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  homeAccountRow: {
    alignItems: "center",
    backgroundColor: ROW,
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 8,
    minHeight: 58,
    paddingHorizontal: 12,
  },
  homeAccountIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 10,
    justifyContent: "center",
  },
  homeAccountText: {
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 12,
  },
  accountMenuRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    minHeight: 54,
    paddingHorizontal: 10,
  },
  accountMenuText: {
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "700",
  },
  logoutMenuText: {
    color: RED,
  },
  moduleCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    gap: 12,
    marginTop: 20,
    padding: 14,
  },
  moduleTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "900",
  },
  moduleSubtitle: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: -6,
  },
  moduleDivider: {
    backgroundColor: "#DDE2F5",
    height: 1,
  },
  profileToolRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderColor: "#DDE2F5",
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 4,
    marginVertical: 5,
    minHeight: 62,
    paddingHorizontal: 10,
  },
  profileToolCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  profileToolTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
  },
  profileToolText: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
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
    justifyContent: "center",
    minHeight: 36,
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
  secondaryActionText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
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
    justifyContent: "center",
    minHeight: 44,
  },
  deactivateText: {
    color: RED,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
});
