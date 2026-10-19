import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";

import { formatWatts } from "@/lib/utils/formatters";
import { styles } from "./HomeSummaryCard.styles";

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
