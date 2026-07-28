import { AuthCheckboxRow } from "@/components/auth/AuthCheckboxRow";
import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { theme } from "@/constants/theme";
import { typography } from "@/lib/theme/typography";
import { isValidEmail } from "@/lib/utils/validators";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

/**
 * Pantalla de solicitud de código.
 *
 * Esta pantalla recopila país, correo y aceptación de términos para simular
 * el envío de un código de verificación. El flujo es de una app de ejemplo
 * sin backend real.
 */
import Svg, { Path } from "react-native-svg";

const COUNTRIES = [
  "Colombia",
  "México",
  "Argentina",
  "Chile",
  "Perú",
  "Ecuador",
  "Venezuela",
  "España",
  "Estados Unidos",
];

/**
 * Flecha del selector de pais.
 *
 * Se construye con SVG para no depender de otro icono y poder cambiar su forma
 * segun el estado abierto/cerrado del desplegable.
 */
function DownArrow({ open }: { open: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path
        d={open ? "M4 11.5 9 6.5l5 5" : "M4 6.5l5 5 5-5"}
        fill="none"
        stroke="#0B0B0B"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
      />
    </Svg>
  );
}

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Estados del flujo inicial de recuperacion.
  const [country, setCountry] = useState("");
  const [showCountry, setShowCountry] = useState(false);
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  /**
   * Valida los datos necesarios para solicitar el codigo.
   *
   * En esta version no se envia correo real porque no existe backend. Si los
   * datos son validos, se navega a OTP pasando el email como parametro.
   */
  function handleSendCode() {
    const cleanEmail = email.trim().toLowerCase();

    if (!country) {
      Alert.alert("País requerido", "Selecciona tu país.");
      return;
    }

    if (!cleanEmail) {
      Alert.alert("Correo requerido", "Ingresa tu correo electrónico.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      Alert.alert("Correo inválido", "Ingresa un correo electrónico válido.");
      return;
    }

    if (!acceptTerms) {
      Alert.alert(
        "Términos requeridos",
        "Debes aceptar las condiciones del servicio y la política de privacidad.",
      );
      return;
    }

    router.push({
      pathname: "/otp-verification",
      params: { email: cleanEmail },
    });
  }

  return (
    <AuthScreenLayout contentStyle={styles.content} title="Smart Home">
      <BackButton fallbackHref="/login" />

      <Pressable
        style={styles.sectionLink}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.sectionLinkText}>Iniciar sesión</Text>
      </Pressable>

      <View style={styles.fieldGroup}>
        {/* Selector de país personalizado que abre una lista interna al tocarlo. */}
        <Pressable
          style={styles.selectButton}
          onPress={() => setShowCountry((value) => !value)}
        >
          <Text style={[styles.fieldText, !country && styles.placeholderText]}>
            {country || "Seleccionar país"}
          </Text>
          <DownArrow open={showCountry} />
        </Pressable>

        {showCountry && (
          <View style={styles.optionList}>
            {COUNTRIES.map((item) => (
              <Pressable
                key={item}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.optionPressed,
                  country === item && styles.optionSelected,
                ]}
                onPress={() => {
                  setCountry(item);
                  setShowCountry(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    country === item && styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <AuthTextField
          containerStyle={styles.fieldContainer}
          inputStyle={styles.input}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          placeholderTextColor={theme.colors.placeholder}
          value={email}
        />
      </View>

      <AuthCheckboxRow
        checked={acceptTerms}
        label={
          <Text style={styles.termsText}>
            Acepto las <Text style={styles.inlineLink}>condiciones del servicio</Text> y la{" "}
            <Text style={styles.inlineLink}>política de privacidad</Text> de Smart Home.
          </Text>
        }
        labelStyle={styles.checkboxLabel}
        onToggle={() => setAcceptTerms((value) => !value)}
      />

      <Pressable style={styles.forgotLink}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </Pressable>

      <PrimaryButton onPress={handleSendCode} style={styles.primaryButton} text="Enviar código" />
    </AuthScreenLayout>
  );
}

const authFont = typography.fontFamily.emphasis;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundWhite,
  },
  flex: {
    flex: 1,
  },
  container: {
    alignItems: "center",
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  title: {
    color: "#0864C8",
    fontFamily: authFont,
    fontSize: 42,
    fontWeight: "700",
    lineHeight: 50,
    marginBottom: 32,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 36,
    lineHeight: 43,
    marginBottom: 22,
  },
  sectionLink: {
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  sectionLinkText: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 27,
    textDecorationLine: "underline",
  },
  fieldGroup: {
    gap: 18,
    marginBottom: 30,
  },
  fieldContainer: {
    width: '100%',
  },
  checkboxLabel: {
    flex: 1,
  },
  selectButton: {
    height: 54,
    alignItems: "center",
    backgroundColor: "#FBFBFD",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 18,
    paddingRight: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  fieldText: {
    color: "#3F3F3F",
    flex: 1,
    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",
  },
  placeholderText: {
    color: "#3F3F3F",
  },
  optionList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    maxHeight: 205,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
  },
  option: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  optionPressed: {
    backgroundColor: "#EEF4FF",
  },
  optionSelected: {
    backgroundColor: "#E9F1FE",
  },
  optionText: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 17,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: "#0864C8",
  },
  input: {
    height: 54,
    backgroundColor: "#FBFBFD",
    borderRadius: 16,
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  termsRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: "center",
    backgroundColor: "#D8DADC",
    borderRadius: 5,
    justifyContent: "center",
    marginTop: 4,
  },
  checkboxOn: {
    backgroundColor: "#0864C8",
  },
  termsText: {
    flex: 1,
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  inlineLink: {
    color: "#0864C8",
    textDecorationLine: "underline",
  },
  forgotLink: {
    alignSelf: "flex-start",
    marginBottom: 28,
  },
  forgotText: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 25,
    textDecorationLine: "underline",
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#0864C8",
    borderRadius: 15,
    height: 54,
    justifyContent: "center",
  },
  primaryButtonPressed: {
    backgroundColor: "#004FA5",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: authFont,
    fontSize: 24,
    fontWeight: "700",
  },
});
