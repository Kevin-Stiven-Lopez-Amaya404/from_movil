import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "@/lib/theme/typography";
import { formatWatts } from "@/lib/utils/formatters";

type RoomCardProps = {
  name: string;
  power: number;
  deviceCount: number;
  isActive: boolean;
  onPress: () => void;
};

function getRoomIcon(name: string) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("habit") || normalizedName.includes("dorm")) {
    return "bed-king-outline" as const;
  }

  if (normalizedName.includes("stiven") || normalizedName.includes("estudio")) {
    return "monitor" as const;
  }

  return "sofa-single-outline" as const;
}

export function RoomCard({
  name,
  power,
  deviceCount,
  isActive,
  onPress,
}: RoomCardProps) {
  const iconName = getRoomIcon(name);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir estancia ${name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.card}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isActive ? "#E0F7EA" : "#EEF2F7" },
          ]}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={27}
            color={isActive ? "#16A34A" : "#64748B"}
          />
        </View>

        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.roomName}>
            {name}
          </Text>
          <Text style={styles.deviceCount}>
            {deviceCount} {deviceCount === 1 ? "dispositivo" : "dispositivos"}
          </Text>
          <View style={styles.powerRow}>
            <Ionicons name="flash" size={19} color="#1264E5" />
            <Text style={styles.powerText}>{formatWatts(power)}</Text>
          </View>
        </View>

        <View style={styles.trailingContent}>
          <View
            style={[
              styles.status,
              { backgroundColor: isActive ? "#E0F7EA" : "#EEF2F7" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isActive ? "#16A34A" : "#94A3B8" },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isActive ? "#16803D" : "#64748B" },
              ]}
            >
              {isActive ? "Activa" : "Inactiva"}
            </Text>
          </View>
          <View style={styles.chevron}>
            <Ionicons name="chevron-forward" size={17} color="#64748B" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  card: {
    minHeight: 132,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  content: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  roomName: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
  },
  deviceCount: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
    fontFamily: typography.fontFamily.regular,
  },
  powerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    gap: 5,
  },
  powerText: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
  },
  trailingContent: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 92,
    marginLeft: 8,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
});
