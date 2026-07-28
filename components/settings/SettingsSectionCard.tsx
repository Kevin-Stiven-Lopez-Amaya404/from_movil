import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import { typography } from "@/lib/theme/typography";

type SettingsSectionCardProps = PropsWithChildren<{
  backgroundColor: string;
  description: string;
  descriptionColor: string;
  iconColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  title: string;
  titleColor: string;
}>;

const RED = "#FF3B20";
const appFont = typography.fontFamily.emphasis;

/**
 * Contenedor comun para secciones de configuracion.
 *
 * Cada bloque mantiene el mismo patron visual: icono, titulo,
 * descripcion y contenido interno.
 */
export function SettingsSectionCard({
  backgroundColor,
  children,
  danger,
  description,
  descriptionColor,
  iconColor,
  iconName,
  title,
  titleColor,
}: SettingsSectionCardProps) {
  return (
    <View style={[styles.card, danger && styles.dangerCard, { backgroundColor }]}>
      <View style={styles.sectionHeader}>
        <Ionicons name={iconName} size={28} color={iconColor} />
        <View style={styles.sectionCopy}>
          <Text style={[styles.sectionTitle, { color: titleColor }, danger && styles.dangerTitle]}>{title}</Text>
          <Text style={[styles.sectionDescription, { color: descriptionColor }]}>{description}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    gap: 14,
    marginTop: 18,
    padding: 16,
  },
  dangerCard: {
    borderColor: "#FFD1CB",
    borderWidth: 1,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  sectionCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "900",
  },
  dangerTitle: {
    color: RED,
  },
  sectionDescription: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 3,
  },
});
