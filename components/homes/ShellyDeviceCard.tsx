import { Ionicons } from "@expo/vector-icons";
import { Pressable, Switch, Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

import { getDeviceConnectivityState } from "@/lib/domain/device";
import type { SmartDevice } from "@/lib/domain/device";
import type { AppTheme } from "@/lib/theme/app-theme";
import { styles } from "./ShellyDeviceCard.styles";


type ShellyDeviceCardProps = {
  device: SmartDevice;
  theme: AppTheme;
  canControl: boolean;
  canManage: boolean;
  isPending: boolean;
  onPress: () => void;
  onMenu: () => void;
  onToggleState: () => void;
};

export function ShellyDeviceCard({
  device,
  theme,
  canControl,
  canManage,
  isPending,
  onPress,
  onMenu,
  onToggleState,
}: ShellyDeviceCardProps) {
  const connectivityState = getDeviceConnectivityState(device);
  const isConfirmedOnline = connectivityState === "ONLINE";
  const isConfirmedOffline = connectivityState === "OFFLINE";
  const isOn = device.state === "on";
  const connectionLabel = isConfirmedOnline
    ? "Conectado"
    : isConfirmedOffline
      ? "Sin conexión"
      : "Estado sin confirmar";
  const connectionIcon = isConfirmedOnline
    ? "cloud-done-outline"
    : isConfirmedOffline
      ? "cloud-offline-outline"
      : "cloud-outline";
  const connectionColor = isConfirmedOnline
    ? theme.success
    : isConfirmedOffline
      ? theme.warning
      : theme.muted;
  const relayLabel = isConfirmedOnline
    ? `${connectionLabel} · ${isOn ? "Encendido" : "Apagado"} · ${device.power} W`
    : `${connectionLabel} · Último estado del relé: ${isOn ? "Encendido" : "Apagado"}`;
  const relayColor = isConfirmedOnline
    ? isOn
      ? theme.success
      : theme.muted
    : connectionColor;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
          shadowColor: theme.shadowColor,
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
            accessible={false}
          />
          <Ionicons
            name={connectionIcon}
            size={13}
            color={connectionColor}
            style={styles.statusIcon}
            accessible={false}
          />
          <Ionicons
            name="sync-outline"
            size={13}
            color={theme.muted}
            style={styles.statusIcon}
            accessible={false}
          />
        </View>

        <View style={styles.topStatusActions}>
          {device.critical && (
            <View style={styles.criticalBadge}>
              <Ionicons
                name="warning"
                size={11}
                color={theme.danger}
                accessible={false}
              />
              <Text style={[styles.criticalText, { color: theme.danger }]}>
                Atención
              </Text>
            </View>
          )}
          {canManage ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Acciones de ${device.name}`}
              onPress={onMenu}
              style={styles.menuButton}
            >
              <Ionicons name="ellipsis-vertical" size={21} color={theme.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.body}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver detalles de ${device.name}, ${connectionLabel}, relé ${isOn ? "encendido" : "apagado"}`}
          accessibilityHint="Muestra las mediciones y el estado del dispositivo"
          onPress={onPress}
          style={styles.bodyContent}
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
              fill={isConfirmedOnline ? theme.danger : theme.dangerSoft}
              stroke={theme.danger}
              strokeWidth="1"
            />
            {/* Bornes de conexión superiores */}
            <Rect x="6" y="1" width="7" height="6" rx="1" fill={theme.muted} />
            <Rect x="15" y="1" width="7" height="6" rx="1" fill={theme.muted} />
            <Rect x="24" y="1" width="7" height="6" rx="1" fill={theme.muted} />
            <Rect x="33" y="1" width="7" height="6" rx="1" fill={theme.muted} />
            <Rect x="41" y="1" width="5" height="6" rx="1" fill={theme.muted} />
            {/* Texto Shelly en miniatura */}
            <SvgText
              x="26"
              y="22"
              fontSize="6.5"
              fontWeight="bold"
              fill={theme.onDanger}
              textAnchor="middle"
            >
              Shelly
            </SvgText>
            <SvgText
              x="26"
              y="30"
              fontSize="5"
              fill={theme.dangerSoft}
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
            style={[
              styles.deviceStatus,
              {
                color: relayColor,
              },
            ]}
          >
            {relayLabel}
          </Text>
        </View>
        </Pressable>

        <View style={styles.deviceActions}>
          <Switch
            value={isOn}
            onValueChange={onToggleState}
            accessibilityLabel={`Control de ${device.name}`}
            accessibilityHint={
              !isConfirmedOnline
                ? isConfirmedOffline
                  ? "El dispositivo está sin conexión."
                  : "La conexión del dispositivo no está confirmada."
                : !canControl
                  ? "Tu rol no permite controlar este dispositivo"
                  : isPending
                    ? "Espera a que termine la operación actual"
                    : undefined
            }
            accessibilityState={{
              checked: isOn,
              disabled: !canControl || !isConfirmedOnline || isPending,
            }}
            disabled={!canControl || !isConfirmedOnline || isPending}
            trackColor={{
              false: theme.switchTrackInactive,
              true: theme.switchTrackActive,
            }}
            thumbColor={isConfirmedOnline && isOn ? theme.onPrimary : theme.surfaceSecondary}
          />
          <Ionicons name="chevron-forward" size={20} color={theme.muted} accessible={false} />
        </View>
      </View>
    </View>
  );
}
