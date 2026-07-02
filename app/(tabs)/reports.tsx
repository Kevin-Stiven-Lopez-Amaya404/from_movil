import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useResponsiveLayout } from "@/lib/responsive";
import { DeviceCategory, ReportRange, useSmartHome } from "@/lib/smart-home-context";

const BLUE = "#0864C8";
const LILAC = "#DDDDFB";
const TEXT = "#454545";
const RED = "#FF3B20";
const GREEN = "#2AAF5D";
const MUTED = "#6B7280";

const ranges: ReportRange[] = ["Diario", "Semana", "Mes", "Rango"];
const filters: ("Todos" | DeviceCategory)[] = ["Todos", "Iluminacion", "Climatizacion", "Electrodomesticos"];
const reportViews = ["Tiempo real", "Historial", "Mensual", "Tarifa"] as const;
type ReportView = (typeof reportViews)[number];

export default function ReportsScreen() {
  const layout = useResponsiveLayout();
  const { devices, reportData } = useSmartHome();
  const [activeView, setActiveView] = useState<ReportView>("Tiempo real");
  const [activeRange, setActiveRange] = useState<ReportRange>("Semana");
  const [activeFilter, setActiveFilter] = useState<"Todos" | DeviceCategory>("Todos");
  const points = reportData[activeRange];
  const multiplier = useMemo(() => {
    if (activeFilter === "Todos") return 1;

    const categoryConsumption = devices
      .filter((device) => device.category === activeFilter && device.online)
      .reduce((total, device) => total + device.consumption, 0);
    const totalConsumption = devices
      .filter((device) => device.online)
      .reduce((total, device) => total + device.consumption, 0);

    return totalConsumption > 0 ? Math.max(categoryConsumption / totalConsumption, 0.18) : 0.2;
  }, [activeFilter, devices]);
  const filteredPoints = points.map((point) => ({
    ...point,
    value: Number((point.value * multiplier).toFixed(1)),
  }));
  const maxValue = Math.max(...filteredPoints.map((point) => point.value), 1);
  const total = filteredPoints.reduce((sum, point) => sum + point.value, 0);
  const previous = total * 0.87;
  const trend = Math.round(((total - previous) / previous) * 100);
  const activePoint = filteredPoints.reduce((best, point) => (point.value > best.value ? point : best), filteredPoints[0]);
  const realTimeConsumption = devices
    .filter((device) => device.online)
    .reduce((sum, device) => sum + device.consumption, 0);
  const applianceTypes = filters
    .filter((item): item is DeviceCategory => item !== "Todos")
    .map((category) => ({
      category,
      total: devices
        .filter((device) => device.category === category && device.online)
        .reduce((sum, device) => sum + device.consumption, 0),
    }));

  function downloadReport() {
    Alert.alert(
      "Reporte preparado",
      `${activeRange} · ${activeFilter}: ${total.toFixed(1)} kWh. Puedes conectar aquí la descarga real del backend.`,
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingTop: layout.compact ? 24 : 36,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.title}>Análisis energético</Text>
          <Pressable onPress={downloadReport} style={styles.headerButton}>
            <Ionicons name="open-outline" size={31} color={TEXT} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.viewTabs}
          showsHorizontalScrollIndicator={false}
        >
          {reportViews.map((item) => {
            const active = activeView === item;

            return (
              <Pressable
                key={item}
                style={[styles.viewTab, active && styles.viewTabActive]}
                onPress={() => setActiveView(item)}
              >
                <Text style={[styles.viewTabText, active && styles.viewTabTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeView === "Tiempo real" && (
          <>
            <View style={styles.realTimeCard}>
              <View style={styles.realTimeTop}>
                <Text style={styles.realTimeTitle}>Consumo en tiempo real</Text>
                <Ionicons name="settings-outline" size={24} color={BLUE} />
              </View>
              <View style={styles.gaugeWrap}>
                <View style={styles.gaugeOuter}>
                  <View style={styles.gaugeInner}>
                    <Ionicons name="flash-outline" size={35} color={BLUE} />
                    <Text style={styles.gaugeValue}>{realTimeConsumption.toFixed(2)}</Text>
                    <Text style={styles.gaugeUnit}>kWh</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.realTimeMeta}>Actualizado ahora</Text>
            </View>

            <View style={styles.applianceCard}>
              <Text style={styles.cardTitle}>Energía por tipo de dispositivo</Text>
              {applianceTypes.map((item) => (
                <View key={item.category} style={styles.applianceRow}>
                  <Text style={styles.applianceName}>{item.category}</Text>
                  <Text style={styles.applianceValue}>{item.total.toFixed(2)} kWh</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {activeView === "Tarifa" && (
          <>
            <View style={styles.tariffInfoCard}>
              <Ionicons name="information-circle-outline" size={24} color={BLUE} />
              <Text style={styles.tariffInfoText}>
                Configura la fecha de facturación y el valor por kWh para estimar el costo mensual.
              </Text>
            </View>

            <View style={styles.tariffCard}>
              <Text style={styles.cardTitle}>Detalles de tarifa eléctrica</Text>
              <View style={styles.tariffRow}>
                <Ionicons name="calendar-outline" size={22} color={MUTED} />
                <Text style={styles.tariffLabel}>Día de facturación</Text>
                <Text style={styles.tariffValue}>01 del mes</Text>
              </View>
              <View style={styles.tariffRow}>
                <Ionicons name="cash-outline" size={22} color={MUTED} />
                <Text style={styles.tariffLabel}>Tarifa estimada</Text>
                <Text style={styles.tariffValue}>$950 COP/kWh</Text>
              </View>
              <Pressable style={styles.saveButton} onPress={() => Alert.alert("Tarifa guardada", "Los datos de tarifa quedaron preparados.")}>
                <Text style={styles.saveButtonText}>Guardar tarifa</Text>
              </Pressable>
            </View>
          </>
        )}

        {activeView !== "Tarifa" && activeView !== "Tiempo real" && (
          <>
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryValue}>{total.toFixed(1)} kWh</Text>
            <Text style={[styles.summaryTrend, trend > 0 ? styles.trendDanger : styles.trendGood]}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </Text>
          </View>
          <Text style={styles.summaryPeriod}>{activeRange} · {activeFilter}</Text>
        </View>

        <View style={styles.rangeTabs}>
          {ranges.map((item) => {
            const active = activeRange === item;

            return (
              <Pressable
                key={item}
                style={[styles.rangeTab, active && styles.rangeTabActive]}
                onPress={() => setActiveRange(item)}
              >
                <Text style={[styles.rangeText, active && styles.rangeTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.filterRow}
          showsHorizontalScrollIndicator={false}
        >
          {filters.map((item) => {
            const active = activeFilter === item;

            return (
              <Pressable
                key={item}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(item)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.chartTitle}>Consumo de energía (kWh)</Text>

        <View style={styles.chartBlock}>
          <View style={styles.yAxis}>
            {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((label, index) => (
              <Text key={`${label}-${index}`} style={styles.yLabel}>
                {label.toFixed(label >= 10 ? 0 : 1)}
              </Text>
            ))}
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
                    onPress={() => Alert.alert(item.label, `${item.value.toFixed(1)} kWh registrados.`)}
                  >
                    {active && (
                      <View style={styles.tooltip}>
                        <Text style={styles.tooltipText}>{item.label} {item.value.toFixed(1)} kWh</Text>
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
                    <Text style={styles.dayLabel}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.insightCard}>
          <Ionicons name="bulb-outline" size={26} color={BLUE} />
          <Text style={styles.insightText}>
            El mayor pico está en {activePoint.label}. Revisa horarios de climatización y cargas automáticas.
          </Text>
        </View>

        <View style={styles.divider} />

        <Pressable style={styles.downloadButton} onPress={downloadReport}>
          <Ionicons name="download-outline" size={21} color={BLUE} />
          <Text style={styles.downloadText}>Descargar reporte</Text>
        </Pressable>
          </>
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const appFont = "sans-serif-medium";

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
    color: TEXT,
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
  viewTabs: {
    gap: 8,
    paddingTop: 21,
  },
  viewTab: {
    alignItems: "center",
    backgroundColor: LILAC,
    borderRadius: 9,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 13,
  },
  viewTabActive: {
    backgroundColor: BLUE,
  },
  viewTabText: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  viewTabTextActive: {
    color: "#FFFFFF",
  },
  realTimeCard: {
    backgroundColor: LILAC,
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
    color: TEXT,
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
    borderColor: BLUE,
    borderLeftColor: GREEN,
    borderRadius: 92,
    borderRightColor: RED,
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
    color: TEXT,
    fontFamily: appFont,
    fontSize: 31,
    fontWeight: "800",
    marginTop: 2,
  },
  gaugeUnit: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  realTimeMeta: {
    color: MUTED,
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
    color: TEXT,
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
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  applianceValue: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  tariffInfoCard: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 14,
    flexDirection: "row",
    gap: 10,
    marginTop: 26,
    padding: 14,
  },
  tariffInfoText: {
    color: MUTED,
    flex: 1,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  tariffCard: {
    backgroundColor: LILAC,
    borderRadius: 16,
    gap: 12,
    marginTop: 18,
    padding: 16,
  },
  tariffRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  tariffLabel: {
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  tariffValue: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
  },
  summaryCard: {
    alignSelf: "center",
    backgroundColor: LILAC,
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
    color: TEXT,
    fontFamily: appFont,
    fontSize: 27,
    fontWeight: "800",
    textDecorationColor: BLUE,
    textDecorationLine: "underline",
  },
  summaryTrend: {
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  trendDanger: {
    color: RED,
  },
  trendGood: {
    color: GREEN,
  },
  summaryPeriod: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "center",
  },
  rangeTabs: {
    flexDirection: "row",
    gap: 1,
    marginTop: 21,
    paddingHorizontal: 0,
    width: "100%",
  },
  rangeTab: {
    alignItems: "center",
    backgroundColor: LILAC,
    borderRadius: 6,
    flex: 1,
    height: 32,
    justifyContent: "center",
  },
  rangeTabActive: {
    backgroundColor: BLUE,
  },
  rangeText: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  rangeTextActive: {
    color: "#FFFFFF",
  },
  filterRow: {
    gap: 10,
    paddingHorizontal: 0,
    paddingTop: 28,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: LILAC,
    borderRadius: 8,
    height: 30,
    justifyContent: "center",
    paddingHorizontal: 13,
  },
  filterChipActive: {
    backgroundColor: BLUE,
    minWidth: 76,
  },
  filterText: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  chartTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 25,
    textAlign: "center",
  },
  chartBlock: {
    flexDirection: "row",
    marginTop: 39,
    paddingLeft: 0,
    paddingRight: 0,
    width: "100%",
  },
  yAxis: {
    height: 166,
    justifyContent: "space-between",
    paddingBottom: 2,
    width: 32,
  },
  yLabel: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "800",
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
    backgroundColor: BLUE,
  },
  tooltip: {
    backgroundColor: LILAC,
    borderRadius: 4,
    marginBottom: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  tooltipText: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "800",
  },
  dayLabel: {
    color: "#000000",
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  insightCard: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 0,
    marginTop: 28,
    padding: 12,
  },
  insightText: {
    color: MUTED,
    flex: 1,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  divider: {
    backgroundColor: "#DDE2F5",
    height: 1,
    marginTop: 19,
  },
  downloadButton: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: BLUE,
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
    color: BLUE,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
  },
});
