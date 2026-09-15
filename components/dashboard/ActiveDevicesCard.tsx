import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SmartDevice } from "@/lib/context/smart-home-context";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { formatWatts } from "@/lib/utils/formatters";

type Props = {
  devices: SmartDevice[];
  onDevicePress: (deviceId: string) => void;
  onViewAll: () => void;
};

const categoryMap: Record<
  string,
  {
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  Iluminacion: {
    icon: "bulb-outline",
  },
  Climatizacion: {
    icon: "snow-outline",
  },
  Electrodomesticos: {
    icon: "tv-outline",
  },
  Seguridad: {
    icon: "shield-checkmark-outline",
  },
};

export function ActiveDevicesCard({
  devices,
  onDevicePress,
  onViewAll,
}: Props) {
  const theme = useAppTheme();

  const active = devices
    .filter(
      (device) => device.online && device.state === "on" && device.power > 0,
    )
    .slice(0, 4);

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
      <View style={styles.header}>
        <View>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Dispositivos activos
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.muted,
              },
            ]}
          >
            {active.length} funcionando ahora
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onViewAll}
          style={({ pressed }) => [
            styles.viewButton,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.viewText,
              {
                color: theme.blue,
              },
            ]}
          >
            Ver todo
          </Text>

          <Ionicons name="chevron-forward" size={16} color={theme.blue} />
        </Pressable>
      </View>

      {active.length === 0 ? (
        <View style={styles.empty}>
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor: theme.rowAlt,
              },
            ]}
          >
            <Ionicons name="power-outline" size={24} color={theme.muted} />
          </View>

          <Text
            style={[
              styles.emptyText,
              {
                color: theme.muted,
              },
            ]}
          >
            No hay dispositivos activos
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {active.map((device, index) => {
            const category = categoryMap[device.category];

            const icon = category?.icon ?? "power-outline";

            return (
              <Pressable
                key={device.id}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${device.name}`}
                onPress={() => onDevicePress(device.id)}
                style={({ pressed }) => [
                  styles.device,
                  index < active.length - 1 && {
                    borderBottomColor: theme.borderLight,
                    borderBottomWidth: 1,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.deviceIcon,
                    {
                      backgroundColor: theme.rowAlt,
                    },
                  ]}
                >
                  <Ionicons name={icon} size={19} color={theme.blue} />
                </View>

                <View style={styles.deviceInfo}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.deviceName,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {device.name}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.deviceRoom,
                      {
                        color: theme.muted,
                      },
                    ]}
                  >
                    {device.room}
                  </Text>
                </View>

                <View style={styles.deviceRight}>
                  <View
                    style={[
                      styles.activeDot,
                      {
                        backgroundColor: theme.success,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.power,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {formatWatts(device.power)}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.muted}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 19,
    fontWeight: typography.weight.bold,
  },

  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 3,
  },

  viewButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    paddingVertical: 5,
  },

  viewText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: typography.weight.bold,
  },

  list: {
    width: "100%",
  },

  device: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 68,
    paddingVertical: 9,
  },

  deviceIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  deviceInfo: {
    flex: 1,
    marginHorizontal: 10,
    minWidth: 0,
  },

  deviceName: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: typography.weight.bold,
  },

  deviceRoom: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    marginTop: 2,
  },

  deviceRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },

  activeDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },

  power: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: typography.weight.bold,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 24,
  },

  emptyIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    marginTop: 8,
  },

  pressed: {
    opacity: 0.7,
  },
});
