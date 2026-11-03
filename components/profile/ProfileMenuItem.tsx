import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./ProfileMenuItem.styles";



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
  variant?: "plain" | "boxed" | "menu";
  showChevron?: boolean;
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
  showChevron = false,
  title,
  variant = "plain",
}: ProfileMenuItemProps) {
  const theme = useAppTheme();

  // El color comunica el tipo de accion: peligro, primaria o normal.
  const iconColor =
    intent === "danger" ? theme.danger : intent === "primary" ? theme.blue : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
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
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      ) : (
        <Ionicons name={icon} size={variant === "boxed" ? 28 : 25} color={iconColor} />
      )}
      <View style={styles.copy}>
        <Text style={[styles.title, { color: intent === "danger" ? theme.danger : theme.text }]}>{title}</Text>
        {!!description && <Text style={[styles.description, { color: theme.muted }]}>{description}</Text>}
      </View>
      {showChevron || variant === "menu" ? (
        <Ionicons name="chevron-forward" size={18} color={theme.muted} />
      ) : null}
    </Pressable>
  );
}
