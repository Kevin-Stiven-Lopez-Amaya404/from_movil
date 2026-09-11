import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import type { SmartDevice } from "@/lib/context/smart-home-context";
import type { AppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type DeviceListItemProps = {
  device: SmartDevice;
  hasAlert: boolean;
  selected: boolean;
  canControl: boolean;
  theme: AppTheme;
  onSelect: () => void;
  onToggleState: () => void;
};

const GREEN = "#2AAF5D";

export function DeviceListItem({
  device,
  hasAlert,
  selected,
  canControl,
  theme,
  onSelect,
  onToggleState,
}: DeviceListItemProps) {
  return (
    <View
      style={[
        styles.deviceCard,
        {
          backgroundColor: theme.row,
          borderColor: hasAlert ? theme.danger : theme.borderLight,
          borderWidth: hasAlert ? 1 : 0,
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
            !device.online && styles.itemIconOff,
          ]}
        >
          <MaterialCommunityIcons
            name={device.icon as never}
            size={35}
            color={device.online ? theme.blue : theme.muted}
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
            {device.room} ·{" "}
            {device.online
              ? `${(device.energy / 1000).toFixed(2)} kWh hoy`
              : "Sin conexión"}
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
        disabled={!canControl || !device.online}
        accessibilityLabel={`Encender o apagar ${device.name}`}
        trackColor={{
          false: "#CDD2E4",
          true: "#BDE8CB",
        }}
        thumbColor={device.online ? GREEN : "#FFFFFF"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  deviceCard: {
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  deviceContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  itemIconOff: {
    opacity: 0.5,
  },
  itemCopy: {
    flex: 1,
    marginLeft: 12,
  },
  deviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },
  itemSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    marginTop: 2,
  },
  deviceAlertText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    marginTop: 3,
    fontWeight: typography.weight.bold,
  },
});
