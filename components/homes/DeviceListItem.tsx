import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Switch, Text, View } from "react-native";

import {
  getDeviceConnectivityState,
  isDeviceConfirmedOnline,
} from "@/lib/domain/device";
import type { SmartDevice } from "@/lib/domain/device";
import type { AppTheme } from "@/lib/theme/app-theme";
import { styles } from "./DeviceListItem.styles";


type DeviceListItemProps = {
  device: SmartDevice;
  hasAlert: boolean;
  selected: boolean;
  canControl: boolean;
  theme: AppTheme;
  onSelect: () => void;
  onToggleState: () => void;
};

export function DeviceListItem({
  device,
  hasAlert,
  selected,
  canControl,
  theme,
  onSelect,
  onToggleState,
}: DeviceListItemProps) {
  const isConfirmedOnline = isDeviceConfirmedOnline(device);
  const connectivityState = getDeviceConnectivityState(device);

  return (
    <View
      style={[
        styles.deviceCard,
        {
          backgroundColor: theme.row,
          borderColor: hasAlert ? theme.danger : theme.borderLight,
          borderWidth: hasAlert ? 1 : 0,
          shadowColor: theme.shadowColor,
        },
        selected && { borderColor: theme.blue, borderWidth: 1.5 },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Seleccionar ${device.name}`}
        onPress={onSelect}
        style={({ pressed }) => [
          styles.deviceContent,
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.itemIcon,
            { backgroundColor: theme.rowAlt },
            !isConfirmedOnline && styles.itemIconOff,
          ]}
        >
          <MaterialCommunityIcons
            name={device.icon as never}
            size={35}
            color={isConfirmedOnline ? theme.blue : theme.muted}
          />
        </View>

        <View style={styles.itemCopy}>
          <View style={styles.deviceTitleRow}>
            <Text
              numberOfLines={1}
              style={[styles.itemTitle, { color: theme.text }]}
            >
              {device.name}
            </Text>

            {hasAlert && (
              <Ionicons name="warning-outline" size={17} color={theme.danger} />
            )}
          </View>

          <Text style={[styles.itemSubtitle, { color: theme.muted }]}>
            {connectivityState === "ONLINE"
              ? `${(device.energy / 1000).toFixed(2)} kWh acumulados`
              : connectivityState === "OFFLINE"
                ? "Sin conexión"
                : "Estado desconocido"}
          </Text>

          {hasAlert && (
            <Text style={[styles.deviceAlertText, { color: theme.danger }]}>
              {device.critical ? "Requiere atención" : "Sin conexión"}
            </Text>
          )}
        </View>
      </Pressable>

      <Switch
        value={device.state === "on"}
        onValueChange={onToggleState}
        disabled={!canControl || !isConfirmedOnline}
        accessibilityLabel={`Encender o apagar ${device.name}`}
        accessibilityHint={
          !isConfirmedOnline
            ? connectivityState === "OFFLINE"
              ? "El dispositivo está sin conexión."
              : "La conexión del dispositivo no está confirmada."
            : !canControl
              ? "Tu rol no permite controlar este dispositivo."
              : "Cambia el estado del relé."
        }
        accessibilityState={{
          checked: device.state === "on",
          disabled: !canControl || !isConfirmedOnline,
        }}
        trackColor={{
          false: theme.deviceSwitchTrackInactive,
          true: theme.deviceSwitchTrackActive,
        }}
        thumbColor={isConfirmedOnline ? theme.deviceSwitchThumbActive : theme.surface}
      />
    </View>
  );
}
