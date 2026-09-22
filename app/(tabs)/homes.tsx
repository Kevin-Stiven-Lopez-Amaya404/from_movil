/**
 * Pantalla de Estancias y Dispositivos.
 *
 * - Vista de Estancias con buscador y tarjetas compactas de consumo actual.
 * - Detalle de Estancia con las vistas Dispositivos y Energía.
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

import { EnergyRealtimeCard } from "@/components/homes/EnergyRealtimeCard";
import { RoomCard } from "@/components/homes/RoomCard";
import { ShellyDeviceCard } from "@/components/homes/ShellyDeviceCard";
import {
    type SmartDevice,
    useSmartHome,
} from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
type RoomFilter = "Dispositivos" | "Energía";

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
    removeDevice,
    updateDevice,
    sessionRole,
    setHomeDeviceState,
  } = useSmartHome();

  const canManage = sessionRole === "admin";
  const canControl = sessionRole !== "invitado";

  // Estados de navegación interna
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
  const [deviceMenu, setDeviceMenu] = useState<SmartDevice | null>(null);
  const [deviceEditor, setDeviceEditor] = useState<"rename" | "move" | null>(
    null,
  );
  const [deviceDraftName, setDeviceDraftName] = useState("");
  const [moveTargetRoom, setMoveTargetRoom] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);
  const [pendingDeviceId, setPendingDeviceId] = useState<string | null>(null);

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
      addDeviceToHome(activeHome.id, clean, selectedRoom ?? undefined);
      Alert.alert(
        "Dispositivo agregado",
        `${clean} ha sido registrado en ${selectedRoom ?? "la estancia"}.`,
      );
    }
    setNewDeviceName("");
    setAddModalVisible(false);
  }

  async function handleDeleteDevice(device: SmartDevice) {
    Alert.alert(
      "Eliminar dispositivo",
      `¿Quieres eliminar ${device.name} de esta estancia?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setOperationLoading(true);
            try {
              await removeDevice(device.id);
              setTelemetryDevice(null);
              Alert.alert(
                "Dispositivo eliminado",
                `${device.name} fue eliminado correctamente.`,
              );
            } catch (error) {
              Alert.alert(
                "No se pudo eliminar",
                error instanceof Error ? error.message : "Intenta nuevamente.",
              );
            } finally {
              setOperationLoading(false);
            }
          },
        },
      ],
    );
  }

  function handleDeviceMenu(device: SmartDevice) {
    setDeviceMenu(device);
  }

  async function handleSaveDeviceEdit() {
    if (!deviceMenu || !deviceEditor) return;
    const value =
      deviceEditor === "rename" ? deviceDraftName.trim() : moveTargetRoom;
    if (!value) {
      Alert.alert(
        "Dato requerido",
        deviceEditor === "rename"
          ? "Escribe un nombre válido."
          : "Selecciona una estancia.",
      );
      return;
    }
    if (deviceEditor === "rename" && (value.length < 2 || value.length > 60)) {
      Alert.alert("Nombre no válido", "Usa entre 2 y 60 caracteres.");
      return;
    }
    setOperationLoading(true);
    try {
      await updateDevice(
        deviceMenu.id,
        deviceEditor === "rename" ? { name: value } : { room: value },
      );
      setDeviceMenu(null);
      setDeviceEditor(null);
    } catch (error) {
      Alert.alert(
        "No se pudo guardar",
        error instanceof Error ? error.message : "Intenta nuevamente.",
      );
    } finally {
      setOperationLoading(false);
    }
  }

  async function handleToggleDevice(device: SmartDevice) {
    if (!canControl || pendingDeviceId) return;
    setPendingDeviceId(device.id);
    try {
      await setHomeDeviceState(device.id, device.state === "on" ? "off" : "on");
    } catch (error) {
      Alert.alert(
        "No se pudo cambiar el estado",
        error instanceof Error ? error.message : "Intenta nuevamente.",
      );
    } finally {
      setPendingDeviceId(null);
    }
  }

  async function handleToggleTelemetryDevice() {
    if (!telemetryDevice || !canControl || pendingDeviceId) return;
    const nextState = telemetryDevice.state === "on" ? "off" : "on";
    setPendingDeviceId(telemetryDevice.id);
    try {
      await setHomeDeviceState(telemetryDevice.id, nextState);
      setTelemetryDevice((current) =>
        current ? { ...current, state: nextState } : null,
      );
    } catch (error) {
      Alert.alert(
        "No se pudo cambiar el estado",
        error instanceof Error ? error.message : "Intenta nuevamente.",
      );
    } finally {
      setPendingDeviceId(null);
    }
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
                  <View style={styles.roomDetailTitleGroup}>
                    <Text
                      numberOfLines={1}
                      style={[styles.roomDetailTitle, { color: theme.text }]}
                    >
                      {selectedRoom}
                    </Text>
                    <Text
                      style={[
                        styles.roomDetailSubtitle,
                        { color: theme.muted },
                      ]}
                    >
                      {activeRoomDevices.length}{" "}
                      {activeRoomDevices.length === 1
                        ? "dispositivo"
                        : "dispositivos"}
                    </Text>
                  </View>
                </View>

                <View style={styles.roomDetailHeaderActions}>
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
                </View>
              </View>

              {/* Únicas vistas disponibles dentro de una estancia */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.roomFiltersRow}
              >
                {(["Dispositivos", "Energía"] as RoomFilter[]).map((filter) => {
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
                  <View
                    style={[
                      styles.deviceSectionHeader,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.borderLight,
                      },
                    ]}
                  >
                    <View style={styles.deviceSectionCopy}>
                      <Text
                        style={[
                          styles.deviceSectionTitle,
                          { color: theme.text },
                        ]}
                      >
                        Dispositivos de la estancia
                      </Text>
                    </View>
                    <View style={styles.deviceSectionActions}>
                      <Pressable
                        accessibilityLabel="Añadir dispositivo"
                        disabled={!canManage}
                        onPress={() => setAddModalVisible(true)}
                        style={[
                          styles.deviceActionButton,
                          { backgroundColor: theme.blue },
                          !canManage && styles.disabledAction,
                        ]}
                      >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.deviceActionText}>Añadir</Text>
                      </Pressable>
                    </View>
                  </View>
                  {activeRoomDevices.map((device) => (
                    <ShellyDeviceCard
                      key={device.id}
                      device={device}
                      theme={theme}
                      canControl={canControl && pendingDeviceId !== device.id}
                      onPress={() => setTelemetryDevice(device)}
                      onMenu={() => handleDeviceMenu(device)}
                      onToggleState={() => void handleToggleDevice(device)}
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
                <View style={styles.energySection}>
                  <EnergyRealtimeCard
                    isOnline={activeRoomDevices.some((device) => device.online)}
                    power={activeRoomDevices
                      .filter(
                        (device) => device.online && device.state === "on",
                      )
                      .reduce((sum, device) => sum + device.power, 0)}
                    theme={theme}
                  />
                  <View
                    style={[
                      styles.deviceSectionHeader,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.borderLight,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.deviceSectionTitle, { color: theme.text }]}
                    >
                      Dispositivos de la estancia
                    </Text>
                    <Text
                      style={[styles.deviceSectionCount, { color: theme.blue }]}
                    >
                      {activeRoomDevices.length}{" "}
                      {activeRoomDevices.length === 1
                        ? "dispositivo"
                        : "dispositivos"}
                    </Text>
                  </View>
                  {activeRoomDevices.map((device) => (
                    <ShellyDeviceCard
                      key={device.id}
                      device={device}
                      theme={theme}
                      canControl={canControl && pendingDeviceId !== device.id}
                      onPress={() => setTelemetryDevice(device)}
                      onMenu={() => handleDeviceMenu(device)}
                      onToggleState={() => void handleToggleDevice(device)}
                    />
                  ))}
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
                  <View style={styles.estanciasHeading}>
                    <Text
                      style={[styles.estanciasTitle, { color: theme.text }]}
                    >
                      Estancias
                    </Text>
                    <Text
                      style={[styles.estanciasSubtitle, { color: theme.muted }]}
                    >
                      {roomsData.length} estancias · {homeDevices.length}{" "}
                      dispositivos
                    </Text>
                  </View>

                  <View style={styles.headerBtnGroup}>
                    {canManage && (
                      <Pressable
                        onPress={() => setAddModalVisible(true)}
                        accessibilityLabel="Añadir estancia"
                        style={[
                          styles.addRoomButton,
                          { backgroundColor: theme.blue },
                        ]}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.addRoomButtonText}>
                          Añadir estancia
                        </Text>
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
                    placeholder="Buscar estancia..."
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

              {/* Listado de tarjetas compactas de estancias */}
              <View style={styles.roomsList}>
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.name}
                    name={room.name}
                    power={room.power}
                    deviceCount={room.devices.length}
                    isActive={room.devices.some(
                      (device) => device.online && device.state === "on",
                    )}
                    onPress={() => {
                      setRoomFilter("Dispositivos");
                      setSelectedRoom(room.name);
                    }}
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
                disabled={pendingDeviceId === telemetryDevice.id}
                onPress={() => void handleToggleTelemetryDevice()}
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

      <Modal
        visible={!!deviceMenu && !deviceEditor}
        transparent
        animationType="fade"
        onRequestClose={() => setDeviceMenu(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.deviceMenuCard, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.addModalTitle, { color: theme.text }]}>
              {deviceMenu?.name}
            </Text>
            <Pressable
              disabled={!canManage || operationLoading}
              onPress={() => {
                setDeviceDraftName(deviceMenu?.name ?? "");
                setDeviceEditor("rename");
              }}
              style={[
                styles.deviceMenuItem,
                !canManage && styles.disabledAction,
              ]}
            >
              <Ionicons name="pencil-outline" size={19} color={theme.blue} />
              <Text style={[styles.deviceMenuText, { color: theme.text }]}>
                Renombrar
              </Text>
            </Pressable>
            <Pressable
              disabled={!canManage || operationLoading}
              onPress={() => {
                setMoveTargetRoom(
                  roomNames.find((room) => room !== deviceMenu?.room) ?? "",
                );
                setDeviceEditor("move");
              }}
              style={[
                styles.deviceMenuItem,
                !canManage && styles.disabledAction,
              ]}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={19}
                color={theme.blue}
              />
              <Text style={[styles.deviceMenuText, { color: theme.text }]}>
                Mover de estancia
              </Text>
            </Pressable>
            <Pressable
              disabled={!canManage || operationLoading}
              onPress={() => {
                setDeviceMenu(null);
                if (deviceMenu) void handleDeleteDevice(deviceMenu);
              }}
              style={[
                styles.deviceMenuItem,
                !canManage && styles.disabledAction,
              ]}
            >
              <Ionicons name="trash-outline" size={19} color={theme.danger} />
              <Text style={[styles.deviceMenuText, { color: theme.danger }]}>
                Eliminar dispositivo
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDeviceMenu(null)}
              style={styles.modalCancelBtn}
            >
              <Text style={[styles.modalCancelText, { color: theme.muted }]}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!deviceEditor && !!deviceMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setDeviceEditor(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.addModalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.addModalTitle, { color: theme.text }]}>
              {deviceEditor === "rename"
                ? "Renombrar dispositivo"
                : "Mover de estancia"}
            </Text>
            {deviceEditor === "rename" ? (
              <TextInput
                value={deviceDraftName}
                onChangeText={setDeviceDraftName}
                autoFocus
                placeholder="Nombre del dispositivo"
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
              <View style={styles.roomChoiceList}>
                {roomNames
                  .filter((room) => room !== deviceMenu?.room)
                  .map((room) => (
                    <Pressable
                      key={room}
                      onPress={() => setMoveTargetRoom(room)}
                      style={[
                        styles.roomChoice,
                        {
                          backgroundColor:
                            moveTargetRoom === room
                              ? theme.blue1
                              : theme.rowAlt,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roomChoiceText,
                          {
                            color:
                              moveTargetRoom === room ? theme.blue : theme.text,
                          },
                        ]}
                      >
                        {room}
                      </Text>
                      {moveTargetRoom === room && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={theme.blue}
                        />
                      )}
                    </Pressable>
                  ))}
              </View>
            )}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setDeviceEditor(null)}
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
                disabled={operationLoading}
                onPress={() => void handleSaveDeviceEdit()}
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: theme.blue },
                  operationLoading && styles.disabledAction,
                ]}
              >
                <Text style={styles.modalConfirmText}>
                  {operationLoading ? "Guardando..." : "Guardar"}
                </Text>
              </Pressable>
            </View>
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
  estanciasHeading: {
    flex: 1,
    minWidth: 0,
  },
  estanciasTitle: {
    fontSize: 24,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
  },
  estanciasSubtitle: {
    fontSize: 13,
    marginTop: 3,
    fontFamily: typography.fontFamily.regular,
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
  addRoomButton: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 4,
    minHeight: 38,
    paddingHorizontal: 11,
  },
  addRoomButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
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
  roomDetailTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  roomBackBtn: {
    padding: 2,
  },
  roomDetailTitle: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
  },
  roomDetailSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
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
  energySection: {
    width: "100%",
  },
  deviceSectionHeader: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  deviceSectionCopy: {
    flex: 1,
    minWidth: 0,
  },
  deviceSectionActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginLeft: 8,
  },
  deviceActionButton: {
    alignItems: "center",
    borderRadius: 9,
    flexDirection: "row",
    gap: 4,
    minHeight: 34,
    paddingHorizontal: 9,
  },
  deactivateButton: {
    borderWidth: 1,
  },
  deviceActionText: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    fontWeight: "700",
  },
  disabledAction: {
    opacity: 0.45,
  },
  deviceSectionTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 17,
    fontWeight: "800",
  },
  deviceSectionCount: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 13,
    fontWeight: "700",
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
  deviceMenuCard: {
    borderRadius: 18,
    padding: 20,
    width: "100%",
    maxWidth: 340,
  },
  deviceMenuItem: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 12,
    minHeight: 46,
    paddingHorizontal: 10,
  },
  deviceMenuText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 15,
    fontWeight: "700",
  },
  roomChoiceList: {
    gap: 8,
    marginBottom: 16,
  },
  roomChoice: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 12,
  },
  roomChoiceText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: "600",
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
