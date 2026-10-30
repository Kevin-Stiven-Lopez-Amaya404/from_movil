import { Ionicons } from "@expo/vector-icons";
import { Pressable, Switch, Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

import type { SmartDevice } from "@/lib/domain/device";
import type { AppTheme } from "@/lib/theme/app-theme";
import { styles } from "./ShellyDeviceCard.styles";


type ShellyDeviceCardProps = {
  device: SmartDevice;
  theme: AppTheme;
  canControl: boolean;
  onPress: () => void;
  onMenu: () => void;
  onToggleState: () => void;
};

export function ShellyDeviceCard({
  device,
  theme,
  canControl,
  onPress,
  onMenu,
  onToggleState,
}: ShellyDeviceCardProps) {
  const isOnline = device.online;
  const isOn = device.state === "on";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
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
        {/* Gráfico miniatura auténtico del Shelly 1PM Gen4 (Rojo) */}
        <View style={styles.shellyThumb}>
          <Svg width="52" height="42" viewBox="0 0 52 42">
            {/* Cuerpo rojo del Shelly 1PM Gen4 */}
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
              {device.modelName === 'Shelly 1PM Gen4' ? '1PM GEN4' : 'SHELLY'}
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
            style={[styles.deviceModel, { color: theme.muted }]}
          >
            {device.modelName ?? 'Modelo no identificado'}
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

        <View style={styles.deviceActions}>
          <Switch
            value={isOn}
            onValueChange={onToggleState}
            disabled={!canControl || !isOnline}
            trackColor={{
              false: theme.switchTrackInactive,
              true: theme.switchTrackActive,
            }}
            thumbColor={isOnline && isOn ? "#FFFFFF" : "#F8FAFC"}
          />
          <Pressable
            accessibilityLabel={`Acciones de ${device.name}`}
            onPress={onMenu}
            hitSlop={8}
            style={styles.menuButton}
          >
            <Ionicons name="ellipsis-vertical" size={21} color={theme.muted} />
          </Pressable>
          <Ionicons name="chevron-forward" size={20} color={theme.muted} />
        </View>
      </Pressable>
    </View>
  );
}
