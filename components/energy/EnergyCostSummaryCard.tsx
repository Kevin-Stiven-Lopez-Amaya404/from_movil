import { typography } from "@/lib/theme/typography";
/**
 * EN-01: Costo estimado del mes, presupuesto, meta y tarifa vigente (SQL034).
 * Se muestra dentro de la pantalla Energía, debajo del consumo existente.
 * El cálculo lo hace el backend; aquí solo se muestra la respuesta.
 */
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { HomeRole } from "@/lib/domain/home";
import {
  barWidthPercent,
  currentMonthBogota,
  energyErrorMessage,
  formatCop,
  formatKwh,
  formatLocalDate,
  formatMonthLabel,
  formatPercent,
  formatTariff,
  getEnergyAccess,
  isForbiddenError,
  overLimitPercent,
  referenceDateForMonth,
  shiftMonth,
} from "@/lib/features/energy-sql034/energy-rules";
import { useEnergyQuery } from "@/lib/features/energy-sql034/use-energy-query";
import { energyService } from "@/lib/services/energy-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/energy.styles";

type Props = {
  homeId: string;
  homeRole?: HomeRole;
};

type UsageRowProps = {
  title: string;
  limitLabel: string | null;
  percent: string | null;
  unavailableText?: string;
};

/** Indicador de avance: porcentaje real (sin recortar) + barra limitada al ancho. */
export function UsageRow({
  title,
  limitLabel,
  percent,
  unavailableText,
}: UsageRowProps) {
  const theme = useAppTheme();

  if (limitLabel === null) {
    return (
      <View>
        <Text style={[styles.label, { color: theme.muted }]}>{title}</Text>
        <Text style={[styles.value, { color: theme.text }]}>No configurado</Text>
      </View>
    );
  }

  if (percent === null) {
    return (
      <View>
        <Text style={[styles.label, { color: theme.muted }]}>{title}</Text>
        <Text style={[styles.value, { color: theme.text }]}>{limitLabel}</Text>
        <Text style={[styles.note, { color: theme.muted }]}>
          {unavailableText ?? "Avance no disponible."}
        </Text>
      </View>
    );
  }

  const over = overLimitPercent(percent);
  const color = over ? theme.danger : theme.blue;

  return (
    <View
      accessible
      accessibilityLabel={`${title}: ${formatPercent(percent)} de ${limitLabel}${
        over ? `. Superaste el límite en ${formatPercent(over)}` : ""
      }`}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.label, { color: theme.muted }]}>{title}</Text>
        <Text style={[styles.label, { color: theme.text, fontWeight: "800" }]}>
          {formatPercent(percent)} de {limitLabel}
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: theme.chartGrid }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${barWidthPercent(percent)}%`, backgroundColor: color },
          ]}
        />
      </View>
      {over ? (
        <Text style={[styles.note, { color: theme.danger, fontWeight: "700" }]}>
          ⚠ Superaste el límite en {formatPercent(over)}
        </Text>
      ) : null}
    </View>
  );
}

export function EnergyCostSummaryCard({ homeId, homeRole }: Props) {
  const theme = useAppTheme();
  const router = useRouter();
  const access = getEnergyAccess(homeRole);
  const [month, setMonth] = useState(() => currentMonthBogota());
  const hasFocusedBefore = useRef(false);

  const query = useEnergyQuery(
    access.canRequest ? `${homeId}:${month}` : null,
    () =>
      Promise.all([
        energyService.getSummary(homeId, month),
        energyService.currentTariff(homeId, referenceDateForMonth(month)),
      ]),
  );
  const { reload } = query;

  // Al volver de registrar tarifa o editar meta, refrescar.
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedBefore.current) {
        reload();
      } else {
        hasFocusedBefore.current = true;
      }
    }, [reload]),
  );

  // GUEST o sin permiso (403): no se muestra nada económico.
  if (!access.canRequest || isForbiddenError(query.error)) {
    return null;
  }

  const summary = query.data?.[0] ?? null;
  const currentTariff = query.data?.[1]?.tariff ?? null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Costo estimado
        </Text>
        <Ionicons name="cash-outline" size={20} color={theme.blue} />
      </View>

      {/* Selector de mes */}
      <View style={styles.monthSelector}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
          onPress={() => setMonth((value) => shiftMonth(value, -1))}
          style={[styles.monthButton, { backgroundColor: theme.rowAlt }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: theme.text }]}>
          {formatMonthLabel(month)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
          onPress={() => setMonth((value) => shiftMonth(value, 1))}
          style={[styles.monthButton, { backgroundColor: theme.rowAlt }]}
        >
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </Pressable>
      </View>

      {query.loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={theme.blue} />
          <Text style={{ color: theme.muted }}>Consultando costo estimado...</Text>
        </View>
      ) : query.error ? (
        <View style={styles.centerBox}>
          <Text style={{ color: theme.danger, textAlign: "center" }}>
            {energyErrorMessage(query.error)}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={reload}
            style={[styles.secondaryButton, { borderColor: theme.border }]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : summary ? (
        <View>
          {/* Consumo del mes */}
          <Text style={[styles.label, { color: theme.muted }]}>
            Consumo del mes
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {formatKwh(summary.totalKwh)}
          </Text>
          {summary.readingsCount === 0 ? (
            <Text style={[styles.note, { color: theme.muted }]}>
              No hay consumo registrado para este mes.
            </Text>
          ) : null}

          {/* Costo: completo o incompleto */}
          {summary.costComplete && summary.estimatedCostCop !== null ? (
            <View>
              <Text style={[styles.label, { color: theme.muted }]}>
                Costo estimado
              </Text>
              <Text style={[styles.bigValue, { color: theme.text }]}>
                {formatCop(summary.estimatedCostCop)}
              </Text>
            </View>
          ) : (
            <View
              style={[styles.warningBox, { backgroundColor: theme.dangerSoft }]}
            >
              <Text style={{ color: theme.text, fontWeight: "800" }}>
                Costo incompleto: faltan tarifas para algunas lecturas
              </Text>
              <Text style={[styles.note, { color: theme.text }]}>
                Lecturas sin tarifa: {summary.unpricedReadings}
              </Text>
              <Text style={[styles.note, { color: theme.text }]}>
                Costo parcial estimado (no es el total):{" "}
                {formatCop(summary.partialCostCop)}
              </Text>
            </View>
          )}

          {/* Presupuesto y meta */}
          <UsageRow
            title="Presupuesto usado"
            limitLabel={
              summary.monthlyBudgetCop === null
                ? null
                : formatCop(summary.monthlyBudgetCop)
            }
            percent={summary.budgetUsagePercent}
            unavailableText="Avance no disponible porque el costo está incompleto."
          />
          <UsageRow
            title="Meta de consumo"
            limitLabel={
              summary.targetKwh === null ? null : formatKwh(summary.targetKwh)
            }
            percent={summary.targetUsagePercent}
          />

          {/* Tarifa vigente */}
          <Text style={[styles.label, { color: theme.muted }]}>
            Tarifa vigente
          </Text>
          {currentTariff ? (
            <Text style={[styles.value, { color: theme.text }]}>
              {formatTariff(currentTariff.unitPriceCopKwh)}
              <Text style={{ fontSize: typography.size.helper, fontWeight: "400", color: theme.muted }}>
                {"  "}desde {formatLocalDate(currentTariff.effectiveFrom)}
              </Text>
            </Text>
          ) : (
            <Text style={[styles.value, { color: theme.text }]}>
              Aún no hay tarifa registrada
            </Text>
          )}

          {!currentTariff && access.canManage ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/energy-tariff-new",
                  params: { homeId },
                })
              }
              style={[styles.primaryButton, { backgroundColor: theme.blue }]}
            >
              <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>
                Agregar tarifa
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: "/energy-tariffs", params: { homeId } })
            }
            style={[styles.secondaryButton, { borderColor: theme.border }]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Ver historial de tarifas
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/energy-goals",
                params: { homeId, month },
              })
            }
            style={[styles.secondaryButton, { borderColor: theme.border }]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Presupuesto y meta mensual
            </Text>
          </Pressable>

          <Text style={[styles.note, { color: theme.muted, marginTop: 12 }]}>
            Valor estimado con tarifa referencial. No incluye necesariamente
            todos los conceptos de la factura.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
