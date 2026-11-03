import { typography } from "@/lib/theme/typography";
import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";

import { profileFont } from "./profileTheme";

type ProfileModuleProps = PropsWithChildren<{
  /** Texto secundario que resume el contenido del modulo. */
  subtitle?: string;
  /** Titulo visible del bloque. */
  title: string;
}>;

/**
 * Contenedor reutilizable para agrupar secciones del perfil.
 *
 * Evita que `profile.tsx` tenga tarjetas repetidas y permite aplicar tema
 * claro/oscuro de forma consistente.
 */
export function ProfileModule({ children, subtitle, title }: ProfileModuleProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {!!subtitle && <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    gap: 12,
    marginTop: 20,
    padding: 14,
  },
  title: {
    fontFamily: profileFont,
    fontSize: typography.size.bodyLarge,
    fontWeight: "900",
  },
  subtitle: {
    fontFamily: profileFont,
    fontSize: typography.size.caption,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: -6,
  },
});
