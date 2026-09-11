/**
 * Pantalla de Estancias y Dispositivos.
 *
 * - Vista de Estancias con buscador, sub-pestañas y tarjetas con gradiente azul y consumo (⚡ 0 W).
 * - Detalle de Estancia con header de acciones, filtros (Dispositivos, Grupos, Escenas, Termostatos)
 *   y tarjetas de dispositivos con estado de red e interruptor.
 */
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RoomCard } from "@/components/homes/RoomCard";
import { ShellyDeviceCard } from "@/components/homes/ShellyDeviceCard";
import {
    type SmartDevice,
    useSmartHome,
} from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
type TopSubTab =
  | "Todas Las Estancias"
  | "Todos Los Grupos"
  | "Todos los Dispositivos";
type RoomFilter = "Dispositivos" | "Grupos" | "Escenas" | "Termostatos";

export default function HomesScreen() {
  const { homeId } = useLocalSearchParams<{
    homeId?: string;
  }>();

  const layout = useResponsiveLayout();
  const router = useRouter();
  const theme = useAppTheme();

  const {
    activeHomeId,
    addDeviceToHome,
    devices,
    accessibleHomes,
    sessionRole,
    setHomeDeviceState,
  } = useSmartHome();

  const canManage = sessionRole === "admin";
  const canControl = sessionRole !== "invitado";

  // Estados de navegación interna
  const [activeSubTab, setActiveSubTab] = useState<TopSubTab>(
    "Todas Las Estancias",
  );
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("Dispositivos");
  const [searchQuery, setSearchQuery] = useState("");

  // Modales
  const [telemetryDevice, setTelemetryDevice] = useState<SmartDevice | null>(
    null,
  );
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newDeviceName, setNewDeviceName] = useState("");

  // Hogar activo
  const selectedHome =
    accessibleHomes.find((home) => home.id === activeHomeId) ??
    accessibleHomes[0];
  const activeHome =
    accessibleHomes.find((home) => home.id === homeId) ?? selectedHome;

  // Dispositivos del hogar activo
  const homeDevices = useMemo(
    () => (activeHome ? devices.filter((d) => d.homeId === activeHome.id) : []),
    [activeHome, devices],
  );

  // Lista de estancias
  const roomNames = useMemo(() => {
    const set = new Set<string>();
    set.add("Stiven"); // Estancia de referencia en las capturas
    homeDevices.forEach((d) => {
      if (d.room) set.add(d.room);
    });
    return Array.from(set);
  }, [homeDevices]);

  // Datos calculados por estancia
  const roomsData = useMemo(() => {
    return roomNames.map((name) => {
      const roomDevs = homeDevices.filter(
        (d) => d.room.toLowerCase() === name.toLowerCase(),
      );
      const power = roomDevs
        .filter((d) => d.online && d.state === "on")
        .reduce((sum, d) => sum + d.power, 0);
      return {
        name,
        power,
        devices: roomDevs,
      };
    });
  }, [roomNames, homeDevices]);

  // Filtrado por búsqueda
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return roomsData;
    const q = searchQuery.toLowerCase();
    return roomsData.filter((r) => r.name.toLowerCase().includes(q));
  }, [roomsData, searchQuery]);

  // Dispositivos de la estancia seleccionada
  const activeRoomDevices = useMemo(() => {
    if (!selectedRoom) return [];
    return homeDevices.filter(
      (d) => d.room.toLowerCase() === selectedRoom.toLowerCase(),
    );
  }, [homeDevices, selectedRoom]);

  // Manejo de apagado/encendido de la estancia
  function toggleRoomDevices(state: "on" | "off") {
    if (!selectedRoom || !canControl) return;
    activeRoomDevices.forEach((d) => {
      if (d.online) {
        setHomeDeviceState(d.id, state);
      }
    });
    Alert.alert(
      state === "off" ? "Estancia apagada" : "Estancia encendida",
      `Se ${state === "off" ? "apagaron" : "encendieron"} los dispositivos de ${selectedRoom}.`,
    );
  }

  function handleCreateRoom() {
    const clean = newRoomName.trim();
    if (!clean) {
      Alert.alert(
        "Nombre requerido",
        "Ingresa el nombre de la nueva estancia.",
      );
      return;
    }
    if (activeHome) {
      addDeviceToHome(activeHome.id, `Dispositivo de ${clean}`);
    }
    setNewRoomName("");
    setAddModalVisible(false);
    setSelectedRoom(clean);
  }

  function handleCreateDeviceInRoom() {
    const clean = newDeviceName.trim();
    if (!clean) {
      Alert.alert("Nombre requerido", "Ingresa el nombre del dispositivo.");
      return;
    }
    if (activeHome) {
      addDeviceToHome(activeHome.id, clean);
      Alert.alert(
        "Dispositivo agregado",
        `${clean} ha sido registrado en ${selectedRoom ?? "la estancia"}.`,
      );
    }
    setNewDeviceName("");
    setAddModalVisible(false);
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.dark ? "#0C1322" : theme.background },
      ]}
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
          {/* ============================================================ */}
          {/* CABECERA GENERAL DE ESTANCIAS (Sub-pestañas estilo Shelly)     */}
          {/* ============================================================ */}
          <View style={styles.topTabsScroll}>
            {(
              [
                "Todas Las Estancias",
                "Todos Los Grupos",
                "Todos los Dispositivos",
              ] as TopSubTab[]
            ).map((tab) => {
              const active = activeSubTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => {
                    setActiveSubTab(tab);
                    setSelectedRoom(null);
                  }}
                  style={[
                    styles.subTabItem,
                    active && styles.subTabItemActive,
                    active && { borderColor: theme.blue },
                  ]}
                >
                  <Text
                    style={[
                      styles.subTabText,
                      active ? styles.subTabTextActive : { color: theme.muted },
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ============================================================ */}
          {/* VISTA 1: DETALLE DE ESTANCIA ("Stiven") - IMAGEN 4           */}
          {/* ============================================================ */}
          {selectedRoom ? (
            <View style={styles.roomDetailContainer}>
              {/* Header de la estancia */}
              <View
                style={[
                  styles.roomDetailHeader,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <View style={styles.roomDetailHeaderLeft}>
                  <Pressable
                    hitSlop={8}
                    onPress={() => setSelectedRoom(null)}
                    style={styles.roomBackBtn}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={24}
                      color={theme.text}
                    />
                  </Pressable>
                  <Text
                    numberOfLines={1}
                    style={[styles.roomDetailTitle, { color: theme.text }]}
                  >
                    {selectedRoom}
                  </Text>
                </View>

                <View style={styles.roomDetailHeaderActions}>
                  {canManage && (
                    <Pressable
                      onPress={() => setAddModalVisible(true)}
                      style={[
                        styles.actionSquareBtn,
                        { backgroundColor: theme.blue },
                      ]}
                    >
                      <Ionicons name="pencil" size={17} color="#FFFFFF" />
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        selectedRoom,
                        "Acciones rápidas para esta estancia:",
                        [
                          {
                            text: "Encender todos",
                            onPress: () => toggleRoomDevices("on"),
                          },
                          {
                            text: "Apagar todos",
                            onPress: () => toggleRoomDevices("off"),
                            style: "destructive",
                          },
                          { text: "Cancelar", style: "cancel" },
                        ],
                      );
                    }}
                    style={[
                      styles.actionSquareBtn,
                      { backgroundColor: theme.blue },
                    ]}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={17}
                      color="#FFFFFF"
                    />
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        "Información de Estancia",
                        `Estancia: ${selectedRoom}\nHogar: ${activeHome?.name ?? "Principal"}\nDispositivos: ${activeRoomDevices.length}`,
                      );
                    }}
                    style={[
                      styles.actionRoundBtn,
                      { backgroundColor: theme.rowAlt },
                    ]}
                  >
                    <Ionicons name="information" size={16} color={theme.text} />
                  </Pressable>
                </View>
              </View>

              {/* Píldoras de Filtro (Dispositivos, Grupos, Escenas, Termostatos) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.roomFiltersRow}
              >
                {(
                  [
                    "Dispositivos",
                    "Grupos",
                    "Escenas",
                    "Termostatos",
                  ] as RoomFilter[]
                ).map((filter) => {
                  const active = roomFilter === filter;
                  return (
                    <Pressable
                      key={filter}
                      onPress={() => setRoomFilter(filter)}
                      style={[
                        styles.roomFilterPill,
                        {
                          backgroundColor: active
                            ? theme.blue
                            : theme.dark
                              ? "#162032"
                              : "#E2E8F0",
                          borderColor: active ? theme.blue : theme.borderLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roomFilterPillText,
                          { color: active ? "#FFFFFF" : theme.muted },
                        ]}
                      >
                        {filter}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Lista de Dispositivos de la Estancia (Imagen 4) */}
              {roomFilter === "Dispositivos" ? (
                <View style={styles.devicesSection}>
                  {activeRoomDevices.map((device) => (
                    <ShellyDeviceCard
                      key={device.id}
                      device={device}
                      theme={theme}
                      canControl={canControl}
                      onPress={() => setTelemetryDevice(device)}
                      onToggleState={() => {
                        if (canControl) {
                          setHomeDeviceState(
                            device.id,
                            device.state === "on" ? "off" : "on",
                          );
                        }
                      }}
                    />
                  ))}

                  {activeRoomDevices.length === 0 && (
                    <View
                      style={[
                        styles.emptyRoomCard,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.borderLight,
                        },
                      ]}
                    >
                      <Ionicons
                        name="hardware-chip-outline"
                        size={36}
                        color={theme.muted}
                      />
                      <Text
                        style={[styles.emptyRoomTitle, { color: theme.text }]}
                      >
                        Sin dispositivos en {selectedRoom}
                      </Text>
                      <Text
                        style={[
                          styles.emptyRoomSubtitle,
                          { color: theme.muted },
                        ]}
                      >
                        Agrega un dispositivo Shelly a esta estancia para
                        comenzar.
                      </Text>
                      {canManage && (
                        <Pressable
                          onPress={() => setAddModalVisible(true)}
                          style={[
                            styles.primaryAddBtn,
                            { backgroundColor: theme.blue },
                          ]}
                        >
                          <Ionicons name="add" size={18} color="#FFFFFF" />
                          <Text style={styles.primaryAddBtnText}>
                            Añadir dispositivo
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View
                  style={[
                    styles.emptyRoomCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={34}
                    color={theme.blue}
                  />
                  <Text style={[styles.emptyRoomTitle, { color: theme.text }]}>
                    Módulo de {roomFilter}
                  </Text>
                  <Text
                    style={[styles.emptyRoomSubtitle, { color: theme.muted }]}
                  >
                    Gestiona automatizaciones y grupos para la estancia{" "}
                    {selectedRoom}.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* ============================================================ */
            /* VISTA 2: LISTA DE ESTANCIAS - IMAGEN 5                      */
            /* ============================================================ */
            <View style={styles.estanciasContainer}>
              {/* Encabezado: "Estancias" + Botones +, lápiz, i */}
              <View
                style={[
                  styles.estanciasHeaderCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <View style={styles.estanciasHeaderTop}>
                  <Text style={[styles.estanciasTitle, { color: theme.text }]}>
                    Estancias
                  </Text>

                  <View style={styles.headerBtnGroup}>
                    {canManage && (
                      <Pressable
                        onPress={() => setAddModalVisible(true)}
                        style={[
                          styles.actionSquareBtn,
                          { backgroundColor: theme.blue },
                        ]}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                      </Pressable>
                    )}

                    <Pressable
                      onPress={() => {
                        Alert.alert(
                          "Editar estancias",
                          "Selecciona una estancia para editar su nombre y dispositivos.",
                        );
                      }}
                      style={[
                        styles.actionSquareBtn,
                        { backgroundColor: theme.blue },
                      ]}
                    >
                      <Ionicons name="pencil" size={17} color="#FFFFFF" />
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        Alert.alert(
                          "Estancias Shelly",
                          "Las estancias te permiten agrupar dispositivos inteligentes por habitación y monitorear el consumo de energía en tiempo real.",
                        );
                      }}
                      style={[
                        styles.actionRoundBtn,
                        { backgroundColor: theme.rowAlt },
                      ]}
                    >
                      <Ionicons
                        name="information"
                        size={16}
                        color={theme.text}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Input de Búsqueda con icono de Lupa (Imagen 5) */}
                <View
                  style={[
                    styles.searchInputWrapper,
                    {
                      backgroundColor: theme.dark ? "#0E1829" : theme.rowAlt,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={19}
                    color={theme.muted}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar"
                    placeholderTextColor={theme.muted}
                    style={[styles.searchInput, { color: theme.text }]}
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery("")} hitSlop={6}>
                      <Ionicons
                        name="close-circle"
                        size={17}
                        color={theme.muted}
                      />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Botón de gestión para Administrador */}
              {canManage && (
                <Pressable
                  onPress={() => router.push("/(tabs)/access")}
                  style={[
                    styles.adminAccessBtn,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color={theme.blue}
                  />
                  <Text style={[styles.adminAccessText, { color: theme.blue }]}>
                    Gestionar miembros e invitados
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.blue}
                  />
                </Pressable>
              )}

              {/* Listado de Tarjetas de Estancias en Gradiente Azul (Imagen 5) */}
              <View style={styles.roomsList}>
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.name}
                    name={room.name}
                    power={room.power}
                    onPress={() => setSelectedRoom(room.name)}
                  />
                ))}

                {filteredRooms.length === 0 && (
                  <View
                    style={[
                      styles.emptyRoomCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.borderLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name="search-outline"
                      size={32}
                      color={theme.muted}
                    />
                    <Text
                      style={[styles.emptyRoomTitle, { color: theme.text }]}
                    >
                      No se encontraron estancias
                    </Text>
                    <Text
                      style={[styles.emptyRoomSubtitle, { color: theme.muted }]}
                    >
                      Intenta con otro término de búsqueda.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ============================================================ */}
      {/* MODAL: TELEMETRÍA DETALLADA DEL DISPOSITIVO SHELLY           */}
      {/* ============================================================ */}
      <Modal
        visible={!!telemetryDevice}
        transparent
        animationType="slide"
        onRequestClose={() => setTelemetryDevice(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.telemetryCard, { backgroundColor: theme.card }]}>
            <View style={styles.telemetryHeader}>
              <View style={styles.telemetryTitleGroup}>
                <Text style={[styles.telemetryName, { color: theme.text }]}>
                  {telemetryDevice?.name}
                </Text>
                <Text style={[styles.telemetryRoom, { color: theme.muted }]}>
                  Estancia: {telemetryDevice?.room} · Shelly Plus 1PM
                </Text>
              </View>
              <Pressable onPress={() => setTelemetryDevice(null)} hitSlop={8}>
                <Ionicons
                  name="close-circle-outline"
                  size={26}
                  color={theme.muted}
                />
              </Pressable>
            </View>

            {telemetryDevice && (
              <View style={styles.telemetryGrid}>
                <View
                  style={[
                    styles.telemetryCell,
                    { backgroundColor: theme.rowAlt },
                  ]}
                >
                  <Text style={[styles.telemetryLabel, { color: theme.muted }]}>
                    Potencia
                  </Text>
                  <Text style={[styles.telemetryValue, { color: theme.blue }]}>
                    {telemetryDevice.power} W
                  </Text>
                </View>

                <View
                  style={[
                    styles.telemetryCell,
                    { backgroundColor: theme.rowAlt },
                  ]}
                >
                  <Text style={[styles.telemetryLabel, { color: theme.muted }]}>
                    Energía Acumulada
                  </Text>
                  <Text style={[styles.telemetryValue, { color: theme.text }]}>
                    {(telemetryDevice.energy / 1000).toFixed(2)} kWh
                  </Text>
                </View>

                <View
                  style={[
                    styles.telemetryCell,
                    { backgroundColor: theme.rowAlt },
                  ]}
                >
                  <Text style={[styles.telemetryLabel, { color: theme.muted }]}>
                    Voltaje
                  </Text>
                  <Text style={[styles.telemetryValue, { color: theme.text }]}>
                    {telemetryDevice.voltage} V
                  </Text>
                </View>

                <View
                  style={[
                    styles.telemetryCell,
                    { backgroundColor: theme.rowAlt },
                  ]}
                >
                  <Text style={[styles.telemetryLabel, { color: theme.muted }]}>
                    Corriente
                  </Text>
                  <Text style={[styles.telemetryValue, { color: theme.text }]}>
                    {telemetryDevice.current} A
                  </Text>
                </View>

                <View
                  style={[
                    styles.telemetryCell,
                    { backgroundColor: theme.rowAlt },
                  ]}
                >
                  <Text style={[styles.telemetryLabel, { color: theme.muted }]}>
                    Frecuencia
                  </Text>
                  <Text style={[styles.telemetryValue, { color: theme.text }]}>
                    {telemetryDevice.frequency} Hz
                  </Text>
                </View>

                <View
                  style={[
                    styles.telemetryCell,
                    { backgroundColor: theme.rowAlt },
                  ]}
                >
                  <Text style={[styles.telemetryLabel, { color: theme.muted }]}>
                    Estado Red
                  </Text>
                  <Text
                    style={[
                      styles.telemetryValue,
                      {
                        color: telemetryDevice.online
                          ? theme.success
                          : theme.danger,
                      },
                    ]}
                  >
                    {telemetryDevice.online ? "Conectado" : "Fuera de línea"}
                  </Text>
                </View>
              </View>
            )}

            {telemetryDevice && canControl && (
              <Pressable
                onPress={() => {
                  setHomeDeviceState(
                    telemetryDevice.id,
                    telemetryDevice.state === "on" ? "off" : "on",
                  );
                  setTelemetryDevice((curr) =>
                    curr
                      ? { ...curr, state: curr.state === "on" ? "off" : "on" }
                      : null,
                  );
                }}
                style={[
                  styles.telemetryPowerBtn,
                  {
                    backgroundColor:
                      telemetryDevice.state === "on"
                        ? theme.danger
                        : theme.blue,
                  },
                ]}
              >
                <Ionicons name="power" size={20} color="#FFFFFF" />
                <Text style={styles.telemetryPowerBtnText}>
                  {telemetryDevice.state === "on"
                    ? "Apagar relé"
                    : "Encender relé"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: AÑADIR ESTANCIA O DISPOSITIVO                         */}
      {/* ============================================================ */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.addModalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.addModalTitle, { color: theme.text }]}>
              {selectedRoom
                ? `Nuevo dispositivo en ${selectedRoom}`
                : "Nueva Estancia"}
            </Text>

            {selectedRoom ? (
              <TextInput
                value={newDeviceName}
                onChangeText={setNewDeviceName}
                placeholder="Ej. Shelly Luz Principal"
                placeholderTextColor={theme.muted}
                style={[
                  styles.modalInput,
                  {
                    color: theme.text,
                    borderColor: theme.borderLight,
                    backgroundColor: theme.rowAlt,
                  },
                ]}
              />
            ) : (
              <TextInput
                value={newRoomName}
                onChangeText={setNewRoomName}
                placeholder="Ej. Sala de Estar"
                placeholderTextColor={theme.muted}
                style={[
                  styles.modalInput,
                  {
                    color: theme.text,
                    borderColor: theme.borderLight,
                    backgroundColor: theme.rowAlt,
                  },
                ]}
              />
            )}

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setAddModalVisible(false)}
                style={[
                  styles.modalCancelBtn,
                  { borderColor: theme.borderLight },
                ]}
              >
                <Text style={[styles.modalCancelText, { color: theme.muted }]}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={
                  selectedRoom ? handleCreateDeviceInRoom : handleCreateRoom
                }
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: theme.blue },
                ]}
              >
                <Text style={styles.modalConfirmText}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: "100%",
    alignSelf: "center",
  },
  topTabsScroll: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  subTabItem: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  subTabItemActive: {
    backgroundColor: "rgba(11, 74, 150, 0.2)",
    borderWidth: 1,
  },
  subTabText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  subTabTextActive: {
    color: "#3B82F6",
  },
  estanciasContainer: {
    width: "100%",
  },
  estanciasHeaderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  estanciasHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  estanciasTitle: {
    fontSize: 24,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
  },
  headerBtnGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionSquareBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  actionRoundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
  },
  adminAccessBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  adminAccessText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  roomsList: {
    width: "100%",
  },
  roomDetailContainer: {
    width: "100%",
  },
  roomDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  roomDetailHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  roomBackBtn: {
    padding: 2,
  },
  roomDetailTitle: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
  },
  roomDetailHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roomFiltersRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  roomFilterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  roomFilterPillText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  devicesSection: {
    width: "100%",
  },
  emptyRoomCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  emptyRoomTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    fontFamily: typography.fontFamily.emphasis,
  },
  emptyRoomSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    fontFamily: typography.fontFamily.regular,
  },
  primaryAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  primaryAddBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  telemetryCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },
  telemetryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  telemetryTitleGroup: {
    flex: 1,
  },
  telemetryName: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
  },
  telemetryRoom: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
  },
  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  telemetryCell: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
  },
  telemetryLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
  },
  telemetryValue: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 4,
    fontFamily: typography.fontFamily.emphasis,
  },
  telemetryPowerBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
  },
  telemetryPowerBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  addModalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    padding: 20,
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
    fontFamily: typography.fontFamily.emphasis,
  },
  modalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalConfirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
