
import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useAndroidBackFallback } from "@/lib/navigation/use-android-back-fallback";
import { readShellyLocalIdentity } from "@/lib/pairing/shelly-local-identity";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/prepare-shelly.styles";

type VerificationState =
  | "checking"
  | "verified"
  | "error";

const VERIFICATION_TIMEOUT_MS = 6000;
const MAX_NAME_LENGTH = 100;

export default function PrepareShellyScreen() {
  const router = useRouter();

  const {
    homeId,
    ip,
    manufacturerDeviceId,
    returnTo,
    from,
  } = useLocalSearchParams<{
    homeId?: string;
    ip?: string;
    manufacturerDeviceId?: string;
    returnTo?: string;
    from?: string;
  }>();

  const { accessibleHomes, homesLoadStatus } =
    useSmartHome();

  const theme = useAppTheme();
  const layout = useResponsiveLayout();

  const home = accessibleHomes.find(
    (item) => item.id === homeId,
  );

  const canPrepare = home?.homeRole === "OWNER";

  const searchRoute = homeId
    ? {
        pathname: "/(tabs)/add-device" as const,
        params: {
          homeId,
          returnTo:
            returnTo === "home-detail"
              ? "home-detail"
              : "devices",
        },
      }
    : ("/(tabs)/devices" as const);

  useAndroidBackFallback(
    from !== "add-device",
    searchRoute,
  );

  useEffect(() => {
    if (
      homesLoadStatus === "loaded" &&
      (!homeId || !home)
    ) {
      router.replace("/(tabs)/(main)/homes");
    }
  }, [homeId, home, homesLoadStatus, router]);

  const [verification, setVerification] =
    useState<VerificationState>("checking");

  const [verificationError, setVerificationError] =
    useState<string | null>(null);

  const [deviceName, setDeviceName] = useState("");
  const [confirmedName, setConfirmedName] =
    useState<string | null>(null);

  const checkRun = useRef(0);

  const requestController =
    useRef<AbortController | null>(null);

  const verifySelectedDevice = useCallback(async () => {
    const run = ++checkRun.current;

    requestController.current?.abort();

    const controller = new AbortController();
    requestController.current = controller;

    const timeout = setTimeout(
      () => controller.abort(),
      VERIFICATION_TIMEOUT_MS,
    );

    setVerification("checking");
    setVerificationError(null);
    setConfirmedName(null);

    try {
      if (!ip || !manufacturerDeviceId) {
        throw new Error(
          "No se recibió la identificación del Shelly. " +
          "Vuelve a buscarlo.",
        );
      }

      // Verificar nuevamente la identidad del equipo.
      const identity = await readShellyLocalIdentity(
        ip,
        controller.signal,
      );

      if (
        identity.manufacturerDeviceId !==
        manufacturerDeviceId
      ) {
        throw new Error(
          "La identidad del dispositivo cambió. " +
          "Vuelve a buscarlo.",
        );
      }

      if (run !== checkRun.current) return;

      setVerification("verified");
    } catch (error) {
      if (run !== checkRun.current) return;

      setVerification("error");

      setVerificationError(
        error instanceof Error &&
        error.name === "AbortError"
          ? "No se pudo comprobar el Shelly a tiempo."
          : error instanceof Error
            ? error.message
            : "No se pudo identificar el dispositivo.",
      );
    } finally {
      clearTimeout(timeout);

      if (
        requestController.current === controller
      ) {
        requestController.current = null;
      }
    }
  }, [ip, manufacturerDeviceId]);

  useEffect(() => {
    if (
      !canPrepare ||
      homesLoadStatus !== "loaded"
    ) {
      return;
    }

    void verifySelectedDevice();

    return () => {
      checkRun.current += 1;
      requestController.current?.abort();
      requestController.current = null;
    };
  }, [
    canPrepare,
    homesLoadStatus,
    verifySelectedDevice,
  ]);

  function backToSearch() {
    if (
      from === "add-device" &&
      router.canGoBack()
    ) {
      router.back();
    } else {
      router.replace(searchRoute);
    }
  }

  const trimmedName = deviceName.trim();

  const nameIsValid =
    trimmedName.length > 0 &&
    trimmedName.length <= MAX_NAME_LENGTH;

  const canConfirm =
    canPrepare &&
    verification === "verified" &&
    nameIsValid;

  const isConfirmed = Boolean(
    confirmedName &&
    confirmedName === trimmedName,
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View
          style={[
            styles.content,
            { maxWidth: layout.contentWidth },
          ]}
        >
          {/* Encabezado */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar preparación del dispositivo"
              onPress={backToSearch}
              style={[
                styles.backButton,
                { backgroundColor: theme.rowAlt },
              ]}
            >
              <Ionicons
                name="close"
                size={21}
                color={theme.text}
              />
            </Pressable>

            <Text
              style={[
                styles.title,
                { color: theme.text },
              ]}
            >
              Preparar dispositivo
            </Text>
          </View>

          {/* Dispositivo seleccionado */}
          <Text
            style={[
              styles.kicker,
              { color: theme.muted },
            ]}
          >
            Dispositivo seleccionado
          </Text>

          <View style={styles.deviceHeadline}>
            <View
              style={[
                styles.deviceIcon,
                { backgroundColor: theme.rowAlt },
              ]}
            >
              <Ionicons
                name="hardware-chip-outline"
                size={25}
                color={theme.blue}
              />
            </View>

            <View style={styles.deviceHeadingText}>
              <Text
                style={[
                  styles.deviceName,
                  { color: theme.text },
                ]}
              >
                Shelly 1PM Gen4
              </Text>

              <Text
                style={[
                  styles.deviceStatus,
                  { color: theme.muted },
                ]}
              >
                {verification === "checking"
                  ? "Comprobando el dispositivo..."
                  : verification === "verified"
                    ? "Modelo compatible"
                    : "Verificación pendiente"}
              </Text>
            </View>

            {verification === "checking" ? (
              <ActivityIndicator color={theme.blue} />
            ) : verification === "verified" ? (
              <Ionicons
                name="checkmark-circle-outline"
                size={23}
                color={theme.blue}
              />
            ) : null}
          </View>

          {/* Error de identificación */}
          {verification === "error" ? (
            <View style={styles.errorSection}>
              <Text
                style={[
                  styles.helperText,
                  { color: theme.danger },
                ]}
              >
                {verificationError}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  void verifySelectedDevice()
                }
                style={styles.retryButton}
              >
                <Text
                  style={{
                    color: theme.blue,
                    fontWeight: "700",
                  }}
                >
                  Reintentar verificación
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View
            style={[
              styles.divider,
              { backgroundColor: theme.borderLight },
            ]}
          />

          {/* Hogar seleccionado */}
          <Text
            style={[
              styles.label,
              { color: theme.muted },
            ]}
          >
            Hogar seleccionado
          </Text>

          <View style={styles.homeRow}>
            <Ionicons
              name="home-outline"
              size={19}
              color={theme.blue}
            />

            <Text
              style={[
                styles.homeName,
                { color: theme.text },
              ]}
            >
              {home?.name ?? "No disponible"}
            </Text>
          </View>

          {/* Nombre del dispositivo */}
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
                marginTop: 26,
              },
            ]}
          >
            Nombre del dispositivo
          </Text>

          <TextInput
            accessibilityLabel="Nombre del dispositivo Shelly"
            value={deviceName}
            onChangeText={(value) => {
              setDeviceName(value);
              setConfirmedName(null);
            }}
            placeholder="Ej. Luz de la sala"
            placeholderTextColor={theme.muted}
            maxLength={MAX_NAME_LENGTH}
            autoCapitalize="sentences"
            autoCorrect={false}
            editable={Boolean(canPrepare)}
            style={[
              styles.nameInput,
              {
                color: theme.text,
                backgroundColor: theme.card,
                borderColor: theme.borderLight,
              },
            ]}
          />

          <Text
            style={[
              styles.helperText,
              { color: theme.muted },
            ]}
          >
            Así se identificará cuando se complete
            su vinculación al hogar.
          </Text>

          {/* Confirmación local */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Confirmar nombre del dispositivo"
            disabled={!canConfirm}
            onPress={() => {
              if (canConfirm) {
                setConfirmedName(trimmedName);
              }
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.blue },
              !canConfirm && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              Confirmar nombre
            </Text>
          </Pressable>

          {isConfirmed ? (
            <View style={styles.confirmation}>
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color={theme.blue}
              />

              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: "800",
                  }}
                >
                  Nombre preparado: {confirmedName}
                </Text>

                <Text
                  style={[
                    styles.helperText,
                    { color: theme.muted },
                  ]}
                >
                  Este dato está solo en esta pantalla;
                  todavía no se ha guardado ni vinculado
                  al hogar.
                </Text>
              </View>
            </View>
          ) : null}

          {/* Integración pendiente */}
          <Text
            style={[
              styles.pendingNote,
              { color: theme.muted },
            ]}
          >
            El registro definitivo estará disponible
            después de integrar el backend y verificar
            la conexión MQTT. Por ahora esta pantalla
            no modifica el Shelly ni crea registros.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
