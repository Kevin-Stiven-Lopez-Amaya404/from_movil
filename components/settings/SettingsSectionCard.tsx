import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { Text, View } from "react-native";
import { styles } from "./SettingsSectionCard.styles";



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
