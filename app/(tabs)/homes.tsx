import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/lib/api/api-error";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

export default function HomesScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const {
    accessibleHomes,
    devices,
    homesLoadStatus,
    deviceLoadStatusByHome,
    setActiveHomeId,
    addHome,
  } = useSmartHome();
  const [createHomeVisible, setCreateHomeVisible] = useState(false);
  const [newHomeName, setNewHomeName] = useState("");
  const [creatingHome, setCreatingHome] = useState(false);

  async function handleCreateHome() {
    const name = newHomeName.trim();

    if (!name) {
      Alert.alert("Nombre requerido", "Escribe un nombre para el hogar.");
      return;
    }

    if (creatingHome) return;

    setCreatingHome(true);

    try {
      await addHome(name);
      setCreateHomeVisible(false);
      setNewHomeName("");
      Alert.alert("Hogar creado", `Se creó “${name}”.`);
    } catch (error) {
      Alert.alert(
        "No se pudo crear el hogar",
        getApiErrorMessage(error),
      );
    } finally {
      setCreatingHome(false);
    }
  }

  const deviceCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const device of devices) {
      counts.set(device.homeId, (counts.get(device.homeId) ?? 0) + 1);
    }

    return counts;
  }, [devices]);

  function openHome(homeId: string) {
    setActiveHomeId(homeId);
    router.push({
      pathname: "/(tabs)/home-detail",
      params: { homeId },
    });
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Mis hogares
            </Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              Selecciona un hogar para ver sus dispositivos y consumo.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Crear hogar"
              onPress={() => setCreateHomeVisible(true)}
              style={[styles.createHomeButton, { backgroundColor: theme.blue }]}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createHomeButtonText}>Crear hogar</Text>
            </Pressable>
          </View>

          {(homesLoadStatus !== "loaded" || accessibleHomes.length === 0) ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name={
                  homesLoadStatus === "loading"
                    ? "time-outline"
                    : homesLoadStatus === "error"
                      ? "alert-circle-outline"
                      : "home-outline"
                }
                size={34}
                color={theme.blue}
              />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {homesLoadStatus === "loading"
                  ? "Cargando hogares..."
                  : homesLoadStatus === "error"
                    ? "No se pudo completar la carga"
                    : "No tienes hogares disponibles"}
              </Text>
              {homesLoadStatus === "error" ? (
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                  No fue posible consultar toda la información.
                  Intenta nuevamente más tarde.
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.list}>
              {accessibleHomes.map((home) => {
                const deviceCount = deviceCounts.get(home.id) ?? 0;
                const deviceStatus = deviceLoadStatusByHome[home.id];

                const deviceCountLabel =
                  deviceStatus === "error"
                    ? "No se pudieron cargar los dispositivos"
                    : deviceStatus === "loading"
                      ? "Cargando dispositivos..."
                      : deviceStatus === "loaded"
                        ? `${deviceCount} ${deviceCount === 1 ? "dispositivo" : "dispositivos"}`
                        : "Dispositivos pendientes de consultar";

                return (
                  <Pressable
                    key={home.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Entrar al hogar ${home.name}. ${deviceCountLabel}`}
                    onPress={() => openHome(home.id)}
                    style={({ pressed }) => [
                      styles.homeCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.borderLight,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.cardTop}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: theme.rowAlt },
                        ]}
                      >
                        <Ionicons
                          name="home-outline"
                          size={22}
                          color={theme.blue}
                        />
                      </View>

                      <View style={styles.homeInfo}>
                        <Text
                          numberOfLines={1}
                          style={[styles.homeName, { color: theme.text }]}
                        >
                          {home.name}
                        </Text>
                        <Text style={[styles.deviceCount, { color: theme.muted }]}>
                          {deviceCountLabel}
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={21}
                        color={theme.muted}
                      />
                    </View>

                    <View
                      style={[
                        styles.cardFooter,
                        { borderTopColor: theme.borderLight },
                      ]}
                    >
                      <Text style={[styles.enterText, { color: theme.blue }]}>
                        Entrar al hogar
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={17}
                        color={theme.blue}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={createHomeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!creatingHome) setCreateHomeVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalWidth}
          >
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Crear hogar
              </Text>
              <Text style={[styles.modalDescription, { color: theme.muted }]}>
                Escribe un nombre para identificarlo.
              </Text>

              <TextInput
                value={newHomeName}
                onChangeText={setNewHomeName}
                placeholder="Ej. Casa principal"
                placeholderTextColor={theme.muted}
                maxLength={100}
                editable={!creatingHome}
                returnKeyType="done"
                onSubmitEditing={() => void handleCreateHome()}
                accessibilityLabel="Nombre del hogar"
                style={[
                  styles.nameInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.background,
                    borderColor: theme.borderLight,
                  },
                ]}
              />

              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={creatingHome}
                  onPress={() => setCreateHomeVisible(false)}
                  style={[styles.modalButton, { borderColor: theme.borderLight }]}
                >
                  <Text style={[styles.cancelText, { color: theme.text }]}>
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={creatingHome || !newHomeName.trim()}
                  onPress={() => void handleCreateHome()}
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    { backgroundColor: theme.blue },
                    (creatingHome || !newHomeName.trim()) && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.confirmText}>
                    {creatingHome ? "Creando..." : "Crear hogar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  header: {
    marginBottom: 22,
  },
  createHomeButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createHomeButtonText: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  list: {
    gap: 14,
  },
  homeCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingBottom: 16,
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  homeInfo: {
    flex: 1,
  },
  homeName: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 17,
    fontWeight: "800",
  },
  deviceCount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    marginTop: 4,
  },
  cardFooter: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  enterText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 28,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.48)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modalWidth: {
    maxWidth: 420,
    width: "100%",
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 21,
    fontWeight: "800",
  },
  modalDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  nameInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 20,
  },
  modalButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 16,
  },
  confirmButton: {
    borderWidth: 0,
  },
  cancelText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: "700",
  },
  confirmText: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.55,
  },
});
