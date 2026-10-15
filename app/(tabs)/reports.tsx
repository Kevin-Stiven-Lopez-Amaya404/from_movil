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

  const activeHomeName = selectedHome?.name ?? "Hogar";
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
        ? Symbol(`consumption-query:${activeHomeId}:${historyPeriod}`)
        : null,
    [activeHomeId, historyPeriod],
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
    Boolean(activeHomeId) && !visibleRankingState;

  const rankingItems = visibleRankingState?.data?.topDevices ?? [];

  const rankingMaxKwh =
    rankingItems[0]?.totalEnergyDeltaKwh ?? 0;

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
    hasCurrentHomeData &&
    !visibleError &&
    dailyRecords.length > 0 &&
    !exportingPdf &&
    !exportingCsv;
  const canExportPdf =
    Boolean(selectedHome) &&
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
      consumptionService.getHomeDaily(homeId, query),
    ])
      .then(([summary, daily]) => {
        if (!active) return;

        setRealConsumptionKwh(summary.totalEnergyDeltaKwh);
        setRealReadingsCount(summary.readingsCount);

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
  ]);

  useEffect(() => {
    const homeId = activeHomeId;

    if (!homeId || consumptionQueryKey === null) {
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
  ]);


  const consumptionLabel =
    visibleError
      ? "No fue posible consultar el consumo"
      : visibleReadingsCount === 0
        ? "Sin mediciones registradas"
        : visibleReadingsCount !== null &&
            visibleReadingsCount > 0 &&
            visibleRealConsumptionKwh !== null
          ? `${(visibleRealConsumptionKwh * 1000).toFixed(2)} Wh registrados`
          : "Datos de consumo no disponibles";

  const chartPoints = visibleDailySeries.filter(
    (point) => Number.isFinite(point.value) && point.value >= 0,
  );

  const chartMaxKwh = chartPoints.reduce(
    (max, point) => Math.max(max, point.value),
    0,
  );

  // Estados de la pestaña "Historia"
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
                          if (period !== historyPeriod) {
                            // Invalidar el resumen y el historial anteriores.
                            setLoadedQueryKey(null);

                            // Invalidar el ranking anterior.
                            setRankingQueryState(null);

                            // Activar el nuevo periodo.
                            setHistoryPeriod(period);
                          }

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

            </View>

            {/* Gráfica de consumo diario registrado */}
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
                  Consumo diario registrado
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Exportar informe de consumo en CSV"
                  accessibilityState={{ disabled: !canExportCsv }}
                  disabled={!canExportCsv}
                  onPress={() => void handleExportCsv()}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: theme.rowAlt,
                    opacity: canExportCsv ? 1 : 0.45,
                  }}
                >
                  <Ionicons
                    name="download-outline"
                    size={17}
                    color={theme.text}
                  />
                  <Text style={{ color: theme.text, fontSize: 12 }}>
                    {exportingCsv ? "Preparando..." : "Exportar CSV"}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Exportar informe de consumo en PDF"
                  accessibilityState={{ disabled: !canExportPdf }}
                  disabled={!canExportPdf}
                  onPress={() => void handleExportPdf()}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: theme.rowAlt,
                    opacity: canExportPdf ? 1 : 0.45,
                  }}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={17}
                    color={theme.text}
                  />
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 12,
                    }}
                  >
                    {exportingPdf ? "Preparando..." : "Exportar PDF"}
                  </Text>
                </Pressable>
              </View>

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
                  Mayor consumo por dispositivo
                </Text>

                <Text
                  style={{
                    color: theme.muted,
                    fontSize: 12,
                    marginTop: 4,
                    marginBottom: 16,
                  }}
                >
                  Hasta 5 dispositivos · {historyPeriod}
                </Text>

                {!activeHomeId ? (
                  <Text style={{ color: theme.muted }}>
                    Selecciona un hogar para consultar su consumo.
                  </Text>
                ) : isRankingLoading ? (
                  <Text style={{ color: theme.muted }}>
                    Consultando el consumo de los dispositivos...
                  </Text>
                ) : visibleRankingState?.error ? (
                  <Text style={{ color: theme.danger }}>
                    {visibleRankingState.error}
                  </Text>
                ) : rankingItems.length === 0 ? (
                  <Text style={{ color: theme.muted }}>
                    {visibleRankingState?.data?.deviceCount === 0
                      ? "Este hogar no tiene dispositivos activos."
                      : visibleRankingState?.data?.measuredDeviceCount === 0
                        ? "No hay mediciones de dispositivos en este periodo."
                        : "No hay consumo positivo registrado en este periodo."}
                  </Text>
                ) : (
                  rankingItems.map((device, index) => {
                    const percentage =
                      rankingMaxKwh > 0
                        ? (device.totalEnergyDeltaKwh / rankingMaxKwh) * 100
                        : 0;

                    return (
                      <View
                        key={device.deviceId}
                        style={{
                          marginBottom:
                            index === rankingItems.length - 1 ? 0 : 16,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            numberOfLines={1}
                            style={{
                              flex: 1,
                              color: theme.text,
                              fontSize: 13,
                              fontWeight: "500",
                            }}
                          >
                            {index + 1}. {device.deviceName}
                          </Text>

                          <Text
                            style={{
                              color: theme.text,
                              fontSize: 13,
                              fontWeight: "600",
                            }}
                          >
                            {device.totalEnergyDeltaKwh.toLocaleString(
                              "es-CO",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 3,
                              },
                            )}{" "}
                            kWh
                          </Text>
                        </View>

                        <View
                          style={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: theme.rowAlt,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${percentage}%` as `${number}%`,
                              borderRadius: 3,
                              backgroundColor: theme.blue,
                            }}
                          />
                        </View>
                      </View>
                    );
                  })
                )}
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
                  Consumo registrado del hogar
                </Text>
              </View>

              <Text style={[styles.deviceHistoryMeta, { color: theme.muted }]}>
                Consumo energético de los dispositivos monitoreados de{" "}
                {activeHomeName} durante el período seleccionado.
              </Text>
              <View
                style={[
                  styles.deviceStatBadge,
                  { backgroundColor: theme.rowAlt },
                ]}
              >
                <Ionicons name="flash-outline" size={16} color={theme.blue} />
                <Text style={[styles.deviceStatText, { color: theme.text }]}>
                  {isLoading ? "Consultando consumo real…" : consumptionLabel}
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
  chartEmptyText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 48,
    fontFamily: typography.fontFamily.regular,
  },
  energyBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  energyBarColumn: {
    minWidth: 94,
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
    width: 64,
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  energyBar: {
    width: 32,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
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
