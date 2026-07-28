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
};

const appFont = typography.fontFamily.emphasis;

/**
 * Fila accionable usada dentro de configuracion.
 *
 * Permite reutilizar el mismo layout para editar perfil o abrir
 * integraciones pendientes.
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
}: SettingsActionRowProps) {
  return (
    <Pressable style={[styles.row, { backgroundColor, borderColor }]} onPress={onPress}>
      <Ionicons name={iconName} size={22} color={iconColor} />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowText, { color: textColor }]}>{title}</Text>
        {!!description && (
          <Text style={[styles.rowDescription, { color: mutedColor ?? textColor }]}>{description}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowText: {
    flex: 1,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
  },
  rowDescription: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3,
  },
});
