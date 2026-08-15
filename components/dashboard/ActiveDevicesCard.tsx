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

export function ActiveDevicesCard({ devices, onDevicePress, onViewAll }: Props) {
  const theme = useAppTheme();
  const active = devices.filter(d => d.online && d.state === "on" && d.power > 0);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Dispositivos activos
        </Text>
        <Pressable onPress={onViewAll}>
          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>Ver ›</Text>
        </Pressable>
      </View>

      {active.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.muted }]}>
          No hay dispositivos activos
        </Text>
      ) : (
        <FlatList
          data={active}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.deviceItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => onDevicePress(item.id)}
            >
              <View style={styles.deviceInfo}>
                <Text style={[styles.deviceName, { color: theme.colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.devicePower, { color: theme.colors.muted }]}>
                  {formatWatts(item.power)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: theme.colors.success }]}>
                <Text style={styles.statusText}>ON</Text>
              </View>
            </Pressable>
          )}
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
    marginBottom: 12,
  },
  title: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    fontWeight: "500",
  },
  devicePower: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    fontWeight: "700",
  },
});