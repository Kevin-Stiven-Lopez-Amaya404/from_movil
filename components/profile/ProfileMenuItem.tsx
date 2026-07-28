import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";

import { profileFont, profileTheme } from "./profileTheme";

type ProfileMenuItemProps = {
  /** Texto secundario opcional debajo del titulo. */
  description?: string;
  /** Nombre del icono Ionicons que acompaña la accion. */
  icon: keyof typeof Ionicons.glyphMap;
  /** Define color semantico: normal, primario o peligro. */
  intent?: "default" | "danger" | "primary";
  /** Accion que se ejecuta al tocar la fila. */
  onPress: () => void;
  title: string;
  /** `boxed` muestra la fila como tarjeta; `plain` como opcion simple. */
  variant?: "plain" | "boxed";
};

/**
 * Fila reutilizable para opciones del perfil.
 *
 * Centraliza estilos, iconos, estados presionados y colores por intencion.
 * Asi `profile.tsx` puede enfocarse en la estructura y no repetir JSX.
 */
export function ProfileMenuItem({
  description,
  icon,
  intent = "default",
  onPress,
  title,
  variant = "plain",
}: ProfileMenuItemProps) {
  const theme = useAppTheme();

  // El color comunica el tipo de accion: peligro, primaria o normal.
  const iconColor =
    intent === "danger" ? theme.danger : intent === "primary" ? theme.blue : theme.text;

  return (
    <Pressable
      style={({ pressed }) => [
        variant === "boxed"
          ? [styles.boxedRow, { backgroundColor: theme.row, borderColor: theme.border }]
          : styles.plainRow,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={variant === "boxed" ? 28 : 25} color={iconColor} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: intent === "danger" ? theme.danger : theme.text }]}>{title}</Text>
        {!!description && <Text style={[styles.description, { color: theme.muted }]}>{description}</Text>}
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
