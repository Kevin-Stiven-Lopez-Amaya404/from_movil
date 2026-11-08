/**
 * EN-02: history of reference tariffs (COP/kWh) of a home.
 * Tariffs are immutable: there is no edit or delete.
 */
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/common/BackButton";
import { useSmartHome } from "@/lib/context/smart-home-context";
import {
  energyErrorMessage,
  formatLocalDate,
  formatTariff,
  getEnergyAccess,
  isForbiddenError,
  todayBogota,
} from "@/lib/features/energy-sql034/energy-rules";
import { useEnergyQuery } from "@/lib/features/energy-sql034/use-energy-query";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { energyService } from "@/lib/services/energy-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/energy.styles";

export default function EnergyTariffsScreen() {
  const { homeId } = useLocalSearchParams<{ homeId?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { accessibleHomes } = useSmartHome();
  const home = accessibleHomes.find((item) => item.id === homeId);
  const access = getEnergyAccess(home?.homeRole);
  const today = todayBogota();
  const hasFocusedBefore = useRef(false);

  const query = useEnergyQuery(
    home && access.canRequest ? `${home.id}:${home.homeRole}` : null,
    () =>
      Promise.all([
        energyService.listTariffs(home!.id),
        energyService.currentTariff(home!.id, today),
      ]),
  );
  const { reload } = query;

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedBefore.current) {
        reload();
      } else {
        hasFocusedBefore.current = true;
      }
    }, [reload]),
  );

  const tariffs = [...(query.data?.[0]?.tariffs ?? [])].sort((a, b) =>
    b.effectiveFrom.localeCompare(a.effectiveFrom),
  );
  const currentTariff = query.data?.[1]?.tariff ?? null;
  const currentId = currentTariff?.id ?? null;
  const blocked = !home || !access.canRequest || isForbiddenError(query.error);

  function goToNewTariff() {
    if (!home) return;
    router.push({ pathname: "/energy-tariff-new", params: { homeId: home.id } });
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View style={styles.header}>
            <BackButton color={theme.text} fallbackHref="/(tabs)/(main)/reports" />
            <View style={styles.headerTexts}>
              <Text
                accessibilityRole="header"
                style={[styles.title, { color: theme.text }]}
              >
                Historial de tarifas
              </Text>
              {home ? (
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                  {home.name}
                </Text>
              ) : null}
            </View>
          </View>

          {blocked ? (
            <View style={styles.centerBox}>
              <Text style={{ color: theme.muted, textAlign: "center" }}>
                No tienes permiso para ver las tarifas de este hogar.
              </Text>
            </View>
          ) : query.loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={theme.blue} />
              <Text style={{ color: theme.muted }}>Cargando tarifas...</Text>
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
          ) : (
            <View>
              {currentTariff ? (
                <View
                  accessible
                  accessibilityRole="summary"
                  accessibilityLabel={`Tarifa vigente: ${formatTariff(
                    currentTariff.unitPriceCopKwh,
                  )}, desde el ${formatLocalDate(currentTariff.effectiveFrom)}.`}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: theme.successSoft,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <Text style={[styles.label, { color: theme.text, marginTop: 0 }]}>
                      Tarifa vigente
                    </Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.success}
                      accessible={false}
                    />
                  </View>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {formatTariff(currentTariff.unitPriceCopKwh)}
                  </Text>
                  <Text style={[styles.note, { color: theme.muted }]}>
                    Desde el {formatLocalDate(currentTariff.effectiveFrom)}
                  </Text>
                </View>
              ) : tariffs.length > 0 ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={[
                    styles.warningBox,
                    { backgroundColor: theme.rowAlt, marginBottom: 12 },
                  ]}
                >
                  <Text style={[styles.note, { color: theme.text, marginTop: 0 }]}>
                    No hay una tarifa vigente para hoy. Revisa las fechas del historial.
                  </Text>
                </View>
              ) : null}

              <Text style={[styles.note, { color: theme.muted, marginBottom: 12 }]}>
                Las tarifas no se editan ni se eliminan. Para cambiar el precio,
                registra una nueva tarifa con la fecha desde la que aplica.
              </Text>

              {tariffs.length === 0 ? (
                <View
                  style={[
                    styles.centerBox,
                    {
                      backgroundColor: theme.rowAlt,
                      borderRadius: 16,
                      paddingHorizontal: 18,
                      paddingVertical: 22,
                    },
                  ]}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={30}
                    color={theme.blue}
                    accessible={false}
                  />
                  <Text style={{ color: theme.text, fontWeight: "700" }}>
                    Aún no hay tarifas registradas
                  </Text>
                  <Text style={[styles.note, { color: theme.muted, textAlign: "center" }]}>
                    Registra el precio por kWh y la fecha desde la que debe aplicarse.
                  </Text>
                  {access.canManage ? (
                    <Pressable
                      accessibilityLabel="Registrar primera tarifa"
                      accessibilityRole="button"
                      onPress={goToNewTariff}
                      style={[styles.primaryButton, { backgroundColor: theme.blue }]}
                    >
                      <Text
                        style={[styles.primaryButtonText, { color: theme.onPrimary }]}
                      >
                        Registrar primera tarifa
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : (
                <View>
                  {tariffs.map((tariff) => {
                    const isCurrent = tariff.id === currentId;
                    const isFuture = tariff.effectiveFrom > today;
                    return (
                      <View
                        key={tariff.id}
                        style={[
                          styles.listItem,
                          {
                            backgroundColor: theme.card,
                            borderColor: isCurrent ? theme.blue : theme.border,
                          },
                        ]}
                      >
                        <View style={styles.rowBetween}>
                          <Text style={[styles.value, { color: theme.text }]}>
                            {formatTariff(tariff.unitPriceCopKwh)}
                          </Text>
                          {isCurrent ? (
                            <View
                              style={[styles.badge, { backgroundColor: theme.successSoft }]}
                            >
                              <Text style={[styles.badgeText, { color: theme.text }]}>
                                Vigente
                              </Text>
                            </View>
                          ) : isFuture ? (
                            <View
                              style={[styles.badge, { backgroundColor: theme.rowAlt }]}
                            >
                              <Text style={[styles.badgeText, { color: theme.text }]}>
                                Programada
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={[styles.note, { color: theme.muted }]}>
                          Aplica desde el {formatLocalDate(tariff.effectiveFrom)}
                        </Text>
                      </View>
                    );
                  })}

                  {access.canManage ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={goToNewTariff}
                      style={[styles.primaryButton, { backgroundColor: theme.blue }]}
                    >
                      <Text
                        style={[styles.primaryButtonText, { color: theme.onPrimary }]}
                      >
                        Registrar nueva tarifa
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
