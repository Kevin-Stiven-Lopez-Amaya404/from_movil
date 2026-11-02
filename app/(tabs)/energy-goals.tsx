/**
 * EN-04 / EN-05: Presupuesto (COP) y meta (kWh) mensual del hogar.
 * Vista para OWNER y MEMBER con permiso; edición solo OWNER.
 * El PUT reemplaza ambos campos: el que quede vacío se envía como null.
 */
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/common/BackButton";
import { useSmartHome } from "@/lib/context/smart-home-context";
import type { Goal } from "@/lib/features/energy-sql034/types";
import {
  currentMonthBogota,
  energyErrorMessage,
  formatCop,
  formatIsoDateBogota,
  formatKwh,
  formatMonthLabel,
  getEnergyAccess,
  isForbiddenError,
  isValidMonth,
  normalizeOptionalDecimalInput,
  shiftMonth,
  trimDecimalZeros,
} from "@/lib/features/energy-sql034/energy-rules";
import { useEnergyQuery } from "@/lib/features/energy-sql034/use-energy-query";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { energyService } from "@/lib/services/energy-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/energy.styles";

export default function EnergyGoalsScreen() {
  const params = useLocalSearchParams<{ homeId?: string; month?: string }>();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { accessibleHomes } = useSmartHome();
  const home = accessibleHomes.find((item) => item.id === params.homeId);
  const access = getEnergyAccess(home?.homeRole);

  const [month, setMonth] = useState(() =>
    params.month && isValidMonth(params.month)
      ? params.month
      : currentMonthBogota(),
  );
  const [editing, setEditing] = useState(false);
  const [budgetText, setBudgetText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const query = useEnergyQuery(
    home && access.canRequest ? `${home.id}:${month}` : null,
    () => energyService.getGoal(home!.id, month),
  );
  const goal: Goal | null = query.data?.goal ?? null;
  const blocked = !home || !access.canRequest || isForbiddenError(query.error);

  const budgetResult = normalizeOptionalDecimalInput(budgetText, "budget");
  const targetResult = normalizeOptionalDecimalInput(targetText, "target");
  const bothEmpty =
    budgetResult.ok &&
    targetResult.ok &&
    budgetResult.value === null &&
    targetResult.value === null;
  const formValid = budgetResult.ok && targetResult.ok && !bothEmpty;

  function changeMonth(delta: number) {
    if (saving) return;
    setEditing(false);
    setServerError(null);
    setMonth((value) => shiftMonth(value, delta));
  }

  function startEditing() {
    setBudgetText(trimDecimalZeros(goal?.monthlyBudgetCop));
    setTargetText(trimDecimalZeros(goal?.targetKwh));
    setTouched(false);
    setServerError(null);
    setEditing(true);
  }

  function handleSave() {
    setTouched(true);
    if (!home || !budgetResult.ok || !targetResult.ok || bothEmpty || saving) {
      return;
    }
    const body = {
      monthlyBudgetCop: budgetResult.value,
      targetKwh: targetResult.value,
    };

    Alert.alert(
      "Confirmar cambios",
      `Se reemplazará la configuración de ${formatMonthLabel(month)}.\n\nPresupuesto: ${
        body.monthlyBudgetCop === null ? "No configurado" : formatCop(body.monthlyBudgetCop)
      }\nMeta: ${body.targetKwh === null ? "No configurada" : formatKwh(body.targetKwh)}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Guardar",
          onPress: async () => {
            setSaving(true);
            setServerError(null);
            try {
              await energyService.saveGoal(home.id, month, body);
              setEditing(false);
              query.reload();
            } catch (error) {
              setServerError(energyErrorMessage(error));
              const serverCode = (error as { serverCode?: string })?.serverCode;
              if (serverCode === "ENERGY_GOAL_CONCURRENT_WRITE") {
                // Otra sesión cambió el mes: se recargan los datos actuales.
                query.reload();
              }
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
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
              <Text style={[styles.title, { color: theme.text }]}>
                Presupuesto y meta
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
                No tienes permiso para ver el presupuesto de este hogar.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              {/* Selector de mes */}
              <View style={[styles.monthSelector, { marginTop: 0 }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Mes anterior"
                  onPress={() => changeMonth(-1)}
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
                  onPress={() => changeMonth(1)}
                  style={[styles.monthButton, { backgroundColor: theme.rowAlt }]}
                >
                  <Ionicons name="chevron-forward" size={20} color={theme.text} />
                </Pressable>
              </View>

              {query.loading ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator color={theme.blue} />
                </View>
              ) : query.error ? (
                <View style={styles.centerBox}>
                  <Text style={{ color: theme.danger, textAlign: "center" }}>
                    {energyErrorMessage(query.error)}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={query.reload}
                    style={[styles.secondaryButton, { borderColor: theme.border }]}
                  >
                    <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                      Reintentar
                    </Text>
                  </Pressable>
                </View>
              ) : editing ? (
                /* ---------------- Formulario (OWNER) ---------------- */
                <View>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Presupuesto mensual (COP)
                  </Text>
                  <TextInput
                    accessibilityLabel="Presupuesto mensual en pesos"
                    value={budgetText}
                    onChangeText={(text) => {
                      setBudgetText(text);
                      setServerError(null);
                    }}
                    keyboardType="decimal-pad"
                    placeholder="Ej: 120000"
                    placeholderTextColor={theme.muted}
                    editable={!saving}
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  />
                  {touched && !budgetResult.ok ? (
                    <Text style={[styles.fieldError, { color: theme.danger }]}>
                      {budgetResult.error}
                    </Text>
                  ) : null}

                  <Text style={[styles.label, { color: theme.text }]}>
                    Meta de consumo (kWh)
                  </Text>
                  <TextInput
                    accessibilityLabel="Meta de consumo en kilovatios hora"
                    value={targetText}
                    onChangeText={(text) => {
                      setTargetText(text);
                      setServerError(null);
                    }}
                    keyboardType="decimal-pad"
                    placeholder="Ej: 125"
                    placeholderTextColor={theme.muted}
                    editable={!saving}
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  />
                  {touched && !targetResult.ok ? (
                    <Text style={[styles.fieldError, { color: theme.danger }]}>
                      {targetResult.error}
                    </Text>
                  ) : null}

                  <Text style={[styles.note, { color: theme.muted }]}>
                    Puedes configurar solo el presupuesto, solo la meta o ambos.
                    Deja vacío el que no quieras usar.
                  </Text>
                  {touched && bothEmpty ? (
                    <Text style={[styles.fieldError, { color: theme.danger }]}>
                      Debes indicar el presupuesto, la meta de kWh o ambos.
                    </Text>
                  ) : null}
                  {serverError ? (
                    <Text
                      accessibilityLiveRegion="polite"
                      style={[styles.fieldError, { color: theme.danger, marginTop: 8 }]}
                    >
                      {serverError}
                    </Text>
                  ) : null}

                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: saving, busy: saving }}
                    disabled={saving}
                    onPress={handleSave}
                    style={[
                      styles.primaryButton,
                      {
                        backgroundColor: theme.blue,
                        opacity: formValid && !saving ? 1 : 0.5,
                      },
                    ]}
                  >
                    {saving ? (
                      <ActivityIndicator color={theme.onPrimary} />
                    ) : (
                      <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>
                        Guardar
                      </Text>
                    )}
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={saving}
                    onPress={() => setEditing(false)}
                    style={[styles.secondaryButton, { borderColor: theme.border }]}
                  >
                    <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                      Cancelar
                    </Text>
                  </Pressable>
                </View>
              ) : (
                /* ---------------- Vista ---------------- */
                <View>
                  {goal === null ? (
                    <Text style={[styles.value, { color: theme.text, marginTop: 10 }]}>
                      Este mes aún no tiene presupuesto ni meta
                    </Text>
                  ) : null}

                  <Text style={[styles.label, { color: theme.muted }]}>
                    Presupuesto mensual
                  </Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {goal?.monthlyBudgetCop
                      ? formatCop(goal.monthlyBudgetCop)
                      : "No configurado"}
                  </Text>

                  <Text style={[styles.label, { color: theme.muted }]}>
                    Meta de consumo
                  </Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {goal?.targetKwh ? formatKwh(goal.targetKwh) : "No configurada"}
                  </Text>

                  {goal ? (
                    <Text style={[styles.note, { color: theme.muted }]}>
                      Última actualización: {formatIsoDateBogota(goal.updatedAt)}
                    </Text>
                  ) : null}

                  {access.canManage ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={startEditing}
                      style={[styles.primaryButton, { backgroundColor: theme.blue }]}
                    >
                      <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>
                        {goal ? "Editar configuración" : "Configurar"}
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
