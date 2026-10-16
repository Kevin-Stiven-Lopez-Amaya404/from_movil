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
    updateHome,
    deleteHome,
  } = useSmartHome();
  const [createHomeVisible, setCreateHomeVisible] = useState(false);
  const [newHomeName, setNewHomeName] = useState("");
  const [creatingHome, setCreatingHome] = useState(false);
  const [editingHome, setEditingHome] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editHomeName, setEditHomeName] = useState("");
  const [savingHome, setSavingHome] = useState(false);
  const [deletingHomeId, setDeletingHomeId] = useState<string | null>(null);

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

  function openEditHome(homeId: string, currentName: string) {
    setEditingHome({ id: homeId, name: currentName });
    setEditHomeName(currentName);
  }

  async function handleUpdateHome() {
    if (!editingHome || savingHome) return;

    const name = editHomeName.trim();

    if (!name || name.length > 100) {
      Alert.alert(
        "Nombre no válido",
        "Escribe un nombre de entre 1 y 100 caracteres.",
      );
      return;
    }

    if (name === editingHome.name) {
      setEditingHome(null);
      return;
    }

    setSavingHome(true);

    try {
      await updateHome(editingHome.id, name);
      setEditingHome(null);
      Alert.alert("Hogar actualizado", "El nombre se guardó correctamente.");
    } catch (error) {
      Alert.alert("No se pudo actualizar", getApiErrorMessage(error));
    } finally {
      setSavingHome(false);
    }
  }

  function handleDeleteHome(homeId: string, homeName: string) {
    if (deletingHomeId) return;

    Alert.alert(
      "Eliminar hogar",
      `¿Deseas eliminar "${homeName}"?\n\nEsta acción desactivará el hogar. No puede realizarse si tiene dispositivos vinculados.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setDeletingHomeId(homeId);

            try {
              await deleteHome(homeId);

              Alert.alert(
                "Hogar eliminado",
                "El hogar se eliminó correctamente.",
              );
            } catch (error) {
              Alert.alert(
                "No se pudo eliminar el hogar",
                getApiErrorMessage(error),
              );
            } finally {
              setDeletingHomeId(null);
            }
          },
        },
      ],
    );
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
      params: { homeId, from: "homes" },
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
          paddingBottom: layout.screenBottom + 110,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.title, { color: theme.text }]}>
                Mis hogares
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ir a notificaciones"
                accessibilityHint="Abre la pantalla de notificaciones"
                onPress={() =>
                  router.navigate("/(tabs)/(main)/notifications")
                }
                style={[
                  styles.messagesButton,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={23}
                  color={theme.blue}
                />
              </Pressable>
            </View>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              Selecciona un hogar para ver sus dispositivos y consumo.
            </Text>
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
                  <View
                    key={home.id}
                    style={[
                      styles.homeCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.borderLight,
                      },
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
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Entrar al hogar ${home.name}`}
                        onPress={() => openHome(home.id)}
                        style={styles.homeAction}
                      >
                        <Ionicons
                          name="arrow-forward-outline"
                          size={20}
                          color={theme.blue}
                        />
                        <Text style={[styles.enterText, { color: theme.blue }]}>
                          Entrar
                        </Text>
                      </Pressable>

                      {home.homeRole === "OWNER" ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Editar nombre de ${home.name}`}
                          onPress={() => openEditHome(home.id, home.name)}
                          style={styles.homeAction}
                        >
                          <Ionicons
                            name="create-outline"
                            size={20}
                            color={theme.blue}
                          />
                          <Text style={[styles.enterText, { color: theme.blue }]}>
                            Editar
                          </Text>
                        </Pressable>
                      ) : null}

                      {home.homeRole === "OWNER" ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Eliminar hogar ${home.name}`}
                          disabled={deletingHomeId !== null}
                          onPress={() => handleDeleteHome(home.id, home.name)}
                          style={[
                            styles.homeAction,
                            { opacity: deletingHomeId ? 0.5 : 1 },
                          ]}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={theme.danger}
                          />
                          <Text style={[styles.enterText, { color: theme.danger }]}>
                            Eliminar
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Crear nuevo hogar"
        accessibilityHint="Abre el formulario para crear un hogar"
        onPress={() => setCreateHomeVisible(true)}
        style={[
          styles.floatingAddButton,
          { backgroundColor: theme.blue },
        ]}
      >
        <Ionicons
          name="add"
          size={32}
          color="#FFFFFF"
        />
      </Pressable>
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
      <Modal
        visible={editingHome !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!savingHome) setEditingHome(null);
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
                Editar nombre del hogar
              </Text>

              <Text style={[styles.modalDescription, { color: theme.muted }]}>
                Modifica el nombre de tu hogar.
              </Text>

              <TextInput
                value={editHomeName}
                onChangeText={setEditHomeName}
                maxLength={100}
                autoFocus
                placeholder="Nombre del hogar"
                placeholderTextColor={theme.muted}
                style={[
                  styles.nameInput,
                  {
                    color: theme.text,
                    borderColor: theme.borderLight,
                  },
                ]}
              />

              <View style={styles.modalActions}>
                <Pressable
                  disabled={savingHome}
                  onPress={() => setEditingHome(null)}
                  style={[
                    styles.modalButton,
                    { borderColor: theme.borderLight },
                  ]}
                >
                  <Text style={[styles.cancelText, { color: theme.text }]}>
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  disabled={savingHome || !editHomeName.trim()}
                  onPress={() => void handleUpdateHome()}
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    { backgroundColor: theme.blue },
                    (savingHome || !editHomeName.trim()) &&
                      styles.disabledButton,
                  ]}
                >
                  <Text style={styles.confirmText}>
                    {savingHome ? "Guardando..." : "Guardar"}
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
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  messagesButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingAddButton: {
    position: "absolute",
    right: 22,
    bottom: 90,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    zIndex: 10,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
  },
  homeAction: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
