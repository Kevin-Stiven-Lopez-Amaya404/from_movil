import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { formatWatts } from "@/lib/utils/formatters";

type Props = {
  name: string;
  power: number;
  deviceCount: number;
  onPress: () => void;
};

export function HomeSummaryCard({ name, power, deviceCount, onPress }: Props) {
  const theme = useAppTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.blue}15` }]}>
            <Ionicons name="home-outline" size={22} color={theme.blue} />
          </View>
          <View>
            <Text style={[styles.name, { color: theme.text }]}>
              {name}
            </Text>
            <Text style={[styles.detail, { color: theme.muted }]}>
              {deviceCount} dispositivo{deviceCount !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
        <View style={styles.rightContent}>
          <View style={[styles.powerBadge, { backgroundColor: theme.rowAlt }]}>
            <Text style={[styles.powerText, { color: theme.text }]}>
              {formatWatts(power)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.muted} />
        </View>
      </View>
    </Pressable>
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
  pressed: {
    opacity: 0.7,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.semibold,
  },
  detail: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.helper,
    marginTop: 1,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  powerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  powerText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.helper,
    fontWeight: typography.weight.semibold,
  },
});