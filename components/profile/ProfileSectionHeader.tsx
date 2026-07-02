import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { profileFont, profileTheme } from "./profileTheme";

type ProfileSectionHeaderProps = {
  danger?: boolean;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
};

export function ProfileSectionHeader({ danger = false, description, icon, title }: ProfileSectionHeaderProps) {
  return (
    <View style={styles.header}>
      <Ionicons name={icon} size={22} color={danger ? profileTheme.danger : profileTheme.blue} />
      <View style={styles.copy}>
        <Text style={[styles.title, danger && styles.dangerTitle]}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
  },
  dangerTitle: {
    color: profileTheme.danger,
  },
  description: {
    color: profileTheme.muted,
    fontFamily: profileFont,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  title: {
    color: profileTheme.text,
    fontFamily: profileFont,
    fontSize: 17,
    fontWeight: "800",
  },
});
