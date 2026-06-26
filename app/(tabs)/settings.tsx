import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useResponsiveLayout } from "@/lib/responsive";
import { useSmartHome } from "@/lib/smart-home-context";

const BLUE = "#0864C8";
const LILAC = "#DDDDFB";
const TEXT = "#454545";
const GREEN = "#35AD61";
const ORANGE = "#F7B637";
const RED = "#FF3B20";
const MUTED = "#6B7280";

export default function SettingsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const { activeDevices, lastSync, offlineMode, refreshSync, resolveDeviceAlert } = useSmartHome();
  const pendingDevices = activeDevices.filter((device) => !device.verified);
  const isSynced = pendingDevices.length === 0 && !offlineMode;

  function handleLogout() {
    Alert.alert("Cerrar sesión", "Tu sesión local se cerrará y volverás al inicio.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => router.replace("/welcome") },
    ]);
  }

  function handleRefresh() {
    if (offlineMode) {
      Alert.alert("Modo sin conexión activo", "Desactiva el modo sin conexión desde Perfil para sincronizar de nuevo.");
      return;
    }

    refreshSync();
    Alert.alert("Sincronización completa", "Los datos locales quedaron actualizados.");
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
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={22} color={BLUE} />
          <Text style={styles.backText}>Perfil</Text>
        </Pressable>

        <Text style={styles.title}>Sincronización de datos</Text>

        <View style={styles.syncCard}>
          <View style={[styles.cloudCircle, !isSynced && styles.cloudWarning]}>
            <Ionicons
              name={isSynced ? "cloud-done" : "cloud-upload-outline"}
              size={38}
              color={isSynced ? GREEN : ORANGE}
            />
          </View>
          <View style={styles.syncCopy}>
            <Text style={styles.syncTitle}>
              {offlineMode ? "Modo sin conexión" : isSynced ? "Sincronizado" : "Revisión pendiente"}
            </Text>
            <Text style={styles.syncSubtitle}>Última: hoy, {lastSync}</Text>
            <Pressable style={styles.checkButton} onPress={handleRefresh}>
              <Text style={styles.checkButtonText}>Comprobar de nuevo</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tus dispositivos activos</Text>

        <View style={styles.deviceList}>
          {activeDevices.map((device) => (
            <View key={device.id} style={[styles.deviceCard, !device.verified && styles.problemCard]}>
              <View style={styles.deviceTopRow}>
                <View style={styles.deviceIconBox}>
                  <Ionicons name="phone-portrait-outline" size={31} color={BLUE} />
                </View>
                <View style={styles.deviceCopy}>
                  <Text style={styles.deviceTitle}>{device.name}</Text>
                  <Text style={styles.deviceSubtitle}>Último acceso: {device.lastAccess}</Text>
                </View>
                {device.verified ? (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={20} color={GREEN} />
                  </View>
                ) : (
                  <Ionicons name="ellipsis-horizontal" size={26} color={TEXT} />
                )}
              </View>

              {!device.verified && (
                <>
                  <View style={styles.warningPill}>
                    <Ionicons name="alert-circle-outline" size={14} color={ORANGE} />
                    <Text style={styles.warningText}>Requiere verificación</Text>
                  </View>

                  <Pressable style={styles.solveButton} onPress={() => resolveDeviceAlert(device.id)}>
                    <Text style={styles.solveText}>Solucionar</Text>
                  </Pressable>
                </>
              )}
            </View>
          ))}
        </View>

        <View style={styles.preferenceCard}>
          <View style={styles.preferenceRow}>
            <Ionicons name="shield-checkmark-outline" size={24} color={BLUE} />
            <View style={styles.preferenceCopy}>
              <Text style={styles.preferenceTitle}>Seguridad de cuenta</Text>
              <Text style={styles.preferenceText}>Verificación de dispositivos y sesiones activas.</Text>
            </View>
          </View>
          <View style={styles.preferenceRow}>
            <Ionicons name="notifications-outline" size={24} color={BLUE} />
            <View style={styles.preferenceCopy}>
              <Text style={styles.preferenceTitle}>Alertas inteligentes</Text>
              <Text style={styles.preferenceText}>Avisos por consumo alto y sincronización.</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
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
    paddingBottom: 92,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  backText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "700",
  },
  title: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  syncCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: LILAC,
    borderRadius: 16,
    flexDirection: "row",
    marginTop: 38,
    paddingHorizontal: 17,
    paddingVertical: 12,
    width: "100%",
  },
  cloudCircle: {
    width: 58,
    height: 58,
    alignItems: "center",
    backgroundColor: "#D7FFE1",
    borderRadius: 29,
    justifyContent: "center",
  },
  cloudWarning: {
    backgroundColor: "#FFF3D7",
  },
  syncCopy: {
    flex: 1,
    marginLeft: 22,
  },
  syncTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "800",
  },
  syncSubtitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 5,
  },
  checkButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: BLUE,
    borderRadius: 7,
    borderWidth: 1,
    minHeight: 30,
    justifyContent: "center",
    marginTop: 14,
    paddingHorizontal: 8,
  },
  checkButtonText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  sectionTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 36,
  },
  deviceList: {
    gap: 14,
    marginTop: 13,
  },
  deviceCard: {
    alignItems: "stretch",
    backgroundColor: LILAC,
    borderRadius: 8,
    minHeight: 62,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  problemCard: {
    paddingBottom: 12,
  },
  deviceTopRow: {
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
  },
  deviceIconBox: {
    width: 39,
    height: 39,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    justifyContent: "center",
  },
  deviceCopy: {
    flex: 1,
    marginLeft: 10,
  },
  deviceTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
  },
  deviceSubtitle: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    alignItems: "center",
    backgroundColor: "#D7FFE1",
    borderColor: GREEN,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
  },
  warningPill: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    flexDirection: "row",
    gap: 7,
    minHeight: 30,
    justifyContent: "center",
    marginTop: 15,
  },
  warningText: {
    color: ORANGE,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  solveButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 30,
    justifyContent: "center",
    marginTop: 6,
  },
  solveText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
  preferenceCard: {
    backgroundColor: "#F4F6FF",
    borderRadius: 14,
    gap: 14,
    marginTop: 28,
    padding: 14,
  },
  preferenceRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  preferenceCopy: {
    flex: 1,
    marginLeft: 10,
  },
  preferenceTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
  preferenceText: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  logoutButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: RED,
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    height: 52,
    justifyContent: "center",
    marginTop: 34,
    marginBottom: 24,
  },
  logoutButtonPressed: {
    backgroundColor: "#E62810",
  },
  logoutText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "800",
  },
});
