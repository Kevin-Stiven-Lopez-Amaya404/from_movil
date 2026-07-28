import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";

import { profileFont, profileTheme } from "./profileTheme";

type ProfileSectionHeaderProps = {
  /** Cambia color a rojo para secciones sensibles, como desactivar cuenta. */
  danger?: boolean;
  /** Explica brevemente la finalidad de la seccion. */
  description: string;
  /** Icono mostrado al inicio del encabezado. */
  icon: keyof typeof Ionicons.glyphMap;
  /** Titulo de la seccion. */
  title: string;
};

/**
 * Encabezado reutilizable para secciones internas del perfil.
 *
 * Separa la estructura visual de titulo/descripcion/icono para que cada modulo
 * sea mas facil de leer y mantener.
 */
export function ProfileSectionHeader({ danger = false, description, icon, title }: ProfileSectionHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.header}>
      <Ionicons name={icon} size={22} color={danger ? theme.danger : theme.blue} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: danger ? theme.danger : theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.muted }]}>{description}</Text>
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
