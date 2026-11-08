import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { HomeRole } from "@/lib/domain/home";
import {
  currentMonthBogota,
  energyErrorMessage,
  formatCop,
  formatMonthLabel,
  getEnergyAccess,
  isForbiddenError,
} from "@/lib/features/energy-sql034/energy-rules";
import { useEnergyQuery } from "@/lib/features/energy-sql034/use-energy-query";
import { energyService } from "@/lib/services/energy-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/energy.styles";

type Props = {
  homeId: string;
  homeRole?: HomeRole;
};

/** Compact summary; detailed management lives in Tariffs and Goals. */
export function EnergyCostSummaryCard({ homeId, homeRole }: Props) {
  const theme = useAppTheme();
  const router = useRouter();
  const access = getEnergyAccess(homeRole);
  const [month, setMonth] = useState(() => currentMonthBogota());
  const hasFocusedBefore = useRef(false);

  const query = useEnergyQuery(
    access.canRequest ? `${homeId}:${homeRole}:${month}` : null,
    () => energyService.getSummary(homeId, month),
  );
  const { reload } = query;

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedBefore.current) {
        setMonth(currentMonthBogota());
        reload();
      } else {
        hasFocusedBefore.current = true;
      }
    }, [reload]),
  );

  if (!access.canRequest) return null;

  const summary = query.data;
  const forbidden = isForbiddenError(query.error);
  const hasCompleteCost = Boolean(
    summary?.costComplete && summary.estimatedCostCop !== null,
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.rowBetween}>
        <View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Resumen económico
          </Text>
          <Text style={[styles.note, { color: theme.muted }]}>
            {formatMonthLabel(month)}
          </Text>
        </View>
        <Ionicons name="cash-outline" size={20} color={theme.blue} />
      </View>

      {query.loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={theme.blue} />
          <Text style={{ color: theme.muted }}>Consultando costo estimado...</Text>
        </View>
      ) : forbidden ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.note, { color: theme.muted, textAlign: "center" }]}
        >
          No tienes permiso para consultar los costos de este hogar.
        </Text>
      ) : query.error ? (
        <View style={styles.centerBox}>
          <Text style={{ color: theme.danger, textAlign: "center" }}>
            {energyErrorMessage(query.error)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reintentar consulta de costos"
            onPress={reload}
            style={[styles.secondaryButton, { borderColor: theme.border }]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : summary ? (
        <>
          {summary.readingsCount === 0 ? (
            <Text style={[styles.note, { color: theme.muted }]}>
              No hay mediciones registradas este mes.
            </Text>
          ) : hasCompleteCost ? (
            <View>
              <Text style={[styles.label, { color: theme.muted }]}>
                Costo estimado
              </Text>
              <Text style={[styles.compactCostValue, { color: theme.text }]}>
                {formatCop(summary.estimatedCostCop!)}
              </Text>
            </View>
          ) : summary.costComplete ? (
            <Text style={[styles.note, { color: theme.muted }]}>
              El costo estimado no está disponible para este mes.
            </Text>
          ) : (
            <View style={[styles.warningBox, { backgroundColor: theme.dangerSoft }]}>
              <Text style={[styles.label, { color: theme.text, marginTop: 0 }]}>
                Costo parcial estimado: {formatCop(summary.partialCostCop)}
              </Text>
              <Text style={[styles.note, { color: theme.text }]}>
                No es el total: {summary.unpricedReadings} lecturas no tienen
                tarifa registrada.
              </Text>
            </View>
          )}

          <Text style={[styles.note, { color: theme.muted }]}>
            Estimación referencial; puede diferir del valor de la factura.
          </Text>
        </>
      ) : null}

      <View style={styles.costSummaryLinks}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver tarifas del hogar"
          accessibilityHint="Abre el historial y las opciones autorizadas de tarifas"
          onPress={() =>
            router.push({ pathname: "/energy-tariffs", params: { homeId } })
          }
          style={[
            styles.costSummaryLink,
            { borderColor: theme.border, backgroundColor: theme.rowAlt },
          ]}
        >
          <Ionicons name="receipt-outline" size={18} color={theme.blue} />
          <Text style={[styles.costSummaryLinkText, { color: theme.text }]}>
            Tarifas
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver presupuesto y metas del hogar"
          accessibilityHint="Abre el presupuesto y la meta de consumo del mes"
          onPress={() =>
            router.push({
              pathname: "/energy-goals",
              params: { homeId, month },
            })
          }
          style={[
            styles.costSummaryLink,
            { borderColor: theme.border, backgroundColor: theme.rowAlt },
          ]}
        >
          <Ionicons name="flag-outline" size={18} color={theme.blue} />
          <Text style={[styles.costSummaryLinkText, { color: theme.text }]}>
            Metas
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
