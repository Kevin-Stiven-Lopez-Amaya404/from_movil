import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./ProfileMenuItem.styles";



type ProfileMenuItemProps = {
  /** Optional secondary text below the title. */
  description?: string;
  /** Name of the Ionicons icon that goes with the action. */
  icon: keyof typeof Ionicons.glyphMap;
  /** Defines the semantic color: normal, primary or danger. */
  intent?: "default" | "danger" | "primary";
  /** Action run when the row is tapped. */
  onPress: () => void;
  title: string;
  /** `boxed` shows the row as a card; `plain` as a simple option. */
  variant?: "plain" | "boxed" | "menu";
  showChevron?: boolean;
  accessibilityHint?: string;
};

/**
 * Reusable row for profile options.
 *
 * Centralizes styles, icons, pressed states and colors by intent.
 * That way `profile.tsx` can focus on structure and not repeat JSX.
 */
export function ProfileMenuItem({
  description,
  accessibilityHint,
  icon,
  intent = "default",
  onPress,
  showChevron = false,
  title,
  variant = "plain",
}: ProfileMenuItemProps) {
  const theme = useAppTheme();

  // The color conveys the kind of action: danger, primary or normal.
  const iconColor =
    intent === "danger" ? theme.danger : intent === "primary" ? theme.blue : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={description ? `${title}. ${description}` : title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        variant === "boxed"
          ? [styles.boxedRow, { backgroundColor: theme.row, borderColor: theme.border }]
          : variant === "menu"
            ? [styles.menuRow, { borderTopColor: theme.profileDivider }]
            : styles.plainRow,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {variant === "menu" ? (
        <View style={[styles.menuIcon, { backgroundColor: theme.rowAlt }]}>
          <Ionicons
            accessible={false}
            name={icon}
            size={20}
            color={iconColor}
          />
        </View>
      ) : (
        <Ionicons
          accessible={false}
          name={icon}
          size={variant === "boxed" ? 28 : 25}
          color={iconColor}
        />
      )}
      <View style={styles.copy}>
        <Text style={[styles.title, { color: intent === "danger" ? theme.danger : theme.text }]}>{title}</Text>
        {!!description && <Text style={[styles.description, { color: theme.muted }]}>{description}</Text>}
      </View>
      {showChevron || variant === "menu" ? (
        <Ionicons
          accessible={false}
          name="chevron-forward"
          size={18}
          color={theme.muted}
        />
      ) : null}
    </Pressable>
  );
}
