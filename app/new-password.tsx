import { CheckIcon } from "@/components/icons/CheckIcon";
import { BackButton } from "@/components/navigation/BackButton";
import { updateUserPassword } from "@/lib/auth-store";
import { useResponsiveLayout } from "@/lib/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const BLUE = "#0864C8";
const TEXT = "#3F3F3F";

export default function NewPasswordScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const params = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);

  function handleFinish() {
    if (!password.trim()) {
      Alert.alert("Contraseña requerida", "Ingresa tu nueva contraseña.");
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert("Contraseña corta", "La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    const updated = updateUserPassword(String(params.email ?? ""), password.trim());

    if (!updated) {
      Alert.alert(
        "Solicitud inválida",
        "No encontramos una cuenta asociada a esta recuperación.",
      );
      return;
    }

    Alert.alert("Contraseña actualizada", "Ya puedes entrar a tu cuenta.", [
      { text: "Continuar", onPress: () => router.replace("/login") },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingHorizontal: layout.gutter,
              paddingTop: layout.compact ? 34 : 78,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
            <BackButton fallbackHref="/forgot-password" />
            <Text style={[styles.title, layout.compact && styles.titleCompact]}>Smart Home</Text>

            <Text style={styles.sectionTitle}>Establecer contraseña</Text>

            <View style={styles.passwordBox}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                placeholderTextColor={TEXT}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable style={styles.iconButton} onPress={() => setPassword("")}>
                <Ionicons name="close" size={20} color="#000000" />
              </Pressable>
              <Pressable
                accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={styles.iconButton}
                onPress={() => setShowPassword((value) => !value)}
              >
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={21} color="#000000" />
              </Pressable>
            </View>

            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberPassword((value) => !value)}
            >
              <View style={[styles.checkbox, rememberPassword && styles.checkboxOn]}>
                {rememberPassword && <CheckIcon />}
              </View>
              <Text style={styles.rememberText}>Recordar contraseña</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              onPress={handleFinish}
            >
              <Text style={styles.primaryButtonText}>Finalizado</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const serifFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia",
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    color: BLUE,
    fontFamily: serifFont,
    fontSize: 38,
    fontWeight: "700",
    lineHeight: 46,
    marginBottom: 32,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 34,
    lineHeight: 41,
    marginBottom: 24,
  },
  sectionTitle: {
    color: TEXT,
    fontFamily: serifFont,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 25,
    marginBottom: 24,
    textDecorationLine: "underline",
  },
  passwordBox: {
    alignItems: "center",
    backgroundColor: "#FBFBFD",
    borderRadius: 14,
    flexDirection: "row",
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  passwordInput: {
    color: TEXT,
    flex: 1,
    fontFamily: serifFont,
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 0,
  },
  iconButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    marginLeft: 8,
    width: 32,
  },
  rememberRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: "center",
    backgroundColor: "#D8DADC",
    borderRadius: 5,
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: BLUE,
  },
  rememberText: {
    color: TEXT,
    flex: 1,
    fontFamily: serifFont,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: BLUE,
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    marginTop: 42,
  },
  primaryButtonPressed: {
    backgroundColor: "#004FA5",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: serifFont,
    fontSize: 23,
    fontWeight: "700",
  },
});
