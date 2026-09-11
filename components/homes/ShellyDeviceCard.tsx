import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

import type { SmartDevice } from "@/lib/context/smart-home-context";
import type { AppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type ShellyDeviceCardProps = {
  device: SmartDevice;
  theme: AppTheme;
  canControl: boolean;
  onPress: () => void;
  onToggleState: () => void;
};

const GREEN = "#2AAF5D";

export function ShellyDeviceCard({
  device,
  theme,
  canControl,
  onPress,
  onToggleState,
}: ShellyDeviceCardProps) {
  const isOnline = device.online;
  const isOn = device.state === "on";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.dark ? "#172033" : "#FFFFFF",
          borderColor: theme.borderLight,
        },
      ]}
    >
      {/* Barra superior de iconos (Compartir, Nube, Sincronización) */}
      <View style={styles.topStatusRow}>
        <View style={styles.iconGroup}>
          <Ionicons
            name="share-social-outline"
            size={13}
            color={theme.muted}
            style={styles.statusIcon}
          />
          <Ionicons
            name={isOnline ? "cloud-done-outline" : "cloud-offline-outline"}
            size={13}
            color={isOnline ? theme.blue : theme.muted}
            style={styles.statusIcon}
          />
          <Ionicons
            name="sync-outline"
            size={13}
            color={theme.muted}
            style={styles.statusIcon}
          />
        </View>

        {device.critical && (
          <View style={styles.criticalBadge}>
            <Ionicons name="warning" size={11} color={theme.danger} />
            <Text style={[styles.criticalText, { color: theme.danger }]}>
              Atención
            </Text>
          </View>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={styles.body}
      >
        {/* Gráfico miniatura auténtico del Shelly Plus 1PM (Rojo) */}
        <View style={styles.shellyThumb}>
          <Svg width="52" height="42" viewBox="0 0 52 42">
            {/* Cuerpo rojo del Shelly Plus 1PM */}
            <Rect
              x="2"
              y="6"
              width="48"
              height="34"
              rx="4"
              fill={isOnline ? "#C62828" : "#5A3030"}
              stroke="#B71C1C"
              strokeWidth="1"
            />
            {/* Bornes de conexión superiores */}
            <Rect x="6" y="1" width="7" height="6" rx="1" fill="#78909C" />
            <Rect x="15" y="1" width="7" height="6" rx="1" fill="#78909C" />
            <Rect x="24" y="1" width="7" height="6" rx="1" fill="#78909C" />
            <Rect x="33" y="1" width="7" height="6" rx="1" fill="#78909C" />
            <Rect x="41" y="1" width="5" height="6" rx="1" fill="#78909C" />
            {/* Texto Shelly en miniatura */}
            <SvgText
              x="26"
              y="22"
              fontSize="6.5"
              fontWeight="bold"
              fill="#FFFFFF"
              textAnchor="middle"
            >
              Shelly
            </SvgText>
            <SvgText
              x="26"
              y="30"
              fontSize="5"
              fill="#FFCDD2"
              textAnchor="middle"
            >
              PLUS 1PM
            </SvgText>
          </Svg>
        </View>

        {/* Información del dispositivo */}
        <View style={styles.info}>
          <Text
            numberOfLines={1}
            style={[styles.deviceName, { color: theme.text }]}
          >
            {device.name}
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.deviceStatus,
              {
                color: isOnline
                  ? isOn
                    ? theme.success
                    : theme.muted
                  : "#8E99A8",
              },
            ]}
          >
            {isOnline
              ? `${isOn ? "Encendido" : "Apagado"} · ${device.power} W`
              : "El dispositivo está fuera de línea"}
          </Text>
        </View>

        {/* Switch de control */}
        <Switch
          value={isOn}
          onValueChange={onToggleState}
          disabled={!canControl || !isOnline}
          trackColor={{
            false: "#3A4556",
            true: "#2A7C4F",
          }}
          thumbColor={isOnline && isOn ? GREEN : "#E0E0E0"}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  topStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusIcon: {
    opacity: 0.8,
  },
  criticalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  criticalText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
  },
  shellyThumb: {
    width: 52,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  deviceStatus: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
  },
});
