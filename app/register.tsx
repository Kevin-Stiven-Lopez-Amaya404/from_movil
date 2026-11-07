import { AuthCheckboxRow } from "@/components/auth/AuthCheckboxRow";
import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { Ionicons } from "@expo/vector-icons";
import {
    AuthPasswordField,
    AuthTextField,
} from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { registerUser } from "@/lib/auth/auth-store";
import {
  TERMS_DATE,
  TERMS_SECTIONS,
  TERMS_STATUS,
  TERMS_SUBTITLE,
  TERMS_TITLE,
  TERMS_VERSION,
} from "@/lib/legal/terms-content";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAuthPalette } from "@/lib/theme/appearance";

import { getPasswordRules, isValidEmail } from "@/lib/utils/validators";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { styles } from "../styles/register.styles";
import { styles as termsStyles } from "../styles/terms.styles";

export default function RegisterScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const palette = useAuthPalette();

  // ==========================================
  // ESTADO DEL FORMULARIO
  // ==========================================

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(true);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // DATOS NORMALIZADOS
  // ==========================================

  const cleanName = firstName.trim();
  const cleanEmail = email.trim().toLowerCase();

  // ==========================================
  // VALIDACIÓN DE CONTRASEÑA
  // ==========================================

  const passwordRules = useMemo(() => getPasswordRules(password), [password]);

  const strength = passwordRules.filter((rule) => rule.passed).length;
  const strengthLabel =
    strength === passwordRules.length
      ? "Fuerte"
      : strength >= 3
        ? "Buena"
        : strength > 0
          ? "En progreso"
          : "Completa los requisitos";
  const strengthColor =
    strength < 2
      ? palette.danger
      : strength < passwordRules.length
        ? palette.warning
        : palette.success;

  const passwordIsStrong =
    passwordRules.length > 0 && strength === passwordRules.length;

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // ==========================================
  // ERRORES
  // ==========================================

  const errors = {
    firstName: cleanName.length < 2 ? "Ingresa tu nombre." : "",

    email: !isValidEmail(cleanEmail) ? "Ingresa un correo válido." : "",

    password: !passwordIsStrong
      ? "La contraseña no cumple los requisitos."
      : "",

    confirmPassword: !passwordsMatch ? "Las contraseñas no coinciden." : "",

    terms: !acceptTerms ? "Debes aceptar los términos." : "",
  };

  const canSubmit = Object.values(errors).every((error) => !error);

  function visibleError(key: keyof typeof errors) {
    return submitted ? errors[key] : "";
  }

  // ==========================================
  // REGISTRO
  // ==========================================

  async function handleRegister() {
    setSubmitted(true);

    if (submitting) {
      return;
    }

    if (!canSubmit) {
      Alert.alert("Registro incompleto", "Revisa los campos marcados.");

      return;
    }

    setSubmitting(true);

    try {
      const result = await registerUser({
        email: cleanEmail,
        name: cleanName,
        password,
        passwordConfirmation: confirmPassword,
      });

      // ======================================
      // CORREO YA REGISTRADO
      // ======================================

      if (!result.ok) {
        Alert.alert(
          "No pudimos completar el registro",
          "Verifica el correo. Si ya tienes una cuenta, inicia sesión o recupera tu contraseña.",
          [
            { text: "Cerrar", style: "cancel" },
            {
              text: "Recuperar contraseña",
              onPress: () => router.push("/forgot-password"),
            },
            {
              text: "Iniciar sesión",
              onPress: () => router.replace("/login"),
            },
          ],
        );

        return;
      }

      // ======================================
      // REGISTRO EXITOSO
      // ======================================

      Alert.alert(
        "Revisa tu correo",
        "Te enviamos un enlace para activar tu cuenta. Ábrelo desde este teléfono para continuar.",
        [
          {
            text: "Entendido",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AuthScreenLayout
      compact={layout.compact}
      contentStyle={styles.screenContent}
      contentTopPadding={layout.compact ? 12 : 20}
    >
      {/* ====================================== */}
      {/* BOTÓN VOLVER                           */}
      {/* ====================================== */}

      <View style={styles.header}>
        <BackButton color={palette.link} fallbackHref="/welcome" />
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.introSection}>
        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            layout.tiny && styles.titleTiny,
            { color: palette.title },
          ]}
        >
          Crea tu cuenta
        </Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Empieza a disfrutar de un hogar conectado.
        </Text>
      </View>

      {/* ====================================== */}
      {/* FORMULARIO                             */}
      {/* ====================================== */}

      <View style={styles.formContainer}>
        {/* ==================================== */}
        {/* NOMBRE                               */}
        {/* ==================================== */}

        <AuthTextField
          error={visibleError("firstName")}
          inputStyle={styles.input}
          label="Nombre completo"
          onChangeText={setFirstName}
          placeholder="Tu nombre y apellido"
          value={firstName}
          variant="outlined"
          autoCapitalize="words"
          autoCorrect={false}
        />

        {/* ==================================== */}
        {/* CORREO                               */}
        {/* ==================================== */}

        <AuthTextField
          error={visibleError("email")}
          inputStyle={styles.input}
          keyboardType="email-address"
          label="Correo electrónico"
          onChangeText={setEmail}
          placeholder="nombre@correo.com"
          value={email}
          variant="outlined"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* ==================================== */}
        {/* CONTRASEÑA                            */}
        {/* ==================================== */}

        <View>
          <AuthPasswordField
            error={visibleError("password")}
            inputStyle={styles.input}
            label="Contraseña"
            onChangeText={setPassword}
            onToggleVisibility={() => setShowPassword((prev) => !prev)}
            placeholder="Crea una contraseña"
            showPassword={showPassword}
            value={password}
            variant="outlined"
          />

          <View
            accessibilityLabel={`Fortaleza de contraseña: ${strength} de ${passwordRules.length}. ${strengthLabel}.`}
            style={[
              styles.passwordGuidance,
              {
                backgroundColor: palette.card,
                borderColor:
                  palette.fieldBorder === "transparent"
                    ? palette.border
                    : palette.fieldBorder,
              },
            ]}
          >
            <View style={styles.strengthHeading}>
              <Text style={[styles.strengthTitle, { color: palette.text }]}>
                Seguridad de la contraseña
              </Text>
              <Text style={[styles.strengthLabel, { color: strengthColor }]}>
                {strengthLabel}
              </Text>
            </View>
            <View
              style={[styles.strengthTrack, { backgroundColor: palette.divider }]}
            >
              <View
                style={[
                  styles.strengthBar,
                  {
                    width: `${
                      passwordRules.length > 0
                        ? (strength / passwordRules.length) * 100
                        : 0
                    }%`,
                    backgroundColor: strengthColor,
                  },
                ]}
              />
            </View>

            <View style={styles.ruleGrid}>
              {passwordRules.map((rule) => (
                <View key={rule.label} style={styles.ruleItem}>
                  <Ionicons
                    color={rule.passed ? palette.success : palette.muted}
                    name={rule.passed ? "checkmark-circle" : "ellipse-outline"}
                    size={14}
                  />
                  <Text style={[styles.ruleText, { color: palette.muted }]}>
                    {rule.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ==================================== */}
        {/* CONFIRMAR CONTRASEÑA                  */}
        {/* ==================================== */}

        <AuthPasswordField
          error={visibleError("confirmPassword")}
          inputStyle={styles.input}
          label="Confirmar contraseña"
          onChangeText={setConfirmPassword}
          onToggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
          placeholder="Repite tu contraseña"
          showPassword={showConfirmPassword}
          value={confirmPassword}
          variant="outlined"
        />

        {/* ==================================== */}
        {/* TÉRMINOS                              */}
        {/* ==================================== */}

        <View>
          <View style={styles.termsSectionHeading}>
            <Text style={[styles.termsSectionTitle, { color: palette.text }]}>
              Términos y Condiciones
            </Text>
            <Text style={[styles.termsSectionHint, { color: palette.muted }]}>
              Lee el documento aquí antes de aceptar y crear tu cuenta.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              showTerms
                ? "Ocultar Términos y Condiciones"
                : "Leer Términos y Condiciones completos"
            }
            accessibilityHint={
              showTerms
                ? "Contrae el documento en el registro"
                : "Despliega el documento completo en esta pantalla"
            }
            accessibilityState={{ expanded: showTerms }}
            onPress={() => setShowTerms((previous) => !previous)}
            style={({ pressed }) => [
              styles.termsDocumentButton,
              {
                backgroundColor: palette.primarySoft,
                borderColor: palette.link,
              },
              pressed && styles.termsDocumentPressed,
            ]}
          >
            <Ionicons name="document-text-outline" size={22} color={palette.link} />
            <View style={styles.termsDocumentCopy}>
              <Text style={[styles.termsDocumentTitle, { color: palette.link }]}>
                {showTerms ? "Ocultar el documento" : "Leer el documento completo"}
              </Text>
              <Text style={[styles.termsDocumentHint, { color: palette.muted }]}>
                Términos y Condiciones · Versión {TERMS_VERSION}
              </Text>
            </View>
            <Ionicons
              name={showTerms ? "chevron-up" : "chevron-down"}
              size={18}
              color={palette.link}
            />
          </Pressable>

          {showTerms ? (
            <View
              style={[
                styles.termsInlineContent,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
              <Text
                accessibilityRole="header"
                style={[termsStyles.documentTitle, { color: palette.text }]}
              >
                {TERMS_TITLE}
              </Text>
              <Text style={[termsStyles.documentSubtitle, { color: palette.muted }]}>
                {TERMS_SUBTITLE}
              </Text>
              <Text style={[termsStyles.version, { color: palette.muted }]}>
                Versión: {TERMS_VERSION} · {TERMS_DATE}
              </Text>
              <Text style={[termsStyles.status, { color: palette.text }]}>
                Estado: {TERMS_STATUS}
              </Text>

              {TERMS_SECTIONS.map((section, index) => (
                <View
                  key={section.title}
                  style={[
                    termsStyles.section,
                    index === TERMS_SECTIONS.length - 1 && {
                      borderBottomWidth: 0,
                    },
                    { borderBottomColor: palette.divider },
                  ]}
                >
                  <Text
                    accessibilityRole="header"
                    style={[termsStyles.sectionTitle, { color: palette.text }]}
                  >
                    {index + 1}. {section.title}
                  </Text>
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <Text
                      key={`${section.title}-${paragraphIndex}`}
                      selectable
                      style={[termsStyles.paragraph, { color: palette.text }]}
                    >
                      {paragraph}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          <AuthCheckboxRow
            checked={acceptTerms}
            label={
              <Text style={[styles.termsText, { color: palette.text }]}>
                Acepto los Términos y Condiciones
              </Text>
            }
            onToggle={() => setAcceptTerms((previous) => !previous)}
          />

          {visibleError("terms") ? (
            <Text
              style={[styles.termsError, { color: palette.danger }]}
              accessibilityRole="alert"
            >
              {visibleError("terms")}
            </Text>
          ) : null}
        </View>

        {/* ==================================== */}
        {/* BOTÓN REGISTRO                        */}
        {/* ==================================== */}

        <PrimaryButton
          loading={submitting}
          onPress={handleRegister}
          text="Registrarse"
          style={styles.button}
        />

        {/* ==================================== */}
        {/* IR A LOGIN                            */}
        {/* ==================================== */}

        <Pressable
          onPress={() => router.replace("/login")}
          style={styles.loginRow}
          accessibilityRole="link"
          accessibilityLabel="Iniciar sesión"
        >
          <Text style={[styles.loginText, { color: palette.text }]}>¿Ya tienes cuenta? </Text>

          <Text style={[styles.loginText, styles.loginLink, { color: palette.link }]}>
            Inicia sesión
          </Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}
