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
 * Grupo de opciones de configuración.
 *
 * Organiza cada categoría como una sección de menú:
 * encabezado + descripción + opciones internas.
 */
export function SettingsSectionCard({
  backgroundColor,
  children,
  danger = false,
  description,
  descriptionColor,
  iconColor,
  iconName,
  title,
  titleColor,
}: SettingsSectionCardProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionIcon,
            {
              backgroundColor: danger ? "#FFF1EF" : `${iconColor}12`,
            },
          ]}
        >
          <Ionicons name={iconName} size={19} color={iconColor} />
        </View>

        <View style={styles.sectionCopy}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: danger ? RED : titleColor,
              },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.sectionDescription,
              {
                color: descriptionColor,
              },
            ]}
          >
            {description}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.menu,
          {
            backgroundColor,
            borderColor: danger ? "#FFD1CB" : "transparent",
            borderWidth: danger ? 1 : 0,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    width: "100%",
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 9,
    paddingHorizontal: 2,
  },

  sectionIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  sectionCopy: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "900",
  },

  sectionDescription: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
    marginTop: 2,
  },

  menu: {
    borderRadius: 16,
    gap: 7,
    padding: 4,
  },
});
