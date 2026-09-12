import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthPasswordField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { profileFont } from "@/components/profile/profileTheme";
import { updateUserPassword } from "@/lib/auth/auth-store";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { getPasswordRules } from "@/lib/utils/validators";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { sessionEmail } = useSmartHome();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordRules = getPasswordRules(newPassword);
  const strength = passwordRules.filter((rule) => rule.passed).length;
  const passwordIsStrong =
    passwordRules.length > 0 && strength === passwordRules.length;
  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;

  async function handleSave() {
    if (!currentPassword.trim()) {
      Alert.alert(
        "Contraseña actual requerida",
        "Ingresa tu contraseña actual.",
      );
      return;
    }

    if (!passwordIsStrong) {
      Alert.alert(
        "Contraseña inválida",
        "La nueva contraseña no cumple los requisitos.",
      );
      return;
    }

    if (!passwordsMatch) {
      Alert.alert(
        "Contraseñas distintas",
        "La nueva contraseña y la confirmación deben coincidir.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const updated = await updateUserPassword(sessionEmail, newPassword);

      if (!updated) {
        Alert.alert(
          "No se pudo actualizar",
          "No encontramos este usuario en el sistema.",
        );
        return;
      }

      Alert.alert(
        "Contraseña actualizada",
        "Tu contraseña se ha cambiado correctamente.",
        [{ text: "Aceptar", onPress: () => router.back() }],
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo cambiar la contraseña en este momento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
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
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={17} color={theme.blue} />
            <Text style={[styles.backText, { color: theme.blue }]}>Volver</Text>
          </Pressable>

          <View style={styles.header}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: theme.rowAlt,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={theme.blue}
              />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                Cambiar contraseña
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Actualiza tu acceso a la cuenta
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <AuthPasswordField
              inputStyle={styles.input}
              onChangeText={setCurrentPassword}
              onToggleVisibility={() => setShowCurrent((value) => !value)}
              placeholder="Contraseña actual"
              showPassword={showCurrent}
              value={currentPassword}
            />

            <AuthPasswordField
              inputStyle={styles.input}
              onChangeText={setNewPassword}
              onToggleVisibility={() => setShowNew((value) => !value)}
              placeholder="Nueva contraseña"
              showPassword={showNew}
              value={newPassword}
            />

            {newPassword.length > 0 && (
              <View
                style={styles.strengthContainer}
                accessibilityLabel={`Fortaleza de contraseña: ${strength} de ${passwordRules.length}`}
              >
                <View
                  style={[
                    styles.strengthBar,
                    {
                      width: `${passwordRules.length > 0 ? (strength / passwordRules.length) * 100 : 0}%`,
                      backgroundColor:
                        strength < 2
                          ? "#FF4D4D"
                          : strength < passwordRules.length
                            ? "#FFA500"
                            : "#003380",
                    },
                  ]}
                />
              </View>
            )}

            <AuthPasswordField
              inputStyle={styles.input}
              onChangeText={setConfirmPassword}
              onToggleVisibility={() => setShowNew((value) => !value)}
              placeholder="Confirmar contraseña"
              showPassword={showNew}
              value={confirmPassword}
            />

            <PrimaryButton
              loading={submitting}
              onPress={handleSave}
              style={styles.button}
              text="Guardar cambios"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    fontFamily: profileFont,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 18,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  headerCopy: { flex: 1, marginLeft: 12 },
  title: {
    fontFamily: profileFont,
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    fontFamily: profileFont,
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
    paddingTop: 18,
  },
  input: {
    backgroundColor: "#FBFBFD",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 17,
    color: "#3F3F3F",
    fontFamily: profileFont,
    fontSize: 15,
    fontWeight: "500",
    height: 56,
    paddingHorizontal: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 12,
  },
  strengthContainer: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    height: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  strengthBar: {
    borderRadius: 999,
    height: "100%",
  },
  button: {
    marginTop: 8,
  },
  pressed: { opacity: 0.72 },
});
