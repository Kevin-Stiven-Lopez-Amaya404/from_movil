import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { profileFont, profileTheme } from "./profileTheme";

type ProfileMenuItemProps = {
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  intent?: "default" | "danger" | "primary";
  onPress: () => void;
  title: string;
  variant?: "plain" | "boxed";
};

export function ProfileMenuItem({
  description,
  icon,
  intent = "default",
  onPress,
  title,
  variant = "plain",
}: ProfileMenuItemProps) {
  const iconColor =
    intent === "danger" ? profileTheme.danger : intent === "primary" ? profileTheme.blue : profileTheme.text;

  return (
    <Pressable
      style={({ pressed }) => [
        variant === "boxed" ? styles.boxedRow : styles.plainRow,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={variant === "boxed" ? 28 : 25} color={iconColor} />
      <View style={styles.copy}>
        <Text style={[styles.title, intent === "danger" && styles.dangerText]}>{title}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boxedRow: {
    alignItems: "center",
    backgroundColor: profileTheme.row,
    borderColor: profileTheme.divider,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 4,
    marginVertical: 5,
    minHeight: 62,
    paddingHorizontal: 10,
  },
  copy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  dangerText: {
    color: profileTheme.danger,
  },
  description: {
    color: profileTheme.muted,
    fontFamily: profileFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  plainRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    minHeight: 54,
    paddingHorizontal: 10,
  },
  pressed: {
    opacity: 0.72,
  },
  title: {
    color: profileTheme.text,
    fontFamily: profileFont,
    fontSize: 16,
    fontWeight: "800",
  },
});
