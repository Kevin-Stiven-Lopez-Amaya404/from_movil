import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { profileFont } from "./profileTheme";

type ProfileShortcutCardProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
  onPress: () => void;
};

export function ProfileShortcutCard({
  icon,
  title,
  description,
  onPress,
}: ProfileShortcutCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
        },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.rowAlt,
          },
        ]}
      >
        <Ionicons name={icon} size={24} color={theme.blue} />
      </View>

      <Text
        style={[
          styles.title,
          {
            color: theme.text,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          {
            color: theme.muted,
          },
        ]}
      >
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 132,
    padding: 14,
    width: "48%",
  },

  iconContainer: {
    alignItems: "center",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  title: {
    fontFamily: profileFont,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 12,
  },

  description: {
    fontFamily: profileFont,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
