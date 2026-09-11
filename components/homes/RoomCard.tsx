import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { typography } from "@/lib/theme/typography";
import { formatWatts } from "@/lib/utils/formatters";

type RoomCardProps = {
  name: string;
  power: number;
  deviceCount?: number;
  onPress: () => void;
};

export function RoomCard({ name, power, onPress }: RoomCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir estancia ${name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.card}>
        {/* Fondo con Gradiente Azul idéntico a Shelly */}
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#0B3C78" stopOpacity="1" />
              <Stop offset="50%" stopColor="#1256A0" stopOpacity="1" />
              <Stop offset="100%" stopColor="#1E78D6" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx="18" fill="url(#blueGrad)" />
        </Svg>

        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.roomName}>
            {name}
          </Text>

          <View style={styles.powerBadge}>
            <Ionicons name="flash" size={14} color="#FFFFFF" />
            <Text style={styles.powerText}>{formatWatts(power)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  card: {
    height: 148,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  content: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
  },
  roomName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
    letterSpacing: 0.3,
  },
  powerBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 25, 47, 0.65)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  powerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
});
