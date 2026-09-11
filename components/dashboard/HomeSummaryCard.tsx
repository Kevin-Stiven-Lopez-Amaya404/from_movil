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
      accessibilityRole="button"
      accessibilityLabel={`Abrir hogar ${name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.rowAlt,
            },
          ]}
        >
          <Ionicons name="home-outline" size={22} color={theme.blue} />
        </View>

        <View style={styles.info}>
          <Text
            numberOfLines={1}
            style={[
              styles.name,
              {
                color: theme.text,
              },
            ]}
          >
            {name}
          </Text>

          <Text
            style={[
              styles.devices,
              {
                color: theme.muted,
              },
            ]}
          >
            {deviceCount} {deviceCount === 1 ? "dispositivo" : "dispositivos"}
          </Text>
        </View>

        <View style={styles.right}>
          <View
            style={[
              styles.powerContainer,
              {
                backgroundColor: theme.rowAlt,
              },
            ]}
          >
            <Ionicons name="flash-outline" size={14} color={theme.blue} />

            <Text
              style={[
                styles.power,
                {
                  color: theme.text,
                },
              ]}
            >
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
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },

  pressed: {
    opacity: 0.7,
  },

  content: {
    alignItems: "center",
    flexDirection: "row",
  },

  iconContainer: {
    alignItems: "center",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  info: {
    flex: 1,
    marginHorizontal: 12,
    minWidth: 0,
  },

  name: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },

  devices: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 3,
  },

  right: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },

  powerContainer: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  power: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    fontWeight: typography.weight.bold,
  },
});
