import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { typography } from "@/lib/theme/typography";

type SettingsActionRowProps = {
  accessibilityHint?: string;
  backgroundColor: string;
  borderColor: string;
  description?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress: () => void;
  textColor: string;
  title: string;
  mutedColor?: string;
  showChevron?: boolean;
  pending?: boolean;
};

const appFont = typography.fontFamily.emphasis;

/**
 * Fila reutilizable para las opciones del menú de configuración.
 *
 * Mantiene un patrón visual consistente:
 * icono → título → descripción → chevron.
 */
export function SettingsActionRow({
  accessibilityHint,
  backgroundColor,
  borderColor,
  description,
  iconColor,
  iconName,
  mutedColor,
  onPress,
  textColor,
  title,
  showChevron = true,
  pending = false,
}: SettingsActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={description ? `${title}. ${description}` : title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: pending, busy: pending }}
      disabled={pending}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor,
          borderColor,
        },
        (pressed || pending) && styles.pressed,
      ]}
    >
      <View
        accessible={false}
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${iconColor}12`,
          },
        ]}
      >
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>

      <View style={styles.rowCopy}>
        <Text
          style={[
            styles.rowText,
            {
              color: textColor,
            },
          ]}
        >
          {title}
        </Text>

        {!!description && (
          <Text
            style={[
              styles.rowDescription,
              {
                color: mutedColor ?? textColor,
              },
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      {pending ? (
        <ActivityIndicator
          size="small"
          color={mutedColor ?? textColor}
          accessible={false}
        />
      ) : showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={mutedColor ?? textColor}
          accessible={false}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 62,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  iconContainer: {
    alignItems: "center",
    borderRadius: 11,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  rowCopy: {
    flex: 1,
    minWidth: 0,
  },

  rowText: {
    fontFamily: appFont,
    fontSize: typography.size.helper,
    fontWeight: "900",
  },

  rowDescription: {
    fontFamily: appFont,
    fontSize: typography.size.caption,
    fontWeight: "600",
    lineHeight: 15,
    marginTop: 2,
  },

  pressed: {
    opacity: 0.7,
  },
});
