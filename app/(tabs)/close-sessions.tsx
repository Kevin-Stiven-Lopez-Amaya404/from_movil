import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import { authenticateUser } from "@/lib/auth/auth-store";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function CloseSessionsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { activeDevices, closeActiveDevices, sessionEmail } = useSmartHome();
  const devices = activeDevices.slice(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const allSelected =
    devices.length > 0 && selectedIds.length === devices.length;

  function toggleDevice(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : devices.map((device) => device.id));
  }

  function requestCloseSessions() {
    if (selectedIds.length === 0) return;

    setPassword("");
    setPasswordError(false);
    setPasswordModalVisible(true);
  }

  async function confirmCloseSessions() {
    const authenticated = await authenticateUser(sessionEmail, password);

    if (!authenticated) {
      setPasswordError(true);
      return;
    }

    setPasswordModalVisible(false);
    closeActiveDevices(selectedIds);

    Alert.alert(
      "Sesiones cerradas",
      `Se cerró la sesión en ${selectedIds.length} dispositivo${selectedIds.length === 1 ? "" : "s"}.`,
      [{ text: "Aceptar", onPress: () => router.back() }],
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.gutter,
            paddingTop: layout.screenTop,
            paddingBottom: 120,
          }}
        >
          <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="close" size={34} color={theme.text} />
            </Pressable>

            <Text style={[styles.title, { color: theme.text }]}>
              Cerrar sesión en dispositivos
            </Text>
            <Text style={[styles.description, { color: theme.text }]}>
              Se cerrará la sesión de tu cuenta en todos los dispositivos
              seleccionados. Te ayudaremos a proteger tu cuenta si ves un inicio
              de sesión que no reconoces.{" "}
              <Text style={{ color: theme.blue, fontWeight: "800" }}>
                Proteger cuenta
              </Text>
              .
            </Text>

            <View style={styles.selectionHeader}>
              <Text style={[styles.selectionCount, { color: theme.text }]}>
                {selectedIds.length} seleccionados
              </Text>
              <Pressable
                onPress={toggleAll}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <Text style={[styles.selectAll, { color: theme.blue }]}>
                  {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                </Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.borderLight },
              ]}
            >
              {devices.map((device, index) => {
                const selected = selectedIds.includes(device.id);
                return (
                  <Pressable
                    key={device.id}
                    onPress={() => toggleDevice(device.id)}
                    style={({ pressed }) => [
                      styles.deviceRow,
                      index > 0 && styles.divider,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={31}
                      color={theme.text}
                    />
                    <View style={styles.deviceCopy}>
                      <Text style={[styles.deviceName, { color: theme.text }]}>
                        {device.name}
                      </Text>
                      <Text style={[styles.deviceMeta, { color: theme.muted }]}>
                        Neiva, Colombia · {device.lastAccess}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selected ? theme.blue : theme.muted,
                          backgroundColor: selected
                            ? theme.blue
                            : "transparent",
                        },
                      ]}
                    >
                      {selected ? (
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.borderLight,
            },
          ]}
        >
          <Pressable
            disabled={selectedIds.length === 0}
            onPress={requestCloseSessions}
            style={({ pressed }) => [
              styles.submitButton,
              {
                backgroundColor:
                  selectedIds.length > 0 ? theme.blue : theme.rowAlt,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.submitText,
                { color: selectedIds.length > 0 ? "#FFFFFF" : theme.muted },
              ]}
            >
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Confirma tu contraseña
            </Text>
            <Text style={[styles.modalDescription, { color: theme.muted }]}>
              Escribe la contraseña del aplicativo para cerrar estas sesiones.
            </Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(value) => {
                setPassword(value);
                setPasswordError(false);
              }}
              placeholder="Contraseña"
              placeholderTextColor={theme.muted}
              secureTextEntry
              style={[
                styles.passwordInput,
                {
                  color: theme.text,
                  borderColor: passwordError ? theme.danger : theme.borderLight,
                },
              ]}
              value={password}
            />
            {passwordError ? (
              <Text style={[styles.errorText, { color: theme.danger }]}>
                La contraseña no es correcta.
              </Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setPasswordModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={[styles.cancelText, { color: theme.muted }]}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmCloseSessions}
                style={[styles.modalButton, { backgroundColor: theme.blue }]}
              >
                <Text style={styles.confirmText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  closeButton: {
    alignSelf: "flex-start",
    marginBottom: 38,
    paddingVertical: 3,
  },
  title: {
    fontFamily: profileFont,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 36,
  },
  description: {
    fontFamily: profileFont,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 14,
  },
  selectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 42,
  },
  selectionCount: { fontFamily: profileFont, fontSize: 21, fontWeight: "800" },
  selectAll: { fontFamily: profileFont, fontSize: 16, fontWeight: "800" },
  card: { borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  deviceRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 116,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  divider: { borderTopColor: "rgba(148,163,184,0.25)", borderTopWidth: 1 },
  deviceCopy: { flex: 1, marginHorizontal: 18 },
  deviceName: { fontFamily: profileFont, fontSize: 17, fontWeight: "800" },
  deviceMeta: {
    fontFamily: profileFont,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 5,
  },
  checkbox: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  footer: {
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 32,
    paddingVertical: 18,
    position: "absolute",
    right: 0,
  },
  submitButton: {
    alignItems: "center",
    borderRadius: 32,
    minHeight: 56,
    justifyContent: "center",
  },
  submitText: { fontFamily: profileFont, fontSize: 17, fontWeight: "800" },
  modalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
  },
  modalTitle: { fontFamily: profileFont, fontSize: 21, fontWeight: "900" },
  modalDescription: {
    fontFamily: profileFont,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  passwordInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: profileFont,
    fontSize: 16,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  errorText: { fontFamily: profileFont, fontSize: 12, marginTop: 6 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 18 },
  modalButton: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 12,
  },
  cancelText: { fontFamily: profileFont, fontSize: 14, fontWeight: "800" },
  confirmText: {
    color: "#FFFFFF",
    fontFamily: profileFont,
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: { opacity: 0.7 },
});
