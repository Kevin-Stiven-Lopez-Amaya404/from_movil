import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./EnergyExportCard.styles";

type Props = {
  canExportCsv: boolean;
  canExportPdf: boolean;
  exportingCsv: boolean;
  exportingPdf: boolean;
  onExportCsv: () => void;
  onExportPdf: () => void;
};

export function EnergyExportCard({
  canExportCsv,
  canExportPdf,
  exportingCsv,
  exportingPdf,
  onExportCsv,
  onExportPdf,
}: Props) {
  const theme = useAppTheme();

  const exports = [
    {
      key: "csv",
      title: "CSV",
      description: "Datos tabulados",
      icon: "grid-outline" as const,
      enabled: canExportCsv,
      loading: exportingCsv,
      action: onExportCsv,
    },
    {
      key: "pdf",
      title: "PDF",
      description: "Informe de consumo",
      icon: "document-text-outline" as const,
      enabled: canExportPdf,
      loading: exportingPdf,
      action: onExportPdf,
    },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Descargar informe
      </Text>

      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Elige el formato para el período seleccionado.
      </Text>

      <View style={styles.actions}>
        {exports.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={`Exportar ${item.title}`}
            accessibilityState={{
              disabled: !item.enabled,
              busy: item.loading,
            }}
            disabled={!item.enabled}
            onPress={item.action}
            style={({ pressed }) => [
              styles.action,
              {
                borderColor: theme.borderLight,
                backgroundColor: theme.rowAlt,
                opacity: item.enabled ? (pressed ? 0.75 : 1) : 0.45,
              },
            ]}
          >
            {item.loading ? (
              <ActivityIndicator color={theme.blue} size="small" />
            ) : (
              <Ionicons
                name={item.icon}
                size={20}
                color={theme.blue}
              />
            )}

            <View style={styles.actionCopy}>
              <Text
                numberOfLines={1}
                style={[styles.actionTitle, { color: theme.text }]}
              >
                {item.title}
              </Text>

              <Text
                numberOfLines={1}
                style={[styles.actionDescription, { color: theme.muted }]}
              >
                {item.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.note, { color: theme.muted }]}>
        Las descargas se habilitan cuando hay datos
        suficientes para generar cada informe.
      </Text>
    </View>
  );
}
