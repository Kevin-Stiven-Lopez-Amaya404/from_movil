
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/lib/api/api-error";
import { useSmartHome } from "@/lib/context/smart-home-context";
import type { HomeRole, SmartHomePlace } from "@/lib/domain/home";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./homes.styles";


type HomeFilter = "all" | "favorites" | "shared";

const isSharedRole = (role?: HomeRole) =>
  role === "MEMBER" || role === "GUEST";

function homeCountText(count: number) {
  return `${count} ${count === 1 ? "hogar" : "hogares"}`;
}

export default function HomesScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();

  const {
    accessibleHomes,
    devices,
    homesLoadStatus,
    deviceLoadStatusByHome,
    setActiveHomeId,
    addHome,
    updateHome,
    deleteHome,
    toggleHomeFavorite,
  } = useSmartHome();

  const [filter, setFilter] = useState<HomeFilter>("all");
  const [createVisible, setCreateVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingHome, setEditingHome] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const result = new Map<string, number>();

    for (const device of devices) {
      result.set(
        device.homeId,
        (result.get(device.homeId) ?? 0) + 1,
      );
    }

    return result;
  }, [devices]);

  const favoriteCount = accessibleHomes.filter(
    (home) => home.favorite,
  ).length;

  const sharedCount = accessibleHomes.filter(
    (home) => isSharedRole(home.homeRole),
  ).length;

  const unknownRoleCount = accessibleHomes.filter(
    (home) => !home.homeRole,
  ).length;

  const visibleHomes = useMemo(() => {
    if (filter === "favorites") {
      return accessibleHomes.filter((home) => home.favorite);
    }

    if (filter === "shared") {
      return accessibleHomes.filter(
        (home) => isSharedRole(home.homeRole),
      );
    }

    return accessibleHomes;
  }, [accessibleHomes, filter]);

  function openHome(homeId: string) {
    setActiveHomeId(homeId);

    router.push({
      pathname: "/(tabs)/home-detail",
      params: { homeId, from: "homes" },
    });
  }

  async function toggleFavorite(home: SmartHomePlace) {
    try {
      await toggleHomeFavorite(home.id);
    } catch (error) {
      Alert.alert(
        "No se pudo guardar el favorito",
        error instanceof Error
          ? error.message
          : "Vuelve a intentarlo.",
      );
    }
  }

  async function createHome() {
    const name = newName.trim();

    if (creating) return;

    if (name.length < 1 || name.length > 100) {
      Alert.alert(
        "Nombre inválido",
        "Escribe entre 1 y 100 caracteres.",
      );
      return;
    }

    setCreating(true);

    try {
      await addHome(name);

      setCreateVisible(false);
      setNewName("");
      setFilter("all");

      Alert.alert("Hogar creado", `Se creó “${name}”.`);
    } catch (error) {
      Alert.alert(
        "No se pudo crear el hogar",
        getApiErrorMessage(error),
      );
    } finally {
      setCreating(false);
    }
  }

  function startEdit(home: SmartHomePlace) {
    setEditingHome({
      id: home.id,
      name: home.name,
    });

    setEditName(home.name);
  }

  async function saveHome() {
    if (!editingHome || saving) return;

    const name = editName.trim();

    if (name.length < 1 || name.length > 100) {
      Alert.alert(
        "Nombre inválido",
        "Escribe entre 1 y 100 caracteres.",
      );
      return;
    }

    if (name === editingHome.name) {
      setEditingHome(null);
      return;
    }

    setSaving(true);

    try {
      await updateHome(editingHome.id, name);

      setEditingHome(null);

      Alert.alert(
        "Hogar actualizado",
        "El nombre se guardó correctamente.",
      );
    } catch (error) {
      Alert.alert(
        "No se pudo actualizar",
        getApiErrorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(home: SmartHomePlace) {
    if (deletingId) return;

    Alert.alert(
      "Eliminar hogar",
      `¿Deseas eliminar “${home.name}”?\n\nEsta acción desactivará el hogar y no puede realizarse si tiene dispositivos vinculados.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setDeletingId(home.id);

            try {
              await deleteHome(home.id);

              Alert.alert(
                "Hogar eliminado",
                "El hogar se eliminó correctamente.",
              );
            } catch (error) {
              Alert.alert(
                "No se pudo eliminar",
                getApiErrorMessage(error),
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  }

  function openOptions(home: SmartHomePlace) {
    if (home.homeRole !== "OWNER" || deletingId) return;

    Alert.alert("Administrar hogar", home.name, [
      {
        text: "Editar nombre",
        onPress: () => startEdit(home),
      },
      {
        text: "Eliminar hogar",
        style: "destructive",
        onPress: () => confirmDelete(home),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  }

  function deviceLabel(homeId: string) {
    const status = deviceLoadStatusByHome[homeId];

    if (status === "loading" || status === undefined) {
      return "Cargando dispositivos...";
    }

    if (status === "error") {
      return "Dispositivos no disponibles";
    }

    const count = counts.get(homeId) ?? 0;

    return `${count} ${
      count === 1 ? "dispositivo" : "dispositivos"
    }`;
  }

  function emptyDescription() {
    if (filter === "favorites") {
      return "No tienes hogares marcados como favoritos.";
    }

    if (filter === "shared") {
      return unknownRoleCount > 0
        ? "No se pudo confirmar el rol de algunos hogares. Comprueba tu acceso y vuelve a cargar la pantalla."
        : "Aún no tienes hogares compartidos contigo como miembro o invitado.";
    }

    return "Crea tu primer hogar para comenzar a administrar dispositivos.";
  }

  const isLoaded = homesLoadStatus === "loaded";

  const filterItems: {
    key: HomeFilter;
    label: string;
    count: number;
  }[] = [
    {
      key: "all",
      label: "Todos",
      count: accessibleHomes.length,
    },
    {
      key: "favorites",
      label: "Favoritos",
      count: favoriteCount,
    },
    {
      key: "shared",
      label: "Compartidos",
      count: sharedCount,
    },
  ];

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop + 12,
          paddingBottom: layout.screenBottom + 20,
        }}
      >
        <View
          style={[
            styles.content,
            { maxWidth: layout.contentWidth },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
          >
            Mis hogares
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: theme.muted },
            ]}
          >
            Gestiona tus hogares y dispositivos.
          </Text>

          {/* Resumen y creación */}
          <View
            style={[
              styles.summaryBanner,
              {
                backgroundColor: theme.rowAlt,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <View style={styles.summaryCopy}>
              <View style={styles.summaryStatus}>
                <View style={[styles.statusDot, { backgroundColor: theme.success }]} />

                <Text style={[styles.summaryCaption, { color: theme.muted }]}>
                  HOGARES DISPONIBLES
                </Text>
              </View>

              <Text style={[styles.summaryNumber, { color: theme.text }]}>
                {isLoaded
                  ? homeCountText(accessibleHomes.length)
                  : "Consultando..."}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Crear nuevo hogar"
              disabled={!isLoaded || creating}
              onPress={() => setCreateVisible(true)}
              style={({ pressed }) => [
                styles.newHomeButton,
                { backgroundColor: theme.blue },
                (!isLoaded || creating) && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="add"
                size={20}
                color={theme.onPrimary}
              />

              <Text
                style={[
                  styles.newHomeText,
                  { color: theme.onPrimary },
                ]}
              >
                Nuevo hogar
              </Text>
            </Pressable>
          </View>

          {/* Chips de filtro */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={styles.filterScroll}
          >
            {filterItems.map((item) => {
              const active = filter === item.key;

              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${item.label}: ${item.count} hogares`}
                  onPress={() => setFilter(item.key)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: active
                        ? theme.blue
                        : theme.card,
                      borderColor: active
                        ? theme.blue
                        : theme.borderLight,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color: active
                          ? "#FFFFFF"
                          : theme.text,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>

                  <Text
                    style={[
                      styles.filterCount,
                      {
                        color: active
                          ? "#FFFFFF"
                          : theme.muted,
                      },
                    ]}
                  >
                    {item.count}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Encabezado de resultados */}
          <View style={styles.listHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text },
              ]}
            >
              TUS HOGARES
            </Text>

            {isLoaded ? (
              <Text
                style={[
                  styles.visibleCount,
                  { color: theme.muted },
                ]}
              >
                {homeCountText(visibleHomes.length)}
              </Text>
            ) : null}
          </View>

          {/* Cargando */}
          {homesLoadStatus === "loading" ? (
            <View
              style={[
                styles.emptyPanel,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={29}
                color={theme.blue}
              />

              <Text
                style={[
                  styles.emptyTitle,
                  { color: theme.text },
                ]}
              >
                Cargando hogares...
              </Text>
            </View>
          ) : homesLoadStatus === "error" ? (
            <View
              style={[
                styles.emptyPanel,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={29}
                color={theme.danger}
              />

              <Text
                style={[
                  styles.emptyTitle,
                  { color: theme.text },
                ]}
              >
                No se pudieron cargar los hogares
              </Text>

              <Text
                style={[
                  styles.emptyCopy,
                  { color: theme.muted },
                ]}
              >
                Comprueba tu conexión e inténtalo nuevamente.
              </Text>
            </View>
          ) : visibleHomes.length === 0 ? (
            <View
              style={[
                styles.emptyPanel,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name={
                  filter === "favorites"
                    ? "star-outline"
                    : "home-outline"
                }
                size={29}
                color={theme.blue}
              />

              <Text
                style={[
                  styles.emptyTitle,
                  { color: theme.text },
                ]}
              >
                {filter === "favorites"
                  ? "Sin favoritos"
                  : filter === "shared"
                    ? "Sin hogares compartidos"
                    : "Sin hogares"}
              </Text>

              <Text
                style={[
                  styles.emptyCopy,
                  { color: theme.muted },
                ]}
              >
                {emptyDescription()}
              </Text>
            </View>
          ) : (
            /* Lista de hogares */
            <View style={styles.homesList}>
              {visibleHomes.map((home) => {
                const shared = isSharedRole(home.homeRole);
                const detail = deviceLabel(home.id);

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
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Entrar al hogar ${home.name}`}
                      onPress={() => openHome(home.id)}
                      style={({ pressed }) => [
                        styles.homeMain,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.homeIcon,
                          {
                            backgroundColor: theme.rowAlt,
                          },
                        ]}
                      >
                        <Ionicons
                          name="home-outline"
                          size={25}
                          color={theme.blue}
                        />
                      </View>

                      <View style={styles.homeText}>
                        <View style={styles.nameLine}>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.homeName,
                              { color: theme.text },
                            ]}
                          >
                            {home.name}
                          </Text>

                        </View>

                        <Text
                          numberOfLines={2}
                          style={[
                            styles.homeMeta,
                            { color: theme.muted },
                          ]}
                        >
                          {detail}
                          {shared
                            ? " · Compartido contigo"
                            : ""}
                        </Text>
                      </View>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        home.favorite
                          ? `Quitar ${home.name} de favoritos`
                          : `Agregar ${home.name} a favoritos`
                      }
                      accessibilityState={{ selected: home.favorite }}
                      onPress={() => void toggleFavorite(home)}
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.favoriteButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name={home.favorite ? "star" : "star-outline"}
                        size={20}
                        color={home.favorite ? "#D99810" : theme.muted}
                      />
                    </Pressable>

                    {home.homeRole === "OWNER" ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Opciones de ${home.name}`}
                        disabled={deletingId !== null}
                        onPress={() => openOptions(home)}
                        hitSlop={8}
                        style={({ pressed }) => [
                          styles.menuButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={20}
                          color={theme.muted}
                        />
                      </Pressable>
                    ) : null}

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Abrir ${home.name}`}
                      onPress={() => openHome(home.id)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.arrowButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={22}
                        color={theme.muted}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de creación */}
      <Modal
        visible={createVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!creating) setCreateVisible(false);
        }}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              paddingBottom: Math.max(insets.bottom, 22),
              paddingTop: Math.max(insets.top, 22),
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
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
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.text },
                ]}
              >
                Nuevo hogar
              </Text>

              <Text
                style={[
                  styles.modalCopy,
                  { color: theme.muted },
                ]}
              >
                Elige un nombre para identificarlo en SmartHome.
              </Text>

              <TextInput
                accessibilityLabel="Nombre del nuevo hogar"
                value={newName}
                onChangeText={setNewName}
                maxLength={100}
                editable={!creating}
                placeholder="Ej. Casa principal"
                placeholderTextColor={theme.muted}
                autoCapitalize="sentences"
                returnKeyType="done"
                onSubmitEditing={() => void createHome()}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.borderLight,
                    color: theme.text,
                  },
                ]}
              />

              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={creating}
                  onPress={() => setCreateVisible(false)}
                  style={[
                    styles.secondaryAction,
                    { borderColor: theme.borderLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryActionText,
                      { color: theme.text },
                    ]}
                  >
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={creating || !newName.trim()}
                  onPress={() => void createHome()}
                  style={[
                    styles.primaryAction,
                    { backgroundColor: theme.blue },
                    (creating || !newName.trim()) &&
                      styles.disabled,
                  ]}
                >
                  <Text style={styles.primaryActionText}>
                    {creating ? "Creando..." : "Crear hogar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal de edición */}
      <Modal
        visible={editingHome !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!saving) setEditingHome(null);
        }}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              paddingBottom: Math.max(insets.bottom, 22),
              paddingTop: Math.max(insets.top, 22),
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
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
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.text },
                ]}
              >
                Editar hogar
              </Text>

              <Text
                style={[
                  styles.modalCopy,
                  { color: theme.muted },
                ]}
              >
                Modifica el nombre del hogar seleccionado.
              </Text>

              <TextInput
                accessibilityLabel="Editar nombre del hogar"
                value={editName}
                onChangeText={setEditName}
                maxLength={100}
                editable={!saving}
                placeholder="Nombre del hogar"
                placeholderTextColor={theme.muted}
                autoCapitalize="sentences"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => void saveHome()}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.borderLight,
                    color: theme.text,
                  },
                ]}
              />

              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={saving}
                  onPress={() => setEditingHome(null)}
                  style={[
                    styles.secondaryAction,
                    { borderColor: theme.borderLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryActionText,
                      { color: theme.text },
                    ]}
                  >
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={saving || !editName.trim()}
                  onPress={() => void saveHome()}
                  style={[
                    styles.primaryAction,
                    { backgroundColor: theme.blue },
                    (saving || !editName.trim()) &&
                      styles.disabled,
                  ]}
                >
                  <Text style={styles.primaryActionText}>
                    {saving ? "Guardando..." : "Guardar"}
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
