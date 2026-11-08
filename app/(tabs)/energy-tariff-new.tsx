/**
 * EN-03: record a new reference tariff (OWNER only).
 * Creates a new effective period; never modifies earlier tariffs.
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation, usePreventRemove } from "expo-router/react-navigation";
import { useRef, useState } from "react";
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
import { KeyboardAvoidingScreen } from "@/components/common/KeyboardAvoidingScreen";
import { useSmartHome } from "@/lib/context/smart-home-context";
import {
  energyErrorMessage,
  formatLocalDate,
  formatTariff,
  getEnergyAccess,
  isValidLocalDate,
  normalizeDecimalInput,
  todayBogota,
} from "@/lib/features/energy-sql034/energy-rules";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { energyService } from "@/lib/services/energy-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/energy.styles";

export default function EnergyTariffNewScreen() {
  const { homeId } = useLocalSearchParams<{ homeId?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { accessibleHomes } = useSmartHome();
  const home = accessibleHomes.find((item) => item.id === homeId);
  const access = getEnergyAccess(home?.homeRole);

  const [initialDate] = useState(() => todayBogota());
  const [price, setPrice] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(initialDate);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savingRef = useRef(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const priceResult = normalizeDecimalInput(price, "tariff");
  const dateValid = isValidLocalDate(effectiveFrom);
  const canSubmit = priceResult.ok && dateValid && !saving;
  const hasUnsavedChanges =
    !saved && (price.trim().length > 0 || effectiveFrom !== initialDate);

  usePreventRemove(hasUnsavedChanges || saving, ({ data }) => {
    if (saving || savingRef.current) return;

    Alert.alert("¿Descartar la nueva tarifa?", "Los datos escritos no se guardarán.", [
      { text: "Seguir editando", style: "cancel" },
      {
        text: "Descartar",
        style: "destructive",
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  function navigateBack() {
    if (router.canGoBack()) {
      router.back();
    } else if (homeId) {
      router.replace({ pathname: "/energy-tariffs", params: { homeId } });
    } else {
      router.replace("/(tabs)/(main)/reports");
    }
  }

  function handleSubmit() {
    setTouched(true);
    if (
      !home ||
      !priceResult.ok ||
      !dateValid ||
      saving ||
      savingRef.current
    ) {
      return;
    }
    const unitPriceCopKwh = priceResult.value;

    Alert.alert(
      "Confirmar nueva tarifa",
      `A partir del ${formatLocalDate(effectiveFrom)} se aplicará la tarifa de ${formatTariff(
        unitPriceCopKwh,
      )}. Las tarifas no se pueden editar ni eliminar después.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Guardar",
          onPress: async () => {
            if (savingRef.current) return;
            savingRef.current = true;
            setSaving(true);
            setServerError(null);
            try {
              await energyService.createTariff(home.id, {
                unitPriceCopKwh,
                effectiveFrom,
              });
              setSaved(true);
              Alert.alert(
                "Tarifa registrada",
                "La nueva tarifa quedó guardada.",
                [{ text: "Aceptar", onPress: navigateBack }],
                { cancelable: false },
              );
            } catch (error) {
              // The typed values are kept so they can be fixed and retried.
              setServerError(energyErrorMessage(error));
            } finally {
              savingRef.current = false;
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
      <KeyboardAvoidingScreen>
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
            <BackButton
              color={theme.text}
              fallbackHref={
                homeId
                  ? { pathname: "/(tabs)/energy-tariffs", params: { homeId } }
                  : "/(tabs)/(main)/reports"
              }
              accessibilityLabel="Volver al historial de tarifas"
            />
            <View style={styles.headerTexts}>
              <Text
                accessibilityRole="header"
                style={[styles.title, { color: theme.text }]}
              >
                Nueva tarifa
              </Text>
              {home ? (
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                  {home.name}
                </Text>
              ) : null}
            </View>
          </View>

          {!home || !access.canManage ? (
            <View style={styles.centerBox}>
              <Text style={{ color: theme.muted, textAlign: "center" }}>
                Solo el propietario del hogar puede registrar tarifas.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.label, { color: theme.text, marginTop: 0 }]}>
                Precio por kWh (COP)
              </Text>
              <TextInput
                accessibilityLabel="Precio por kilovatio hora en pesos"
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  setServerError(null);
                }}
                onBlur={() => setTouched(true)}
                keyboardType="decimal-pad"
                placeholder="Ej: 950,25"
                placeholderTextColor={theme.muted}
                editable={!saving}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
              />
              {touched && !priceResult.ok ? (
                <Text style={[styles.fieldError, { color: theme.danger }]}>
                  {priceResult.error}
                </Text>
              ) : null}

              <Text style={[styles.label, { color: theme.text }]}>
                Aplica desde (AAAA-MM-DD)
              </Text>
              <TextInput
                accessibilityLabel="Fecha desde la que aplica la tarifa, formato año guion mes guion día"
                value={effectiveFrom}
                onChangeText={(text) => {
                  setEffectiveFrom(text.trim());
                  setServerError(null);
                }}
                onBlur={() => setTouched(true)}
                keyboardType="numbers-and-punctuation"
                placeholder="2026-11-01"
                placeholderTextColor={theme.muted}
                maxLength={10}
                editable={!saving}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
              />
              {touched && !dateValid ? (
                <Text style={[styles.fieldError, { color: theme.danger }]}>
                  Escribe una fecha real con el formato AAAA-MM-DD.
                </Text>
              ) : null}
              <Text style={[styles.note, { color: theme.muted }]}>
                Puede ser una fecha pasada o futura. Calendario de Colombia.
              </Text>

              {priceResult.ok && dateValid ? (
                <View
                  style={[styles.warningBox, { backgroundColor: theme.rowAlt }]}
                >
                  <Text style={{ color: theme.text }}>
                    A partir del {formatLocalDate(effectiveFrom)} se aplicará esta
                    tarifa: {formatTariff(priceResult.value)}
                  </Text>
                </View>
              ) : null}

              {serverError ? (
                <Text
                  accessibilityLiveRegion="polite"
                  style={[styles.fieldError, { color: theme.danger, marginTop: 10 }]}
                >
                  {serverError}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmit, busy: saving }}
                disabled={!canSubmit}
                onPress={handleSubmit}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: theme.blue,
                    opacity: canSubmit ? 1 : 0.5,
                  },
                ]}
              >
                {saving ? (
                  <ActivityIndicator color={theme.onPrimary} />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>
                    Guardar tarifa
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingScreen>
    </SafeAreaView>
  );
}
