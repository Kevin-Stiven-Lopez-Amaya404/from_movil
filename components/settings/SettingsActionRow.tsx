import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "@/lib/theme/typography";

type SettingsActionRowProps = {
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
};

const appFont = typography.fontFamily.emphasis;

/**
 * Fila reutilizable para las opciones del menú de configuración.
 *
 * Mantiene un patrón visual consistente:
 * icono → título → descripción → chevron.
 */
export function SettingsActionRow({
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
}: SettingsActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor,
          borderColor,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
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
          numberOfLines={1}
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
            numberOfLines={2}
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

      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={mutedColor ?? textColor}
        />
      )}
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
    fontSize: 14,
    fontWeight: "900",
  },

  rowDescription: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
    marginTop: 2,
  },

  pressed: {
    opacity: 0.7,
  },
});
