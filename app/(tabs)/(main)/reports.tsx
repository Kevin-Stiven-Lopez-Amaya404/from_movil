/**
 * Pantalla de Análisis Energético y Reportes.
 *
 * Sub-pestañas disponibles:
 * Historia: Selector desplegable (24h, Día, 7d, Semana, 30d, Mes), selector de fecha,
 *    gráfica de telemetría horaria en Wh/kWh, zona horaria (America/Bogota) y tarjetas de descarga.
 */
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DeviceConsumptionRankingCard } from "@/components/energy/DeviceConsumptionRankingCard";
import { EnergyExportCard } from "@/components/energy/EnergyExportCard";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import {
  consumptionService,
  type HomeDailyConsumptionRecord,
} from "@/lib/services/consumption-service";
import {
  loadDeviceConsumptionRanking,
  type DeviceConsumptionRankingResult,
} from "@/lib/services/device-consumption-ranking";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { buildHomeConsumptionCsv } from "@/lib/utils/consumption-csv";
import { buildHomeConsumptionPdfHtml } from "@/lib/utils/consumption-pdf";
import { shareConsumptionCsv } from "@/lib/utils/share-consumption-csv";
import { shareConsumptionPdf } from "@/lib/utils/share-consumption-pdf";

type HistoryPeriod =
  | "Últimos 7 días"
  | "Últimos 30 días"
  | "Todo el historial";

const HISTORY_PERIODS: HistoryPeriod[] = [
  "Últimos 7 días",
  "Últimos 30 días",
  "Todo el historial",
];

function getConsumptionRange(period: HistoryPeriod) {
  if (period === "Todo el historial") {
    return undefined;
  }

  const now = new Date();
  const days = period === "Últimos 7 días" ? 7 : 30;

  const from = new Date(
    now.getTime() - days * 24 * 60 * 60 * 1000,
  );

  return {
    from: from.toISOString(),
    to: now.toISOString(),
  };
}

export default function ReportsScreen() {
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  const {
    accessibleHomes,
    activeHomeId,
    setActiveHomeId,
  } = useSmartHome();
  const selectedHome = accessibleHomes.find(
    (home) => home.id === activeHomeId,
  );
  const isGuest = selectedHome?.homeRole === "GUEST";
  const canViewDetails =
    selectedHome?.homeRole === "OWNER" ||
    selectedHome?.homeRole === "MEMBER";
  const [focusRefreshVersion, setFocusRefreshVersion] =
    useState(0);
  const hasFocusedBefore = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedBefore.current) {
        setFocusRefreshVersion((value) => value + 1);
      } else {
        hasFocusedBefore.current = true;
      }
    }, []),
  );

  const [realConsumptionKwh, setRealConsumptionKwh] =
  useState<number | null>(null);
  const [realReadingsCount, setRealReadingsCount] = useState<number | null>(
    null,
  );
  const [historyPeriod, setHistoryPeriod] =
    useState<HistoryPeriod>("Últimos 7 días");
  const [dailySeries, setDailySeries] = useState<
    { label: string; value: number }[]
  >([]);
  const [dailyRecords, setDailyRecords] = useState<
    HomeDailyConsumptionRecord[]
  >([]);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [homeSelectorOpen, setHomeSelectorOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedQueryKey, setLoadedQueryKey] = useState<symbol | null>(null);
  const [rankingQueryState, setRankingQueryState] = useState<{
    queryKey: symbol;
    data: DeviceConsumptionRankingResult | null;
    error: string | null;
  } | null>(null);

  const hasRealConsumptionSource = Boolean(activeHomeId);
  const consumptionQueryKey = useMemo(
    () =>
      activeHomeId
        ? Symbol(
            `consumption-query:${activeHomeId}:${selectedHome?.homeRole ?? "UNKNOWN"}:${historyPeriod}:${focusRefreshVersion}`,
          )
        : null,
    [
      activeHomeId,
      selectedHome?.homeRole,
      historyPeriod,
      focusRefreshVersion,
    ],
  );
  const consumptionRange = useMemo(
    () =>
      activeHomeId
        ? getConsumptionRange(historyPeriod)
        : undefined,
    [activeHomeId, historyPeriod],
  );

  const visibleRankingState =
    rankingQueryState?.queryKey === consumptionQueryKey
      ? rankingQueryState
      : null;

  const isRankingLoading =
    Boolean(activeHomeId) &&
    canViewDetails &&
    !visibleRankingState;

  const hasCurrentHomeData =
    consumptionQueryKey !== null && loadedQueryKey === consumptionQueryKey;

  const visibleRealConsumptionKwh = hasCurrentHomeData
    ? realConsumptionKwh
    : null;
  const visibleReadingsCount = hasCurrentHomeData
    ? realReadingsCount
    : null;

  const visibleDailySeries = useMemo(
    () => (hasCurrentHomeData ? dailySeries : []),
    [hasCurrentHomeData, dailySeries],);
  const visibleError = hasCurrentHomeData ? error : null;
  const isLoading = hasRealConsumptionSource && !hasCurrentHomeData;
  const canExportCsv =
    Boolean(selectedHome) &&
    canViewDetails &&
    hasCurrentHomeData &&
    !visibleError &&
    dailyRecords.length > 0 &&
    !exportingPdf &&
    !exportingCsv;
  const canExportPdf =
    Boolean(selectedHome) &&
    canViewDetails &&
    hasCurrentHomeData &&
    !visibleError &&
    realConsumptionKwh !== null &&
    realReadingsCount !== null &&
    Boolean(visibleRankingState?.data) &&
    !exportingPdf &&
    !exportingCsv;

  useEffect(() => {
    const homeId = activeHomeId;

    if (!homeId || consumptionQueryKey === null) {
      return;
    }

    let active = true;

    const query = consumptionRange;
    const requestKey = consumptionQueryKey;

    Promise.all([
      consumptionService.getHomeSummary(homeId, query),
      canViewDetails
        ? consumptionService.getHomeDaily(homeId, query)
        : Promise.resolve([] as HomeDailyConsumptionRecord[]),
    ])
      .then(([summary, daily]) => {
        if (!active) return;

        setRealConsumptionKwh(summary.totalEnergyDeltaKwh);
        setRealReadingsCount(summary.readingsCount ?? null);

        const mappedSeries = [...daily]
          .sort((a, b) =>
            a.periodStart.localeCompare(b.periodStart),
          )
          .map((record) => {
            const [year, month, day] = record.periodStart
              .slice(0, 10)
              .split("-")
              .map(Number);

            const date = new Date(year, month - 1, day);

            if (Number.isNaN(date.getTime())) {
              return null;
            }

            return {
              label: date.toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "short",
              }),
              value: record.totalEnergyDeltaKwh,
            };
          })
          .filter(
            (point): point is { label: string; value: number } =>
              point !== null,
          );

        setDailyRecords([...daily]);
        setDailySeries(mappedSeries);
        setError(null);
        setLoadedQueryKey(requestKey);
      })
      .catch(() => {
        if (!active) return;

        setRealConsumptionKwh(null);
        setRealReadingsCount(null);
        setDailySeries([]);
        setDailyRecords([]);
        setError("No se pudo cargar el consumo real del hogar.");
        setLoadedQueryKey(requestKey);
      });

    return () => {
      active = false;
    };
  }, [
    activeHomeId,
    historyPeriod,
    consumptionRange,
    consumptionQueryKey,
    canViewDetails,
  ]);

  useEffect(() => {
    const homeId = activeHomeId;

    if (!homeId || consumptionQueryKey === null || !canViewDetails) {
      return;
    }

    let active = true;
    const requestKey = consumptionQueryKey;
    const query = consumptionRange;

    loadDeviceConsumptionRanking(homeId, query)
      .then((data) => {
        if (!active) return;

        setRankingQueryState({
          queryKey: requestKey,
          data,
          error: null,
        });
      })
      .catch(() => {
        if (!active) return;

        setRankingQueryState({
          queryKey: requestKey,
          data: null,
          error:
            "No se pudo consultar el consumo de los dispositivos.",
        });
      });

    return () => {
      active = false;
    };
  }, [
    activeHomeId,
    historyPeriod,
    consumptionRange,
    consumptionQueryKey,
    canViewDetails,
  ]);


  const chartPoints = visibleDailySeries.filter(
    (point) => Number.isFinite(point.value) && point.value >= 0,
  );

  const chartMaxKwh = chartPoints.reduce(
    (max, point) => Math.max(max, point.value),
    0,
  );

  // Estados de la pestaña "Historia"
  async function handleExportCsv(): Promise<void> {
    if (!canExportCsv || !selectedHome) {
      return;
    }

    setExportingCsv(true);

    try {
      const csvContent = buildHomeConsumptionCsv({
        homeName: selectedHome.name,
        periodLabel: historyPeriod,
        records: dailyRecords,
      });

      await shareConsumptionCsv(csvContent);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo generar el informe de consumo.";

      Alert.alert("Error al exportar", message);
    } finally {
      setExportingCsv(false);
    }
  }

  async function handleExportPdf(): Promise<void> {
    const rankingData = visibleRankingState?.data;

    if (
      !canExportPdf ||
      !selectedHome ||
      realConsumptionKwh === null ||
      realReadingsCount === null ||
      !rankingData
    ) {
      return;
    }

    setExportingPdf(true);

    try {
      const html = buildHomeConsumptionPdfHtml({
        homeName: selectedHome.name,
        periodLabel: historyPeriod,
        totalEnergyDeltaKwh: realConsumptionKwh,
        readingsCount: realReadingsCount,
        records: [...dailyRecords],
        ranking: rankingData,
      });

      await shareConsumptionPdf(html);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo generar el informe PDF.";

      Alert.alert("Error al exportar PDF", message);
    } finally {
      setExportingPdf(false);
    }
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
              accessibilityRole="button"
              accessibilityLabel={`Seleccionar hogar. Actual: ${selectedHome?.name ?? "ninguno"}`}
              accessibilityState={{
                disabled: accessibleHomes.length === 0,
                expanded: homeSelectorOpen,
              }}
              disabled={accessibleHomes.length === 0}
              onPress={() => setHomeSelectorOpen((open) => !open)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                maxWidth: "65%",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: theme.rowAlt,
                opacity: accessibleHomes.length === 0 ? 0.5 : 1,
              }}
            >
              <Ionicons
                name="home-outline"
                size={17}
                color={theme.text}
              />

              <Text
                numberOfLines={1}
                style={{
                  flexShrink: 1,
                  color: theme.text,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {selectedHome?.name ?? "Sin hogar"}
              </Text>

              <Ionicons
                name={homeSelectorOpen ? "chevron-up" : "chevron-down"}
                size={15}
                color={theme.muted}
              />
            </Pressable>
          </View>

          {homeSelectorOpen && (
            <View
              style={{
                width: "100%",
                padding: 4,
                marginBottom: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.borderLight,
                backgroundColor: theme.card,
              }}
            >
              {accessibleHomes.map((home) => {
                const isSelected = home.id === activeHomeId;

                return (
                  <Pressable
                    key={home.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      if (!isSelected) {
                        // Invalidar la información anterior antes
                        // de cambiar el hogar seleccionado.
                        setLoadedQueryKey(null);
                        setRankingQueryState(null);
                        setActiveHomeId(home.id);
                      }

                      setHomeSelectorOpen(false);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      borderRadius: 9,
                      backgroundColor: isSelected
                        ? theme.rowAlt
                        : "transparent",
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        flex: 1,
                        color: theme.text,
                        fontSize: 14,
                        fontWeight: isSelected ? "600" : "400",
                      }}
                    >
                      {home.name}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={19}
                        color={theme.blue}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ============================================================ */}
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: theme.card,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <Text
              style={[
                styles.summaryHeading,
                { color: theme.muted },
              ]}
            >
              Consumo del período
            </Text>

            <View style={styles.summaryValueRow}>
              <Ionicons
                name="flash-outline"
                size={28}
                color={theme.blue}
              />

              <Text
                style={[
                  styles.summaryValue,
                  { color: theme.text },
                ]}
              >
                {isLoading || !hasCurrentHomeData
                  ? "—"
                  : visibleRealConsumptionKwh === null
                    ? "—"
                    : visibleRealConsumptionKwh.toLocaleString(
                        "es-CO",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 3,
                        },
                      )}
              </Text>

              <Text
                style={[
                  styles.summaryUnit,
                  { color: theme.muted },
                ]}
              >
                kWh
              </Text>
            </View>

            <View style={styles.summaryFooter}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={theme.muted}
              />

              <Text style={{ color: theme.muted, fontSize: 12 }}>
                {historyPeriod}
              </Text>
            </View>

            {isLoading ? (
              <Text style={[styles.summaryNote, { color: theme.muted }]}>
                Consultando consumo...
              </Text>
            ) : visibleError ? (
              <Text style={[styles.summaryNote, { color: theme.danger }]}>
                {visibleError}
              </Text>
            ) : hasCurrentHomeData &&
              visibleRealConsumptionKwh !== null ? (
              <Text style={[styles.summaryNote, { color: theme.muted }]}>
                {isGuest
                  ? "Resumen de consumo del hogar"
                  : visibleReadingsCount === null
                    ? "Datos de medición no disponibles"
                    : visibleReadingsCount + " mediciones registradas"}
              </Text>
            ) : null}
          </View>

          {/* PESTAÑA 1: HISTORIA (IMÁGENES 2 Y 3)                         */}
          {/* ============================================================ */}
          <View style={styles.historySection}>
            <View style={styles.periodRow}>
              {HISTORY_PERIODS.map((period) => {
                const selected = historyPeriod === period;

                const label =
                  period === "Últimos 7 días"
                    ? "7 días"
                    : period === "Últimos 30 días"
                      ? "30 días"
                      : "Todo";

                return (
                  <Pressable
                    key={period}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      if (selected) return;

                      setLoadedQueryKey(null);
                      setRankingQueryState(null);
                      setHistoryPeriod(period);
                    }}
                    style={[
                      styles.periodButton,
                      {
                        backgroundColor: selected
                          ? theme.blue
                          : theme.card,
                        borderColor: selected
                          ? theme.blue
                          : theme.borderLight,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: selected ? "#FFFFFF" : theme.text,
                        fontSize: 13,
                        fontWeight: "800",
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {canViewDetails ? (
              <>
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
                <Text
                  style={[
                    styles.chartCardTitle,
                    { color: theme.text },
                  ]}
                >
                  Consumo diario
                </Text>
              </View>

              {/* Área de la Gráfica */}
              <View style={styles.chartArea}>
                {!activeHomeId ? (
                  <Text style={[styles.chartEmptyText, { color: theme.muted }]}>
                    Selecciona un hogar para consultar su consumo.
                  </Text>
                ) : isLoading ? (
                  <Text style={[styles.chartEmptyText, { color: theme.muted }]}>
                    Cargando consumo registrado...
                  </Text>
                ) : visibleError ? (
                  <Text style={[styles.chartEmptyText, { color: theme.danger }]}>
                    {visibleError}
                  </Text>
                ) : chartPoints.length === 0 ? (
                  <Text style={[styles.chartEmptyText, { color: theme.muted }]}>
                    {visibleReadingsCount === 0
                      ? "Aún no hay mediciones registradas."
                      : "No hay registros diarios disponibles para graficar."}
                  </Text>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.energyBarsRow}
                  >
                    {chartPoints.map((point, index) => {
                      const barHeight =
                        chartMaxKwh > 0 && point.value > 0
                          ? Math.max(
                              3,
                              Math.round((point.value / chartMaxKwh) * 120),
                            )
                          : 0;

                      const energyLabel =
                        point.value >= 1
                          ? `${point.value.toFixed(2)} kWh`
                          : `${(point.value * 1000).toFixed(2)} Wh`;

                      return (
                        <View
                          key={`${point.label}-${index}`}
                          style={styles.energyBarColumn}
                        >
                          <Text
                            style={[
                              styles.energyValueLabel,
                              { color: theme.text },
                            ]}
                          >
                            {energyLabel}
                          </Text>

                          <View
                            style={[
                              styles.energyBarTrack,
                              { borderBottomColor: theme.borderLight },
                            ]}
                          >
                            <View
                              style={[
                                styles.energyBar,
                                {
                                  height: barHeight,
                                  backgroundColor: theme.blue,
                                },
                              ]}
                            />
                          </View>

                          <Text
                            style={[
                              styles.energyDayLabel,
                              { color: theme.muted },
                            ]}
                          >
                            {point.label}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {/* Pie de zona horaria */}
              <Text style={[styles.timezoneFooter, { color: theme.muted }]}>
                Los consumos diarios se agrupan según el backend.
              </Text>
            </View>

                <DeviceConsumptionRankingCard
                  period={historyPeriod}
                  loading={isRankingLoading}
                  error={visibleRankingState?.error ?? null}
                  data={visibleRankingState?.data ?? null}
                />

                <EnergyExportCard
                  canExportCsv={canExportCsv}
                  canExportPdf={canExportPdf}
                  exportingCsv={exportingCsv}
                  exportingPdf={exportingPdf}
                  onExportCsv={() => void handleExportCsv()}
                  onExportPdf={() => void handleExportPdf()}
                />
              </>

          ) : isGuest ? (
            <View
              style={[
                styles.cardContainer,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Text style={{ color: theme.muted, fontSize: 13 }}>
                Puedes consultar el consumo total del hogar.
                El detalle por día y dispositivo está reservado
                para propietarios y miembros.
              </Text>
            </View>
            ) : null}
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
  summaryHeading: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
  },
  summaryValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  summaryValue: {
    fontSize: 35,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  summaryUnit: {
    fontSize: 16,
    fontWeight: "700",
  },
  summaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 14,
  },
  summaryNote: {
    fontSize: 12,
    marginTop: 10,
  },
  periodRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
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
  chartEmptyText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 48,
    fontFamily: typography.fontFamily.regular,
  },
  energyBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  energyBarColumn: {
    minWidth: 70,
    alignItems: "center",
  },
  energyValueLabel: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: typography.fontFamily.emphasis,
  },
  energyBarTrack: {
    height: 128,
    width: 52,
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  energyBar: {
    width: 28,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  energyDayLabel: {
    marginTop: 10,
    fontSize: 11,
    textAlign: "center",
    fontFamily: typography.fontFamily.regular,
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
