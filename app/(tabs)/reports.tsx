/**
 * Pantalla de reportes de consumo.
 *
 * Simula analisis de energia por periodos y categorias, mostrando tendencias
 * y una grafica basada en datos predefinidos dentro del contexto global.
 */
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { type FilterItem } from "@/components/ui/FilterChip";
import { HorizontalFilterTabs } from "@/components/ui/HorizontalFilterTabs";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  DeviceCategory,
  ReportRange,
  useSmartHome,
} from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

const ranges: ReportRange[] = ["Semana", "Mes", "Rango"];
const filters: ("Todos" | DeviceCategory)[] = [
  "Todos",
  "Iluminacion",
  "Climatizacion",
  "Electrodomesticos",
  "Seguridad",
];
const reportViews = ["Tiempo real", "Historial"] as const;
type ReportView = (typeof reportViews)[number];

export default function ReportsScreen() {
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  // Datos globales usados para generar reportes simulados.
  const { devices, reportData, accessibleHomes } = useSmartHome();
  const accessibleHomeIds = new Set(accessibleHomes.map((home) => home.id));
  const visibleDevices = devices.filter((device) => accessibleHomeIds.has(device.homeId));

  // Estados que controlan la vista, el periodo y el filtro activo.
  const [activeView, setActiveView] = useState<ReportView>("Tiempo real");
  const [activeRange, setActiveRange] = useState<ReportRange>("Semana");
  const [activeFilter, setActiveFilter] = useState<"Todos" | DeviceCategory>(
    "Todos",
  );
  const points = reportData[activeRange];

  const viewLabels: Record<ReportView, string> = {
    "Tiempo real": "Tiempo real",
    Historial: "Historial",
  };

  const rangeLabels: Record<ReportRange, string> = {
    Diario: "Diario",
    Semana: "Semana",
    Mes: "Mes",
    Rango: "Año",
  };

  const filterLabels: Record<"Todos" | DeviceCategory, string> = {
    Todos: "Todos",
    Iluminacion: "Iluminación",
    Climatizacion: "Climatización",
    Electrodomesticos: "Electrodomésticos",
    Seguridad: "Seguridad",
  };

  const viewItems: FilterItem<ReportView>[] = reportViews.map((value) => ({
    label: viewLabels[value],
    value,
  }));
  const rangeItems: FilterItem<ReportRange>[] = ranges.map((value) => ({
    label: rangeLabels[value],
    value,
  }));
  const filterItems: FilterItem<"Todos" | DeviceCategory>[] = filters.map(
    (value) => ({ label: filterLabels[value], value }),
  );

  // Ajusta los datos del reporte segun la categoria seleccionada.
  // Esto permite que la grafica muestre comparativas relativas entre tipos de
  // consumo sin cambiar los valores originales del reporte base.
  const multiplier = useMemo(() => {
    if (activeFilter === "Todos") return 1;

    const categoryEnergy = visibleDevices
      .filter((device) => device.category === activeFilter && device.online)
      .reduce((total, device) => total + device.energy, 0);
    const totalEnergy = visibleDevices
      .filter((device) => device.online)
      .reduce((total, device) => total + device.energy, 0);

    return totalEnergy > 0 ? Math.max(categoryEnergy / totalEnergy, 0.18) : 0.2;
  }, [activeFilter, visibleDevices]);
  const filteredPoints = points.map((point) => ({
    ...point,
    value: Number((point.value * multiplier).toFixed(1)),
  }));

  // Valores derivados para resumen, grafica y tendencia.
  // `maxValue` se usa para escalar las barras y evitar divisiones por cero.
  const maxValue = Math.max(...filteredPoints.map((point) => point.value), 1);
  const total = filteredPoints.reduce((sum, point) => sum + point.value, 0);
  const previous = total * 0.87;
  const trend =
    previous > 0 ? Math.round(((total - previous) / previous) * 100) : 0;
  const activePoint = filteredPoints.reduce(
    (best, point) => (point.value > best.value ? point : best),
    filteredPoints[0],
  ) ?? { label: "-", value: 0 };

  const realTimePower =
    visibleDevices
      .filter((device) => device.online && device.state === "on")
      .reduce((sum, device) => sum + device.power, 0) / 1000;

  // Datos de consumo agregados por tipo de dispositivo, mostrados en el resumen.
  const applianceTypes = filters
    .filter((item): item is DeviceCategory => item !== "Todos")
    .map((category) => ({
      category,
      total:
        visibleDevices
          .filter((device) => device.category === category && device.online)
          .reduce((sum, device) => sum + device.energy, 0) / 1000,
    }));

  /**
   * Simula la preparacion de un reporte.
   *
   * En una version con backend podria generar/descargar un PDF o CSV real.
   */
  function downloadReport() {
    Alert.alert(
      "Reporte preparado",
      `${rangeLabels[activeRange]} · ${filterLabels[activeFilter]}: ${total.toFixed(1)} ${"kWh"}. ${"Puedes conectar aquí la descarga real del backend."}`,
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingBottom: layout.screenBottom,
            paddingTop: layout.screenTop,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View style={styles.header}>
            <Text
              numberOfLines={1}
              style={[styles.title, { color: theme.text }]}
            >
              {"Análisis energético"}
            </Text>
            <Pressable
              onPress={downloadReport}
              style={[styles.headerButton, { backgroundColor: theme.rowAlt }]}
            >
              <Ionicons name="open-outline" size={31} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.sectionGroup}>
            <Text style={[styles.sectionLabel, { color: theme.muted }]}>
              {"Navegación"}
            </Text>
            <SegmentedControl
              items={viewItems}
              selectedValue={activeView}
              onValueChange={setActiveView}
              scrollable={!layout.narrow}
              containerStyle={styles.controlContainer}
            />
          </View>

          {activeView === "Tiempo real" && (
            <>
              <View
                style={[styles.realTimeCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.realTimeTop}>
                  <Text style={[styles.realTimeTitle, { color: theme.text }]}>
                    {"Consumo en tiempo real"}
                  </Text>
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={theme.blue}
                  />
                </View>
                <View style={styles.gaugeWrap}>
                  <View
                    style={[
                      styles.gaugeOuter,
                      {
                        borderColor: theme.blue,
                        borderLeftColor: "#2AAF5D",
                        borderRightColor: theme.danger,
                      },
                    ]}
                  >
                    <View style={styles.gaugeInner}>
                      <Ionicons
                        name="flash-outline"
                        size={35}
                        color={theme.blue}
                      />
                      <Text style={styles.gaugeValue}>
                        {realTimePower.toFixed(2)}
                      </Text>
                      <Text style={styles.gaugeUnit}>{"kW"}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.realTimeMeta, { color: theme.muted }]}>
                  {"Actualizado ahora"}
                </Text>
              </View>

              <View
                style={[styles.applianceCard, { backgroundColor: theme.card }]}
              >
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {"Energía por tipo de dispositivo"}
                </Text>
                {applianceTypes.map((item) => (
                  <View key={item.category} style={styles.applianceRow}>
                    <Text style={[styles.applianceName, { color: theme.text }]}>
                      {item.category}
                    </Text>
                    <Text style={styles.applianceValue}>
                      {item.total.toFixed(2)} {"kWh"}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {activeView !== "Tiempo real" && (
            <>
              <View style={styles.sectionGroup}>
                <Text style={[styles.sectionLabel, { color: theme.muted }]}>
                  {"Período"}
                </Text>
                <SegmentedControl
                  items={rangeItems}
                  selectedValue={activeRange}
                  onValueChange={setActiveRange}
                  scrollable={!layout.narrow}
                  containerStyle={styles.controlContainer}
                />
              </View>

              <View style={styles.sectionGroup}>
                <Text style={[styles.sectionLabel, { color: theme.muted }]}>
                  {"Categoría"}
                </Text>
                <HorizontalFilterTabs
                  items={filterItems}
                  selectedValue={activeFilter}
                  onValueChange={setActiveFilter}
                  containerStyle={styles.controlContainer}
                />
              </View>

              <View
                style={[styles.summaryCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.summaryTop}>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    {total.toFixed(1)} {"kWh"}
                  </Text>
                  <Text
                    style={[
                      styles.summaryTrend,
                      trend > 0
                        ? { color: theme.danger }
                        : { color: theme.success },
                    ]}
                  >
                    {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
                  </Text>
                </View>
                <Text style={[styles.summaryPeriod, { color: theme.muted }]}>
                  {rangeLabels[activeRange]} · {filterLabels[activeFilter]}
                </Text>
              </View>

              <View style={styles.chartArea}>
                {[0, 40, 80, 120].map((top) => (
                  <View key={top} style={[styles.gridLine, { top }]} />
                ))}

                <View style={styles.bars}>
                  {filteredPoints.map((item) => {
                    const active = item.label === activePoint.label;
                    const height = Math.max((item.value / maxValue) * 138, 14);

                    return (
                      <Pressable
                        key={item.label}
                        style={styles.barColumn}
                        onPress={() =>
                          Alert.alert(
                            item.label,
                            `${item.value.toFixed(1)} ${"kWh"} ${"registrados"}.`,
                          )
                        }
                      >
                        {active && (
                          <View
                            style={[
                              styles.tooltip,
                              { backgroundColor: theme.rowAlt },
                            ]}
                          >
                            <Text
                              style={[
                                styles.tooltipText,
                                { color: theme.text },
                              ]}
                            >
                              {item.label} {item.value.toFixed(1)} {"kWh"}
                            </Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.bar,
                            layout.tiny && styles.barTiny,
                            { height },
                            active && styles.barActive,
                          ]}
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.dayLabel,
                            layout.compact && styles.dayLabelCompact,
                            { color: theme.muted },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View
                style={[styles.insightCard, { backgroundColor: theme.card }]}
              >
                <Ionicons name="bulb-outline" size={26} color={theme.blue} />
                <Text style={[styles.insightText, { color: theme.text }]}>
                  {`El mayor pico está en ${activePoint.label}. Revisa horarios de climatización y cargas automáticas.`}
                </Text>
              </View>

              <View style={styles.divider} />

              <Pressable
                style={[styles.downloadButton, { borderColor: theme.blue }]}
                onPress={downloadReport}
              >
                <Ionicons
                  name="download-outline"
                  size={21}
                  color={theme.blue}
                />
                <Text style={[styles.downloadText, { color: theme.blue }]}>
                  {"Descargar reporte"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const appFont = typography.fontFamily.emphasis;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    alignItems: "center",
    paddingBottom: 115,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "#454545",
    flex: 1,
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "800",
    minWidth: 0,
  },
  headerButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  sectionGroup: {
    marginTop: 22,
  },
  sectionLabel: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  controlContainer: {
    width: "100%",
  },
  realTimeCard: {
    backgroundColor: "#F4F6FF",
    borderRadius: 18,
    marginTop: 26,
    padding: 18,
  },
  realTimeTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  realTimeTitle: {
    color: "#454545",
    flex: 1,
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "800",
  },
  gaugeWrap: {
    alignItems: "center",
    marginTop: 22,
  },
  gaugeOuter: {
    alignItems: "center",
    borderColor: "#0864C8",
    borderLeftColor: "#2AAF5D",
    borderRadius: 92,
    borderRightColor: "#FF3B20",
    borderWidth: 16,
    height: 184,
    justifyContent: "center",
    width: 184,
  },
  gaugeInner: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 62,
    height: 124,
    justifyContent: "center",
    width: 124,
  },
  gaugeValue: {
    color: "#454545",
    fontFamily: appFont,
    fontSize: 31,
    fontWeight: "800",
    marginTop: 2,
  },
  gaugeUnit: {
    color: "#6B7280",
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  realTimeMeta: {
    color: "#6B7280",
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 14,
    textAlign: "center",
  },
  applianceCard: {
    backgroundColor: "#F4F6FF",
    borderRadius: 16,
    gap: 12,
    marginTop: 18,
    padding: 16,
  },
  cardTitle: {
    color: "#454545",
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "800",
  },
  applianceRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 42,
    paddingHorizontal: 12,
  },
  applianceName: {
    color: "#454545",
    flex: 1,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  applianceValue: {
    color: "#0864C8",
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  summaryCard: {
    alignSelf: "center",
    backgroundColor: "#F4F6FF",
    borderRadius: 16,
    marginTop: 32,
    paddingHorizontal: 15,
    paddingVertical: 13,
    width: "100%",
  },
  summaryTop: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  summaryValue: {
    color: "#454545",
    fontFamily: appFont,
    fontSize: 27,
    fontWeight: "800",
    textDecorationColor: "#0864C8",
    textDecorationLine: "underline",
  },
  summaryTrend: {
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  trendDanger: {
    color: "#FF3B20",
  },
  trendGood: {
    color: "#2AAF5D",
  },
  summaryPeriod: {
    color: "#454545",
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "center",
  },
  chartArea: {
    flex: 1,
    height: 166,
    position: "relative",
  },
  gridLine: {
    borderTopColor: "#A2A6B3",
    borderTopWidth: 1,
    borderStyle: "dashed",
    left: 0,
    position: "absolute",
    right: 0,
  },
  bars: {
    alignItems: "flex-end",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    left: 0,
    position: "absolute",
    right: 0,
    top: -3,
  },
  barColumn: {
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "flex-end",
    minWidth: 24,
  },
  bar: {
    backgroundColor: "#D8DAFA",
    borderRadius: 5,
    width: 22,
  },
  barTiny: {
    width: 18,
  },
  barActive: {
    backgroundColor: "#0864C8",
  },
  tooltip: {
    backgroundColor: "#F4F6FF",
    borderRadius: 4,
    marginBottom: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  tooltipText: {
    color: "#454545",
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "800",
  },
  dayLabel: {
    color: "#454545",
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  dayLabelCompact: {
    fontSize: 11,
  },
  insightCard: {
    alignItems: "center",
    backgroundColor: "#F4F6FF",
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 0,
    marginTop: 28,
    padding: 12,
  },
  insightText: {
    color: "#6B7280",
    flex: 1,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  divider: {
    backgroundColor: "#D8DAFA",
    height: 1,
    marginTop: 19,
  },
  downloadButton: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: "#0864C8",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 18,
    height: 36,
    justifyContent: "center",
    marginTop: 32,
    maxWidth: 260,
    width: "100%",
  },
  downloadText: {
    color: "#0864C8",
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
  },
});
