import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { SmartDevice } from "@/lib/context/smart-home-context";
import { formatWatts } from "@/lib/utils/formatters";

type Props = {
  devices: SmartDevice[];
  onDevicePress: (deviceId: string) => void;
  onViewAll: () => void;
};

// Mapeo de categorías a iconos y colores
const categoryMap: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  Iluminacion: { icon: "bulb-outline", color: "#FBBF24" },
  Climatizacion: { icon: "snow-outline", color: "#60A5FA" },
  Electrodomesticos: { icon: "tv-outline", color: "#34D399" },
  Seguridad: { icon: "shield-checkmark-outline", color: "#F87171" },
  default: { icon: "power-outline", color: "#9CA3AF" },
};

export function ActiveDevicesCard({ devices, onDevicePress, onViewAll }: Props) {
  const theme = useAppTheme();
  const active = devices.filter(d => d.online && d.state === "on" && d.power > 0);

  const getCategoryInfo = (category: string) => {
    return categoryMap[category] || categoryMap.default;
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          📱 Dispositivos Activos
        </Text>
        <Pressable onPress={onViewAll}>
          <Text style={[styles.seeAll, { color: theme.blue }]}>Ver todo ›</Text>
        </Pressable>
      </View>

      {active.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="power-outline" size={40} color={theme.muted} />
          <Text style={[styles.empty, { color: theme.muted }]}>
            No hay dispositivos activos
          </Text>
        </View>
      ) : (
        <FlatList
          data={active}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const categoryInfo = getCategoryInfo(item.category);
            return (
              <Pressable
                style={[styles.deviceItem, { borderBottomColor: theme.border }]}
                onPress={() => onDevicePress(item.id)}
              >
                <View style={styles.deviceLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: `${categoryInfo.color}20` }]}>
                    <Ionicons name={categoryInfo.icon} size={20} color={categoryInfo.color} />
                  </View>
                  <View>
                    <Text style={[styles.deviceName, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.deviceRoom, { color: theme.muted }]}>
                      {item.room}
                    </Text>
                  </View>
                </View>
                <View style={styles.deviceRight}>
                  <View style={[styles.statusBadge, { backgroundColor: theme.success }]}>
                    <Text style={styles.statusText}>ON</Text>
                  </View>
                  <Text style={[styles.devicePower, { color: theme.text }]}>
                    {formatWatts(item.power)}
                  </Text>
                </View>
              </Pressable>
            );
          }}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.section,
    fontWeight: typography.weight.semibold,
  },
  seeAll: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  empty: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  deviceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deviceName: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
  },
  deviceRoom: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.caption,
    marginTop: 1,
  },
  deviceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },
  devicePower: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    minWidth: 50,
    textAlign: "right",
  },
});