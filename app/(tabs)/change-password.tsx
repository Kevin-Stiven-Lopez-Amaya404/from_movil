import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthPasswordField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";

import { getApiErrorMessage } from "@/lib/api/api-error";
import { changeUserPassword } from "@/lib/auth/auth-store";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { getPasswordRules } from "@/lib/utils/validators";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { styles } from "../../styles/(tabs)/change-password.styles";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  useAndroidBackFallback(from !== "profile", "/(tabs)/(main)/profile");

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
      await changeUserPassword(currentPassword, newPassword, confirmPassword);

      Alert.alert(
        "Contraseña actualizada",
        "Tu contraseña se ha cambiado correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => {
              returnToParent(
                router,
                from,
                "profile",
                "/(tabs)/(main)/profile",
              );
            },
          },
        ],
      );
    } catch (error: unknown) {
      Alert.alert(
        "No se pudo cambiar la contraseña",
        getApiErrorMessage(error),
      );
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
            onPress={() => {
              returnToParent(
                router,
                from,
                "profile",
                "/(tabs)/(main)/profile",
              );
            }}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: theme.rowAlt },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="close" size={21} color={theme.text} />
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
