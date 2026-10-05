/**
 * Pantalla de Análisis Energético y Reportes.
 *
 * Sub-pestañas disponibles:
 * Historia: Selector desplegable (24h, Día, 7d, Semana, 30d, Mes), selector de fecha,
 *    gráfica de telemetría horaria en Wh/kWh, zona horaria (America/Bogota) y tarjetas de descarga.
 */
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMockApi } from "@/lib/config/api-config";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { consumptionService } from "@/lib/services/consumption-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type HistoryPeriod =
  | "Últimas 24 horas"
  | "Día"
  | "Últimos 7 días"
  | "Semana"
  | "Últimos 30 días"
  | "Mes";

const HISTORY_PERIODS: HistoryPeriod[] = [
  "Últimas 24 horas",
  "Día",
  "Últimos 7 días",
  "Semana",
  "Últimos 30 días",
  "Mes",
];

const TIMESTAMPS_24H = [
  "19:00",
  "21:00",
  "23:00",
  "01:00",
  "03:00",
  "05:00",
  "07:00",
  "09:00",
  "11:00",
  "13:00",
  "15:00",
  "17:00",
];

export default function ReportsScreen() {
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  const { accessibleHomes, activeHomeId } = useSmartHome();
  const activeHomeName =
    accessibleHomes.find((home) => home.id === activeHomeId)?.name ?? "Hogar";
  const [realConsumptionKwh, setRealConsumptionKwh] = useState<number | null>(
    null,
  );
  const [dailySeries, setDailySeries] = useState<Array<{ label: string; value: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (useMockApi || !activeHomeId) {
      setDailySeries([]);
      setRealConsumptionKwh(null);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    Promise.all([
      consumptionService.getHomeSummary(activeHomeId),
      consumptionService.getHomeDaily(activeHomeId, { limit: 12 }),
    ])
      .then(([summary, daily]) => {
        if (!active) return;

        const summaryValue = Number(summary?.energyDeltaKwh ?? 0);
        const fallbackValue = daily.reduce(
          (sum, record) => sum + (Number(record.energyDeltaKwh ?? 0) || 0),
          0,
        );

        setRealConsumptionKwh(
          Number.isFinite(summaryValue) && summaryValue > 0
            ? summaryValue
            : fallbackValue,
        );

        const mappedSeries = daily
          .map((record) => {
            const timestamp =
              record.recordedAt ?? record.timestamp ?? new Date().toISOString();
            const date = new Date(timestamp);
            if (Number.isNaN(date.getTime())) return null;

            return {
              label: date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              value: Number(record.energyDeltaKwh ?? 0),
            };
          })
          .filter((point): point is { label: string; value: number } => !!point);

        setDailySeries(mappedSeries.slice(-12));
      })
      .catch(() => {
        if (active) {
          setRealConsumptionKwh(null);
          setDailySeries([]);
          setError("No se pudo cargar el consumo real del hogar.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeHomeId]);

  const consumptionLabel =
    realConsumptionKwh !== null
      ? `${(realConsumptionKwh * 1000).toFixed(0)} Wh consumidos en este período`
      : useMockApi
        ? "Conecta el backend para consultar datos reales"
        : "Datos no disponibles para este período";

  const chartPoints = useMemo(() => {
    if (dailySeries.length > 0) return dailySeries;
    return TIMESTAMPS_24H.map((label) => ({ label, value: 0 }));
  }, [dailySeries]);

  // Estados de la pestaña "Historia"
  const [historyPeriod, setHistoryPeriod] =
    useState<HistoryPeriod>("Últimas 24 horas");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dateRangeIndex, setDateRangeIndex] = useState(0);

  const dateRanges = [
    "Período actual",
    "Últimos 7 días",
    "Últimos 30 días",
    "Período anterior",
  ];
  const currentDateRange =
    dateRanges[Math.abs(dateRangeIndex) % dateRanges.length];

  function handleDownloadReport(title: string) {
    Alert.alert(
      "Exportación no disponible",
      `La exportación de ${title} aún no está publicada en el backend actual. El frontend solo muestra datos del período disponible en la API actual.`,
      [{ text: "Entendido" }],
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.dark ? "#0C1322" : theme.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          {/* ============================================================ */}
          {/* CABECERA DE PANTALLA                                         */}
          {/* ============================================================ */}
          <View style={styles.screenHeader}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>
              Energía
            </Text>
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Hogar Activo",
                  `Gestionando: ${accessibleHomes.find((h) => h.id === activeHomeId)?.name ?? "Casa"}`,
                )
              }
              style={[
                styles.headerIconBtnDark,
                { backgroundColor: theme.rowAlt },
              ]}
            >
              <Ionicons name="home" size={16} color={theme.text} />
            </Pressable>
          </View>

          {/* ============================================================ */}
          {/* PESTAÑA 1: HISTORIA (IMÁGENES 2 Y 3)                         */}
          {/* ============================================================ */}
          <View style={styles.historySection}>
            {/* Tarjeta de Selección de Período y Dropdown */}
            <View
              style={[
                styles.cardContainer,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Historia
              </Text>

              {/* Selector Desplegable (Dropdown) */}
              <Pressable
                onPress={() => setDropdownOpen(!dropdownOpen)}
                style={[
                  styles.dropdownHeader,
                  {
                    backgroundColor: theme.dark ? "#0E1829" : theme.rowAlt,
                    borderColor: "#2563EB",
                  },
                ]}
              >
                <View style={styles.dropdownHeaderLeft}>
                  <Ionicons name="time-outline" size={18} color={theme.text} />
                  <Text
                    style={[styles.dropdownHeaderText, { color: theme.text }]}
                  >
                    {historyPeriod}
                  </Text>
                </View>
                <Ionicons
                  name={dropdownOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={theme.muted}
                />
              </Pressable>

              {/* Lista Desplegable (Imagen 2) */}
              {dropdownOpen && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: theme.dark ? "#0E1829" : theme.rowAlt,
                      borderColor: "#2563EB",
                    },
                  ]}
                >
                  {HISTORY_PERIODS.map((period) => {
                    const isSelected = historyPeriod === period;
                    return (
                      <Pressable
                        key={period}
                        onPress={() => {
                          setHistoryPeriod(period);
                          setDropdownOpen(false);
                        }}
                        style={[
                          styles.dropdownItem,
                          isSelected && styles.dropdownItemSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            { color: isSelected ? "#3B82F6" : theme.text },
                          ]}
                        >
                          {period}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {/* Navegador de Rango de Fechas (< 09.09.2026 - 10.09.2026 >) - Imagen 3 */}
              <View
                style={[
                  styles.dateNavigator,
                  {
                    backgroundColor: theme.dark ? "#0E1829" : theme.rowAlt,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <Pressable
                  onPress={() => setDateRangeIndex((prev) => prev - 1)}
                  hitSlop={8}
                  style={styles.dateNavArrow}
                >
                  <Ionicons name="chevron-back" size={18} color={theme.text} />
                </Pressable>

                <Text style={[styles.dateNavText, { color: theme.text }]}>
                  {currentDateRange}
                </Text>

                <Pressable
                  onPress={() => setDateRangeIndex((prev) => prev + 1)}
                  hitSlop={8}
                  style={styles.dateNavArrow}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.text}
                  />
                </Pressable>
              </View>
            </View>

            {/* Tarjeta: "Energía Total - Últimas 24 horas" (Imagen 3) */}
            <View
              style={[
                styles.cardContainer,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <View style={styles.chartCardHeader}>
                <Text style={[styles.chartCardTitle, { color: theme.text }]}>
                  Energía Total - {historyPeriod}
                </Text>
                <Pressable
                  onPress={() =>
                    handleDownloadReport(`Energía Total (${historyPeriod})`)
                  }
                  hitSlop={8}
                  style={[styles.exportBtn, { backgroundColor: theme.rowAlt }]}
                >
                  <Ionicons
                    name="download-outline"
                    size={18}
                    color={theme.text}
                  />
                </Pressable>
              </View>

              {/* Área de la Gráfica */}
              <View style={styles.chartArea}>
                {loading ? (
                  <Text style={[styles.noDataOverlayText, { color: theme.muted }]}>
                    Cargando consumo real…
                  </Text>
                ) : error ? (
                  <Text style={[styles.noDataOverlayText, { color: theme.muted }]}>
                    {error}
                  </Text>
                ) : (
                  <>
                    {/* Ejes Y de referencia (1 Wh, 0.5 Wh, 0 Wh) */}
                    <View style={styles.yAxisRow}>
                      <Text style={[styles.axisLabel, { color: theme.muted }]}>
                        1 Wh
                      </Text>
                      <View
                        style={[
                          styles.gridLine,
                          { backgroundColor: theme.borderLight },
                        ]}
                      />
                    </View>

                    <View style={styles.yAxisRow}>
                      <Text style={[styles.axisLabel, { color: theme.muted }]}>
                        0.5 Wh
                      </Text>
                      <View
                        style={[
                          styles.gridLine,
                          { backgroundColor: theme.borderLight },
                        ]}
                      >
                        {realConsumptionKwh === null ? (
                          <Text
                            style={[
                              styles.noDataOverlayText,
                              { color: theme.muted },
                            ]}
                          >
                            {useMockApi
                              ? "Conecta el backend para consultar datos"
                              : "¡Datos no disponibles!"}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.yAxisRow}>
                      <Text style={[styles.axisLabel, { color: theme.muted }]}>
                        0 Wh
                      </Text>
                      <View
                        style={[
                          styles.gridLine,
                          { backgroundColor: theme.borderLight },
                        ]}
                      />
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.xAxisTimestamps}
                    >
                      {chartPoints.map((point) => (
                        <View key={`${point.label}-${point.value}`} style={styles.timestampCol}>
                          <View
                            style={[
                              styles.timestampTick,
                              { backgroundColor: theme.borderLight },
                            ]}
                          />
                          <Text
                            style={[styles.timestampText, { color: theme.muted }]}
                          >
                            {point.label}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                )}
              </View>

              {/* Pie de zona horaria */}
              <Text style={[styles.timezoneFooter, { color: theme.muted }]}>
                Zona horaria local de la cuenta de usuario: America/Bogota
              </Text>
            </View>

            {/* Resumen de consumo del hogar activo */}
            <View
              style={[
                styles.cardContainer,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <View style={styles.chartCardHeader}>
                <Text style={[styles.chartCardTitle, { color: theme.text }]}>
                  {activeHomeName} - {historyPeriod}
                </Text>
                <Pressable
                  onPress={() =>
                    handleDownloadReport(`${activeHomeName} (${historyPeriod})`)
                  }
                  hitSlop={8}
                  style={[styles.exportBtn, { backgroundColor: theme.rowAlt }]}
                >
                  <Ionicons
                    name="download-outline"
                    size={18}
                    color={theme.text}
                  />
                </Pressable>
              </View>

              <Text style={[styles.deviceHistoryMeta, { color: theme.muted }]}>
                Consumo incremental registrado en el hogar durante el período
                seleccionado.
              </Text>
              <View
                style={[
                  styles.deviceStatBadge,
                  { backgroundColor: theme.rowAlt },
                ]}
              >
                <Ionicons name="flash-outline" size={16} color={theme.blue} />
                <Text style={[styles.deviceStatText, { color: theme.text }]}>
                  {loading ? "Consultando consumo real…" : consumptionLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: "100%",
    alignSelf: "center",
  },
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "900",
    fontFamily: typography.fontFamily.emphasis,
  },
  headerIconBtnDark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  historySection: {
    width: "100%",
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
    marginBottom: 12,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 10,
  },
  dropdownHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  dropdownMenu: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  dateNavigator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    height: 42,
    paddingHorizontal: 10,
  },
  dateNavArrow: {
    padding: 6,
  },
  dateNavText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  chartCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chartCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
  },
  exportBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chartArea: {
    paddingVertical: 14,
  },
  yAxisRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    position: "relative",
  },
  axisLabel: {
    width: 48,
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
  },
  gridLine: {
    flex: 1,
    height: 1,
    position: "relative",
    justifyContent: "center",
  },
  noDataOverlayText: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 12,
    fontFamily: typography.fontFamily.emphasis,
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
  xAxisTimestamps: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    paddingLeft: 48,
  },
  timestampCol: {
    alignItems: "center",
  },
  timestampTick: {
    width: 1,
    height: 6,
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
  },
  timezoneFooter: {
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
    fontFamily: typography.fontFamily.regular,
  },
  deviceHistoryMeta: {
    fontSize: 13,
    marginBottom: 10,
    fontFamily: typography.fontFamily.regular,
  },
  deviceStatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  deviceStatText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  monthlySection: {
    width: "100%",
  },
  premiumCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  premiumHeaderRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  premiumText: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    fontFamily: typography.fontFamily.regular,
  },
  premiumGoldBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  premiumGoldBtnText: {
    color: "#451A03",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: typography.fontFamily.emphasis,
  },
  monthlyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  monthlyMonth: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  monthlyKwh: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
  },
  monthlyDownloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  monthlyDownloadText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
  },
  tariffSection: {
    width: "100%",
  },
  tariffHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  tariffSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
  },
  tariffEditBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tariffHighlightCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  tariffRateLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
  },
  tariffRateValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
    fontFamily: typography.fontFamily.emphasis,
  },
  tariffStatsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  tariffStatCell: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
  },
  tariffStatLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
  },
  tariffStatVal: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
    fontFamily: typography.fontFamily.emphasis,
  },
  tariffStatSub: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.fontFamily.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    fontFamily: typography.fontFamily.emphasis,
  },
  modalText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    fontFamily: typography.fontFamily.regular,
  },
  modalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalConfirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
