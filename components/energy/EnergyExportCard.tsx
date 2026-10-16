import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";

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
        Descargar informes
      </Text>

      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Exporta los datos del período seleccionado.
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
              <ActivityIndicator color={theme.blue} />
            ) : (
              <Ionicons
                name={item.icon}
                size={23}
                color={theme.blue}
              />
            )}

            <Text
              style={[
                styles.actionTitle,
                { color: theme.text },
              ]}
            >
              {item.title}
            </Text>

            <Text
              style={[
                styles.actionDescription,
                { color: theme.muted },
              ]}
            >
              {item.description}
            </Text>
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

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  action: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 13,
    minHeight: 112,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 7,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  actionDescription: {
    fontSize: 11,
    textAlign: "center",
  },
  note: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
  },
});
