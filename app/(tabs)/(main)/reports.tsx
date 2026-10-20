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
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
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

import { buildHomeConsumptionCsv } from "@/lib/utils/consumption-csv";
import { buildHomeConsumptionPdfHtml } from "@/lib/utils/consumption-pdf";
import { shareConsumptionCsv } from "@/lib/utils/share-consumption-csv";
import { shareConsumptionPdf } from "@/lib/utils/share-consumption-pdf";
import { styles } from "../../../styles/(tabs)/(main)/reports.styles";

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
      edges={["top", "left", "right"]}
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop + 12,
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
