import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import { profileFont, profileTheme } from "./profileTheme";

type ProfileModuleProps = PropsWithChildren<{
  subtitle?: string;
  title: string;
}>;

export function ProfileModule({ children, subtitle, title }: ProfileModuleProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: profileTheme.card,
    borderRadius: 16,
    gap: 12,
    marginTop: 20,
    padding: 14,
  },
  title: {
    color: profileTheme.text,
    fontFamily: profileFont,
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    color: profileTheme.muted,
    fontFamily: profileFont,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: -6,
  },
});
