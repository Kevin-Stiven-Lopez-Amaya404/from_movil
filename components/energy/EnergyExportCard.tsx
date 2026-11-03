import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
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
          <Button
            key={item.key}
            accessibilityLabel={`Exportar ${item.title}`}
            description={item.description}
            disabled={!item.enabled}
            icon={<Ionicons name={item.icon} size={20} color={theme.blue} />}
            label={item.title}
            labelSize="helper"
            loading={item.loading}
            onPress={item.action}
            style={[
              styles.action,
              {
                borderColor: theme.borderLight,
                backgroundColor: theme.rowAlt,
                opacity: item.enabled ? 1 : 0.45,
              },
            ]}
            variant="secondary"
          />
        ))}
      </View>

      <Text style={[styles.note, { color: theme.muted }]}>
        Las descargas se habilitan cuando hay datos
        suficientes para generar cada informe.
      </Text>
    </View>
  );
}
