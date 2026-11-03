import type { ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";
import type { Href } from "expo-router";
import { BackButton } from "@/components/common/BackButton";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type Props = {
  title: string;
  fallbackHref: Href;
  subtitle?: string;
  action?: ReactNode;
  onBack?: () => void;
  accessibilityLabel?: string;
  backBackgroundColor?: string;
  disabled?: boolean;
  titleSize?: keyof typeof typography.size;
};

/** Encabezado de pantalla con navegación de salida y acción opcional. */
export function ScreenHeader({
  title,
  fallbackHref,
  subtitle,
  action,
  onBack,
  accessibilityLabel,
  backBackgroundColor,
  disabled = false,
  titleSize = "title",
}: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <BackButton
        accessibilityLabel={accessibilityLabel ?? "Volver"}
        backgroundColor={backBackgroundColor ?? theme.rowAlt}
        color={theme.text}
        disabled={disabled}
        fallbackHref={fallbackHref}
        onPress={onBack}
      />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text, fontSize: typography.size[titleSize] }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  copy: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: typography.fontFamily.display,
    fontWeight: "900",
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.helper,
    marginTop: 4,
  },
  action: { alignItems: "center", justifyContent: "center" },
});
