import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileMenuItem } from "@/components/profile/ProfileMenuItem";
import { ProfileModule } from "@/components/profile/ProfileModule";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { profileFont } from "@/components/profile/profileTheme";
import { useAppTheme } from "@/lib/app-theme";
import { useTranslation } from "@/lib/i18n";
import { useResponsiveLayout } from "@/lib/responsive";
import { useSmartHome } from "@/lib/smart-home-context";

const languages = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();

  // Perfil consume y modifica preferencias globales del usuario.
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

  // Datos derivados para mostrar estado de cuenta y auditoria.
  const alerts = activeDevices.filter((device) => !device.verified).length;
  const onlineDevices = devices.filter((device) => device.online).length;

  /**
   * Muestra una alerta para modulos que ya tienen entrada visual, pero aun no
   * cuentan con backend o pantalla dedicada.
   */
  function showComingSoon(title: string) {
    Alert.alert(title, t("common.readyBackend"));
  }

  /**
   * Cierra la sesion local y vuelve a bienvenida.
   */
  function confirmLogout() {
    Alert.alert(t("action.logout"), t("profile.logoutPrompt"), [
      { text: t("action.cancel"), style: "cancel" },
      { text: t("action.logout"), style: "destructive", onPress: () => router.replace("/welcome") },
    ]);
  }

  /**
   * Desactiva la cuenta local despues de confirmacion.
   * Es una accion sensible, por eso se solicita confirmacion.
   */
  function confirmDeactivation() {
    Alert.alert(t("profile.deactivateAccount"), t("profile.deactivatePrompt"), [
      { text: t("action.cancel"), style: "cancel" },
      {
        text: t("action.deactivate"),
        style: "destructive",
        onPress: () => {
          deactivateAccount();
          router.replace("/welcome");
        },
      },
    ]);
  }

  /**
   * Muestra un resumen de auditoria basado en datos disponibles en memoria.
   */
  function showAuditDetail() {
    Alert.alert(
      t("profile.audit"),
      t("profile.auditBody", {
        alerts,
        devices: onlineDevices,
        offline: offlineMode ? t("common.active") : t("common.inactive"),
      }),
    );
  }

  /**
   * Restaura preferencias locales a valores iniciales.
   */
  function confirmRestoreData() {
    Alert.alert(t("profile.restoreDataAction"), t("profile.restorePrompt"), [
      { text: t("action.cancel"), style: "cancel" },
      {
        text: t("action.restore"),
        onPress: () => {
          setLanguage("es");
          setOfflineMode(false);
          Alert.alert(t("profile.dataRestored"), t("profile.dataRestoredBody"));
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingBottom: layout.screenBottom,
            paddingTop: layout.screenTop,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View style={styles.topActions}>
            <Pressable onPress={() => router.push("/devices")}>
              <MaterialCommunityIcons name="home-city-outline" size={34} color={theme.text} />
            </Pressable>
            <Pressable onPress={() => router.push("/settings")} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={30} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: theme.rowAlt }]}>
              <Text style={[styles.avatarText, { color: theme.text }]}>{sessionName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={[styles.greeting, { color: theme.text }]}>{t("profile.greeting", { name: sessionName })}</Text>
              <Text style={[styles.profileMeta, { color: theme.muted }]}>
                {t("profile.activeDevices", { count: onlineDevices })}
              </Text>
            </View>
          </View>

          <View style={[styles.accountCard, { backgroundColor: theme.card }]}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />

            <View style={[styles.accountHeader, { backgroundColor: theme.row }]}>
              <View style={styles.accountAvatar}>
                <Text style={styles.accountInitial}>{sessionName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.accountCopy}>
                <Text numberOfLines={1} style={[styles.accountName, { color: theme.text }]}>
                  {sessionName}@smarthome.local
                </Text>
                <Text numberOfLines={1} style={[styles.accountEmail, { color: theme.muted }]}>
                  {sessionName.toLowerCase()}@smarthome.com
                </Text>
              </View>
              <Ionicons name="swap-horizontal-outline" size={27} color={theme.text} />
            </View>

            <Pressable style={[styles.homeAccountRow, { backgroundColor: theme.row }]} onPress={() => router.push("/devices")}>
              <View style={[styles.homeAccountIcon, { backgroundColor: theme.rowAlt }]}>
                <Ionicons name="home" size={20} color={theme.blue} />
              </View>
              <Text numberOfLines={1} style={[styles.homeAccountText, { color: theme.text }]}>
                {t("profile.accountHome", { name: sessionName, count: homes.length })}
              </Text>
            </Pressable>
          </View>

          <ProfileModule title={t("profile.accountModule")} subtitle={t("profile.accountModuleSubtitle")}>
            <ProfileMenuItem icon="person-add-outline" title={t("profile.editInfo")} onPress={() => router.push("/settings")} />
            <ProfileMenuItem icon="home-outline" title={t("profile.manageHomes")} onPress={() => router.push("/devices")} />
            <ProfileMenuItem
              description={
                alerts
                  ? t(alerts === 1 ? "common.pendingAlert" : "common.pendingAlerts", { count: alerts })
                  : t("common.noNews")
              }
              icon="chatbubble-outline"
              intent="primary"
              onPress={() => showComingSoon(t("profile.messageCenter"))}
              title={t("profile.messageCenter")}
              variant="boxed"
            />
            <ProfileMenuItem
              description={t("profile.helpSubtitle")}
              icon="help-circle-outline"
              intent="primary"
              onPress={() => showComingSoon(t("profile.helpCenter"))}
              title={t("profile.helpCenter")}
              variant="boxed"
            />
          </ProfileModule>

          <ProfileModule title={t("profile.preferences")} subtitle={t("profile.preferencesSubtitle")}>
            <ProfileSectionHeader
              description={t("profile.languageDescription")}
              icon="language-outline"
              title={t("profile.language")}
            />
            <View style={styles.languageRow}>
              {languages.map((item) => {
                const active = language === item.code;

                return (
                  <Pressable
                    key={item.code}
                    style={[
                      styles.languageButton,
                      { backgroundColor: theme.row, borderColor: theme.border },
                      active && { backgroundColor: theme.blue, borderColor: theme.blue },
                    ]}
                    onPress={() => setLanguage(item.code)}
                  >
                    <Text style={[styles.languageText, { color: active ? "#FFFFFF" : theme.text }]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.moduleDivider, { backgroundColor: theme.divider }]} />

            <ProfileSectionHeader
              description={t("profile.offlineDescription")}
              icon="cloud-offline-outline"
              title={t("profile.offline")}
            />
            <View style={[styles.settingRow, { backgroundColor: theme.row }]}>
              <View style={styles.settingCopy}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  {offlineMode ? t("common.active") : t("common.inactive")}
                </Text>
                <Text style={[styles.settingText, { color: theme.muted }]}>
                  {offlineMode ? t("profile.offlineOnText") : t("profile.offlineOffText")}
                </Text>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={setOfflineMode}
                trackColor={{ false: "#CDD2E4", true: theme.successSoft }}
                thumbColor={offlineMode ? theme.success : "#FFFFFF"}
              />
            </View>
          </ProfileModule>

          <ProfileModule title={t("profile.securityData")} subtitle={t("profile.securityDataSubtitle")}>
            <ProfileSectionHeader
              description={t("profile.auditDescription")}
              icon="shield-checkmark-outline"
              title={t("profile.audit")}
            />
            <Pressable
              style={[styles.secondaryAction, { backgroundColor: theme.row, borderColor: theme.border }]}
              onPress={showAuditDetail}
            >
              <Ionicons name="list-outline" size={19} color={theme.blue} />
              <Text style={[styles.secondaryActionText, { color: theme.blue }]}>{t("action.viewAudit")}</Text>
            </Pressable>

            <View style={[styles.moduleDivider, { backgroundColor: theme.divider }]} />

            <ProfileSectionHeader
              description={t("profile.restoreDescription")}
              icon="refresh-circle-outline"
              title={t("profile.restoreData")}
            />
            <Pressable
              style={[styles.secondaryAction, { backgroundColor: theme.row, borderColor: theme.border }]}
              onPress={confirmRestoreData}
            >
              <Ionicons name="refresh-outline" size={19} color={theme.blue} />
              <Text style={[styles.secondaryActionText, { color: theme.blue }]}>{t("profile.restoreDataAction")}</Text>
            </Pressable>

            <View style={[styles.moduleDivider, { backgroundColor: theme.divider }]} />

            <ProfileSectionHeader
              danger
              description={t("profile.deactivateDescription")}
              icon="person-remove-outline"
              title={t("profile.deactivateAccount")}
            />
            <Pressable
              style={[styles.deactivateButton, { backgroundColor: theme.dangerSoft }]}
              onPress={confirmDeactivation}
            >
              <Ionicons name="person-remove-outline" size={19} color={theme.danger} />
              <Text style={[styles.deactivateText, { color: theme.danger }]}>{t("profile.deactivateAccount")}</Text>
            </Pressable>
          </ProfileModule>

          <ProfileModule title={t("profile.session")}>
            <ProfileMenuItem icon="close-circle-outline" intent="danger" title={t("action.logout")} onPress={confirmLogout} />
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
    alignItems: "center",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  avatarText: {
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
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "900",
  },
  profileMeta: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },
  accountCard: {
    borderRadius: 18,
    marginTop: 28,
    padding: 14,
  },
  handle: {
    alignSelf: "center",
    borderRadius: 3,
    height: 5,
    marginBottom: 18,
    width: 70,
  },
  accountHeader: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    padding: 12,
  },
  accountAvatar: {
    alignItems: "center",
    backgroundColor: "#74D87C",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
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
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "900",
  },
  accountEmail: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  homeAccountRow: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 8,
    minHeight: 58,
    paddingHorizontal: 12,
  },
  homeAccountIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  homeAccountText: {
    flex: 1,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 12,
  },
  moduleDivider: {
    height: 1,
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 12,
  },
  languageText: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
  settingRow: {
    alignItems: "center",
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
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
  settingText: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3,
  },
  secondaryAction: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 44,
  },
  secondaryActionText: {
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
  deactivateButton: {
    alignItems: "center",
    alignSelf: "stretch",
    borderColor: "#FFD1CB",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 44,
  },
  deactivateText: {
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
});
