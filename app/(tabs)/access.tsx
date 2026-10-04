import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { type HomeRole } from "@/lib/services/smart-home-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { isValidEmail } from "@/lib/utils/validators";

type InvitationRole = Exclude<HomeRole, "OWNER">;

export default function AccessScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { homes, activeHomeId, homeMembersByHome, inviteHomeMember } =
    useSmartHome();
  const ownerHomes = useMemo(
    () => homes.filter((home) => home.homeRole === "OWNER"),
    [homes],
  );
  const [selectedHomeId, setSelectedHomeId] = useState(activeHomeId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole>("MEMBER");
  const [submitting, setSubmitting] = useState(false);
  const selectedHome =
    ownerHomes.find((home) => home.id === selectedHomeId) ?? ownerHomes[0];
  const currentHomeId = selectedHome?.id ?? "";

  const selectedMembers = homeMembersByHome[currentHomeId] ?? [];
  const memberCount = selectedMembers.filter(
    (member) => member.status === "ACTIVE",
  ).length;
  const pendingCount = selectedMembers.filter(
    (member) => member.status === "PENDING",
  ).length;

  async function sendInvitation() {
    const cleanEmail = email.trim().toLowerCase();
    if (!currentHomeId || !isValidEmail(cleanEmail)) {
      Alert.alert("Correo no válido", "Ingresa un correo electrónico válido.");
      return;
    }

    setSubmitting(true);
    try {
      await inviteHomeMember(currentHomeId, cleanEmail, role);
      setEmail("");
      Alert.alert(
        "Invitación enviada",
        "La persona debe tener una cuenta activa para poder recibir la invitación.",
      );
    } catch (error) {
      Alert.alert(
        "No se pudo enviar la invitación",
        error instanceof Error ? error.message : "Intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (ownerHomes.length === 0) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <View style={styles.denied}>
          <Ionicons name="lock-closed-outline" size={48} color={theme.muted} />
          <Text style={[styles.deniedTitle, { color: theme.text }]}>
            Gestión exclusiva del propietario
          </Text>
          <Text style={[styles.deniedText, { color: theme.muted }]}>
            Esta opción requiere el rol OWNER devuelto por el backend para al
            menos uno de tus hogares.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.primary, { backgroundColor: theme.blue }]}
          >
            <Text style={styles.primaryText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
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
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={theme.blue} />
            <Text style={[styles.backText, { color: theme.blue }]}>
              Hogares
            </Text>
          </Pressable>

          <Text style={[styles.title, { color: theme.text }]}>
            Accesos del hogar
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Invita miembros o invitados a un hogar donde tienes rol de
            propietario.
          </Text>

          <View style={styles.homeChips}>
            {ownerHomes.map((home) => {
              const selected = home.id === currentHomeId;
              return (
                <Pressable
                  key={home.id}
                  onPress={() => setSelectedHomeId(home.id)}
                  style={[
                    styles.homeChip,
                    {
                      borderColor: selected ? theme.blue : theme.borderLight,
                      backgroundColor: selected ? theme.rowAlt : theme.card,
                    },
                  ]}
                >
                  <Ionicons
                    name="home-outline"
                    size={16}
                    color={selected ? theme.blue : theme.muted}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      { color: selected ? theme.blue : theme.muted },
                    ]}
                  >
                    {home.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            style={[
              styles.form,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Text style={[styles.label, { color: theme.text }]}>
              Invitar por correo
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="correo@ejemplo.com"
              placeholderTextColor={theme.muted}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.borderLight },
              ]}
            />
            <View style={styles.roleRow}>
              {(["MEMBER", "GUEST"] as InvitationRole[]).map((item) => {
                const selected = role === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setRole(item)}
                    style={[
                      styles.roleChip,
                      {
                        borderColor: selected ? theme.blue : theme.borderLight,
                        backgroundColor: selected ? theme.rowAlt : theme.card,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        { color: selected ? theme.blue : theme.muted },
                      ]}
                    >
                      {item === "MEMBER" ? "Miembro" : "Invitado"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={() => void sendInvitation()}
              style={[
                styles.primary,
                { backgroundColor: theme.blue, opacity: submitting ? 0.7 : 1 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons name="person-add-outline" size={19} color="#FFFFFF" />
              )}
              <Text style={styles.primaryText}>Enviar invitación</Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.summary,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Text style={[styles.label, { color: theme.text }]}>
              Membresías de {selectedHome?.name}
            </Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              {memberCount} activas · {pendingCount} pendientes
            </Text>
            <Text style={[styles.note, { color: theme.muted }]}>
              El backend actual solo devuelve el identificador de usuario, rol y
              estado de cada membresía; no expone nombres ni correos para
              mostrar una lista identificable.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  back: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  backText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 15,
    fontWeight: "800",
  },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 25,
    fontWeight: "900",
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  form: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginTop: 18,
    padding: 15,
  },
  label: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 15,
    fontWeight: "800",
  },
  input: {
    borderRadius: 11,
    borderWidth: 1,
    height: 46,
    paddingHorizontal: 12,
    fontFamily: typography.fontFamily.regular,
  },
  roleRow: { flexDirection: "row", gap: 8 },
  roleChip: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  roleText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "800",
  },
  homeChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  homeChip: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  primary: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  primaryText: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 13,
    fontWeight: "800",
  },
  summary: { borderRadius: 17, borderWidth: 1, marginTop: 18, padding: 15 },
  note: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  denied: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },
  deniedTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
  },
  deniedText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: "center",
  },
});
