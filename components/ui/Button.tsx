import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { theme as layoutTheme } from "@/constants/theme";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

export type ButtonVariant = "primary" | "secondary" | "text" | "danger";

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  selected?: boolean;
  description?: string;
  accessibilityLabel?: string;
  colorSource?: "app" | "auth" | "solidAction";
  labelSize?: keyof typeof typography.size;
  style?: StyleProp<ViewStyle>;
};

/** Shared button with colors, states and touch size based on the current theme. */
export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  selected = false,
  description,
  accessibilityLabel,
  colorSource = "app",
  labelSize = "body",
  style,
}: Props) {
  const theme = useAppTheme();
  const inactive = disabled || loading;
  const authInactive = colorSource === "auth" && inactive;
  const primaryBackground =
    colorSource === "auth"
      ? theme.auth.primaryButton
      : colorSource === "solidAction"
        ? theme.solidActionBackground
        : theme.primary;
  const primaryForeground =
    colorSource === "auth"
      ? theme.auth.onPrimary
      : colorSource === "solidAction"
        ? theme.onSolidAction
        : theme.onPrimary;
  const primaryPressed =
    colorSource === "auth"
      ? theme.auth.primaryButtonPressed
      : theme.primaryPressed;
  const foreground =
    variant === "danger"
      ? theme.onDanger
      : variant === "primary"
        ? primaryForeground
        : variant === "text"
          ? theme.blue
          : theme.text;

  const background =
    variant === "primary"
      ? primaryBackground
      : variant === "danger"
        ? theme.danger
        : variant === "secondary"
          ? theme.card
          : "transparent";

  const borderColor =
    variant === "secondary" ? theme.borderLight : "transparent";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading, selected }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            authInactive
              ? theme.auth.disabledBackground
              : disabled && colorSource !== "solidAction"
                ? theme.surfaceSecondary
                : pressed && variant === "primary"
                  ? primaryPressed
                  : pressed && variant === "secondary"
                    ? theme.rowAlt
                    : pressed && variant === "text"
                      ? theme.overlaySubtle
                      : background,
          borderColor,
          borderRadius: layoutTheme.radius.button,
          opacity:
            authInactive
              ? 0.8
              : disabled
                ? colorSource === "solidAction" ? 0.5 : 0.72
              : pressed && variant === "danger"
                ? 0.82
                : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
    >
      <View style={[styles.content, description && styles.contentWithDescription]}>
        {loading ? (
          <ActivityIndicator
            color={
              authInactive
                ? theme.auth.disabledForeground
                : variant === "secondary" && loading
                  ? theme.blue
                  : foreground
            }
          />
        ) : (
          icon
        )}
        <View style={description ? styles.copy : undefined}>
          <Text
            style={[
              styles.label,
              {
                color: authInactive
                  ? theme.auth.disabledForeground
                  : disabled
                    ? theme.muted
                    : foreground,
                fontSize: typography.size[labelSize],
                textAlign: description ? "left" : "center",
              },
            ]}
          >
            {label}
          </Text>
          {description ? (
            <Text style={[styles.description, { color: theme.muted }]}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: layoutTheme.spacing.md,
    paddingVertical: layoutTheme.spacing.xs,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: layoutTheme.spacing.xs,
    justifyContent: "center",
    width: "100%",
  },
  contentWithDescription: {
    justifyContent: "flex-start",
  },
  label: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.body,
    fontWeight: "800",
    textAlign: "center",
  },
  copy: { flex: 1, gap: 2 },
  description: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.caption,
    fontWeight: "600",
    textAlign: "left",
  },
});
