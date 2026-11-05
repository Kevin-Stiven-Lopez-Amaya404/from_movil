import { Ionicons } from "@expo/vector-icons";
import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./SettingsSectionCard.styles";

type Props = PropsWithChildren<{
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  danger?: boolean;
}>;

/** Grupo temático de opciones de perfil o configuración. */
export function SettingsSectionCard({
  children,
  danger = false,
  description,
  iconName,
  title,
}: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name={iconName}
          size={17}
          color={danger ? theme.danger : theme.blue}
          accessible={false}
        />
        <View style={styles.sectionCopy}>
          <Text
            accessibilityRole="header"
            style={[
              styles.sectionTitle,
              { color: danger ? theme.danger : theme.text },
            ]}
          >
            {title}
          </Text>
          {description ? (
            <Text style={[styles.sectionDescription, { color: theme.muted }]}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>
      <View
        style={[
          styles.menu,
          { backgroundColor: theme.card, borderColor: theme.borderLight },
          danger && { borderColor: theme.dangerSoft },
        ]}
      >
        {children}
      </View>
    </View>
  );
}
