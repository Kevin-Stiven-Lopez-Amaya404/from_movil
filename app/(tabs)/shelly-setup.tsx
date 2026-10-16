
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useAndroidBackFallback } from "@/lib/navigation/use-android-back-fallback";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function ShellySetupScreen() {
  const router = useRouter();
  const { homeId, from } = useLocalSearchParams<{
    homeId?: string;
    from?: string;
  }>();

  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { accessibleHomes, homesLoadStatus } = useSmartHome();

  const home = accessibleHomes.find(
    (item) => item.id === homeId,
  );

  useAndroidBackFallback(
    from !== "add-device",
    homeId
      ? { pathname: "/(tabs)/add-device", params: { homeId } }
      : "/(tabs)/devices",
  );

  useEffect(() => {
    if (homesLoadStatus === "loaded" && (!homeId || !home)) {
      router.replace("/(tabs)/(main)/homes");
    }
  }, [home, homeId, homesLoadStatus, router]);

  function closeSetup() {
    if (from === "add-device" && router.canGoBack()) {
      router.back();
    } else if (homeId) {
      router.replace({
        pathname: "/(tabs)/add-device",
        params: { homeId },
      });
    } else {
      router.replace("/(tabs)/devices");
    }
  }

  const [step, setStep] = useState<0 | 1 | 2>(0);

  async function openShellyPanel() {
    try {
      await Linking.openURL("http://192.168.33.1");
    } catch {
      Alert.alert(
        "No se pudo abrir el panel",
        "Conéctate primero al Wi-Fi del Shelly y abre " +
          "http://192.168.33.1 en tu navegador.",
      );
    }
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom + 32,
        }}
      >
        <View
          style={[
            styles.content,
            { maxWidth: layout.contentWidth },
          ]}
        >
          <View style={styles.topRow}>
            <Text
              style={[
                styles.title,
                { color: theme.text },
              ]}
            >
              Configurar Shelly nuevo
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar asistente"
              onPress={closeSetup}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={25}
                color={theme.muted}
              />
            </Pressable>
          </View>

          <Text
            style={[
              styles.subtitle,
              { color: theme.muted },
            ]}
          >
            Configura un Shelly 1PM Gen4 sin utilizar
            la aplicación oficial.
          </Text>

          {homesLoadStatus === "loading" ? (
            <Text style={{ color: theme.muted }}>
              Cargando información del hogar...
            </Text>
          ) : !home || home.homeRole !== "OWNER" ? (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Text style={{ color: theme.text }}>
                Solo el propietario de un hogar puede
                configurar dispositivos nuevos.
              </Text>
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.homeLabel,
                  { color: theme.muted },
                ]}
              >
                Hogar: {home.name}
              </Text>

              <View style={styles.progressHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.text },
                  ]}
                >
                  Configuración inicial
                </Text>

                <Text style={{ color: theme.muted }}>
                  Paso {step + 1} de 3
                </Text>
              </View>

              <View style={styles.progressBar}>
                {[0, 1, 2].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressSegment,
                      {
                        backgroundColor:
                          index <= step
                            ? theme.blue
                            : theme.borderLight,
                      },
                    ]}
                  />
                ))}
              </View>

              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                {step === 0 ? (
                  <>
                    <Ionicons
                      name="hardware-chip-outline"
                      size={34}
                      color={theme.blue}
                    />

                    <Text
                      style={[
                        styles.cardTitle,
                        { color: theme.text },
                      ]}
                    >
                      Prepara tu dispositivo
                    </Text>

                    <Text
                      style={[
                        styles.description,
                        { color: theme.muted },
                      ]}
                    >
                      Verifica que el Shelly esté
                      instalado y alimentado conforme
                      a su manual.
                    </Text>

                    <Text
                      style={[
                        styles.description,
                        { color: theme.muted },
                      ]}
                    >
                      La instalación eléctrica debe
                      realizarla personal cualificado.
                      No manipules conexiones bajo tensión.
                    </Text>

                    <Text
                      style={[
                        styles.description,
                        { color: theme.muted },
                      ]}
                    >
                      Cuando el equipo esté encendido,
                      podrás conectarte a su red Wi-Fi
                      de configuración.
                    </Text>
                  </>
                ) : null}

                {step === 1 ? (
                  <>
                    <Ionicons
                      name="wifi-outline"
                      size={34}
                      color={theme.blue}
                    />

                    <Text
                      style={[
                        styles.cardTitle,
                        { color: theme.text },
                      ]}
                    >
                      Conecta al Wi-Fi del Shelly
                    </Text>

                    <Text
                      style={[
                        styles.description,
                        { color: theme.muted },
                      ]}
                    >
                      1. Abre los ajustes Wi-Fi de
                      Android.
                    </Text>

                    <Text
                      style={[
                        styles.description,
                        { color: theme.muted },
                      ]}
                    >
                      2. Conéctate a la red que anuncia
                      tu dispositivo Shelly.
                    </Text>

                    <Text
                      style={[
                        styles.description,
                        { color: theme.muted },
                      ]}
                    >
                      3. Abre su panel local y selecciona
                      la red Wi-Fi donde funcionará
                      SmartHome.
                    </Text>

                    <View
                      style={[
                        styles.addressBox,
                        { backgroundColor: theme.rowAlt },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: "700",
                        }}
                      >
                        http://192.168.33.1
                      </Text>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Abrir panel local Shelly"
                      onPress={() => void openShellyPanel()}
                      style={[
                        styles.primaryButton,
                        { backgroundColor: theme.blue },
                      ]}
                    >
                      <Ionicons
                        name="open-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.primaryText}>
                        Abrir panel del Shelly
                      </Text>
                    </Pressable>

                    <Text
                      style={[
                        styles.note,
                        { color: theme.muted },
                      ]}
                    >
                      SmartHome no recoge ni almacena
                      aquí la contraseña Wi-Fi.
                      Introduce esos datos directamente
                      en el panel local del dispositivo.
                    </Text>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={34}
                      color={theme.blue}
                    />

                    <Text
                      style={[
                        styles.cardTitle,
                        { color: theme.text },
                      ]}
                    >
                      Preparar vinculación
                    </Text>

                    <Text
                      style={[
                        styles.description,
                        { color: theme.muted },
                      ]}
                    >
                      Si ya configuraste la red Wi-Fi
                      del Shelly, vuelve a conectar
                      Android a tu red habitual.
                    </Text>

                    <Text
                      style={[
                        styles.description,
                        { color: theme.muted },
                      ]}
                    >
                      El backend deberá poder acceder
                      a la dirección IP del dispositivo
                      para identificarlo y configurar
                      su conexión MQTT.
                    </Text>

                    <View
                      style={[
                        styles.addressBox,
                        { backgroundColor: theme.rowAlt },
                      ]}
                    >
                      <Text
                        style={[
                          styles.note,
                          { color: theme.text },
                        ]}
                      >
                        Integración pendiente: este paso
                        todavía no identifica ni registra
                        el dispositivo en SmartHome.
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>

              <View style={styles.actions}>
                {step > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      setStep(step === 2 ? 1 : 0)
                    }
                    style={[
                      styles.secondaryButton,
                      { borderColor: theme.borderLight },
                    ]}
                  >
                    <Text style={{ color: theme.text }}>
                      Anterior
                    </Text>
                  </Pressable>
                ) : null}

                {step < 2 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      setStep(step === 0 ? 1 : 2)
                    }
                    style={[
                      styles.nextButton,
                      { backgroundColor: theme.blue },
                    ]}
                  >
                    <Text style={styles.primaryText}>
                      Continuar
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={closeSetup}
                    style={[
                      styles.nextButton,
                      { backgroundColor: theme.blue },
                    ]}
                  >
                    <Text style={styles.primaryText}>
                      Cerrar asistente
                    </Text>
                  </Pressable>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    width: "100%",
    alignSelf: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 23,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  homeLabel: {
    fontSize: 13,
    marginTop: 18,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  progressBar: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: 8,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  addressBox: {
    padding: 14,
    borderRadius: 12,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 12,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  note: {
    fontSize: 12,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
