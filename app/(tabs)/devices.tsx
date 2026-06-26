import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { formatCOP } from "@/lib/formatters";
import { useResponsiveLayout } from "@/lib/responsive";
import { DeviceCategory, useSmartHome } from "@/lib/smart-home-context";

const BLUE = "#0864C8";
const TEXT = "#454545";
const LILAC = "#DDDDFB";
const GREEN = "#2AAF5D";
const RED = "#FF3B20";
const MUTED = "#6B7280";

const categories: DeviceCategory[] = ["Electrodomesticos", "Iluminacion", "Climatizacion", "Seguridad"];

export default function DevicesScreen() {
  const layout = useResponsiveLayout();
  const { devices, setDeviceOnline, toggleDevice } = useSmartHome();
  const [activeCategory, setActiveCategory] = useState<DeviceCategory>("Electrodomesticos");
  const [selectedId, setSelectedId] = useState(devices[0]?.id ?? "");
  const filteredDevices = devices.filter((device) => device.category === activeCategory);
  const selectedDevice = devices.find((device) => device.id === selectedId) ?? filteredDevices[0] ?? devices[0];
  const onlineCount = devices.filter((device) => device.online).length;
  const monthlySavings = useMemo(() => {
    const savedKwh = devices.reduce((total, device) => {
      const saved = Math.max(device.yesterday - (device.online ? device.consumption : 0), 0);
      return total + saved;
    }, 0);

    return Math.max(50000, Math.round(savedKwh * 30 * 9500));
  }, [devices]);

  function turnOffCategory() {
    filteredDevices.forEach((device) => setDeviceOnline(device.id, false));
    Alert.alert("Categoria apagada", `Se apagaron los dispositivos de ${activeCategory}.`);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingTop: layout.compact ? 24 : 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
        <View style={styles.savingsCard}>
          <Text style={styles.savingsTitle}>Ahorros mensuales</Text>
          <Text style={[styles.savingsAmount, layout.tiny && styles.savingsAmountTiny]}>
            {formatCOP(monthlySavings)} / mes
          </Text>
          <Text style={styles.savingsText}>{onlineCount} dispositivos conectados</Text>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.segment}
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => {
            const active = activeCategory === category;

            return (
              <Pressable
                key={category}
                style={[styles.segmentItem, active && styles.segmentActive]}
                onPress={() => {
                  setActiveCategory(category);
                  const firstDevice = devices.find((device) => device.category === category);
                  if (firstDevice) setSelectedId(firstDevice.id);
                }}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dispositivos conectados</Text>
          <Text style={styles.sectionMeta}>{filteredDevices.length} items</Text>
        </View>

        <View style={styles.deviceList}>
          {filteredDevices.map((device) => (
            <Pressable
              key={device.id}
              style={[
                styles.deviceCard,
                selectedDevice?.id === device.id && styles.deviceCardSelected,
              ]}
              onPress={() => setSelectedId(device.id)}
            >
              <View style={[styles.deviceIcon, !device.online && styles.deviceIconOff]}>
                <MaterialCommunityIcons
                  name={device.icon as never}
                  size={35}
                  color={device.online ? BLUE : MUTED}
                />
              </View>
              <View style={styles.deviceCopy}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceSubtitle}>
                  {device.room} · {device.online ? `${device.consumption.toFixed(2)} kWh` : "Apagado"}
                </Text>
              </View>
              <Switch
                value={device.online}
                onValueChange={() => toggleDevice(device.id)}
                trackColor={{ false: "#CDD2E4", true: "#BDE8CB" }}
                thumbColor={device.online ? GREEN : "#FFFFFF"}
              />
            </Pressable>
          ))}
        </View>

        {selectedDevice && (
          <View style={styles.detailCard}>
            <View style={styles.detailTop}>
              <Text style={styles.detailTitle}>{selectedDevice.name}</Text>
              <Text style={[styles.statusPill, selectedDevice.online ? styles.statusOn : styles.statusOff]}>
                {selectedDevice.online ? "Encendido" : "Apagado"}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{selectedDevice.consumption.toFixed(2)}</Text>
                <Text style={styles.metricLabel}>kWh hoy</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{selectedDevice.yesterday.toFixed(2)}</Text>
                <Text style={styles.metricLabel}>kWh ayer</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{selectedDevice.room}</Text>
                <Text style={styles.metricLabel}>Ubicacion</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                !selectedDevice.online && styles.powerOnButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={() => toggleDevice(selectedDevice.id)}
            >
              <Ionicons
                name={selectedDevice.online ? "power-outline" : "flash-outline"}
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>
                {selectedDevice.online ? "Apagar" : "Encender"}
              </Text>
            </Pressable>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.offButton, pressed && styles.offButtonPressed]}
          onPress={turnOffCategory}
        >
          <Text style={styles.offButtonText}>Apagar categoría</Text>
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
    paddingBottom: 120,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  savingsCard: {
    backgroundColor: BLUE,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 17,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    elevation: 8,
    width: "100%",
  },
  savingsTitle: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  savingsAmount: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 13,
  },
  savingsAmountTiny: {
    fontSize: 24,
  },
  savingsText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 20,
  },
  segment: {
    gap: 8,
    paddingHorizontal: 2,
    paddingTop: 28,
  },
  segmentItem: {
    alignItems: "center",
    backgroundColor: LILAC,
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    paddingHorizontal: 13,
  },
  segmentActive: {
    backgroundColor: BLUE,
  },
  segmentText: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 23,
  },
  sectionTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionMeta: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
  },
  deviceList: {
    alignSelf: "stretch",
    gap: 12,
    marginTop: 13,
  },
  deviceCard: {
    alignItems: "center",
    backgroundColor: "#FBFBFD",
    borderRadius: 12,
    flexDirection: "row",
    minHeight: 76,
    paddingHorizontal: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 5,
  },
  deviceCardSelected: {
    borderColor: BLUE,
    borderWidth: 1.5,
  },
  deviceIcon: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  deviceIconOff: {
    backgroundColor: "#ECEFF5",
  },
  deviceCopy: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },
  deviceName: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  deviceSubtitle: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  detailCard: {
    alignSelf: "stretch",
    backgroundColor: LILAC,
    borderRadius: 14,
    marginTop: 18,
    padding: 14,
  },
  detailTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailTitle: {
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "800",
  },
  statusPill: {
    borderRadius: 8,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusOn: {
    backgroundColor: "#D7FFE1",
    color: GREEN,
  },
  statusOff: {
    backgroundColor: "#FFE7E2",
    color: RED,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  metric: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flex: 1,
    minWidth: 82,
    minHeight: 64,
    padding: 8,
  },
  metricValue: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
  },
  metricLabel: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: RED,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    height: 46,
    justifyContent: "center",
    marginTop: 16,
    width: 178,
  },
  powerOnButton: {
    backgroundColor: GREEN,
  },
  primaryButtonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  offButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 15,
    height: 50,
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 20,
  },
  offButtonPressed: {
    backgroundColor: "#004FA5",
  },
  offButtonText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "800",
  },
});
