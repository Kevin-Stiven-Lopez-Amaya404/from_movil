import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import type { HomeMember, HomeRole } from "@/lib/domain/home";
import { useAndroidBackFallback } from "@/lib/navigation/use-android-back-fallback";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { smartHomeService } from "@/lib/services/smart-home-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import { isValidEmail } from "@/lib/utils/validators";

type InvitationRole = Exclude<HomeRole, "OWNER">;

function personLabel(member: HomeMember) {
  if (member.role === "OWNER") return "Propietario";
  return `Usuario · ${member.userId.slice(0, 8)}…`;
}

function roleLabel(role: string) {
  if (role === "OWNER") return "Propietario";
  if (role === "MEMBER") return "Miembro";
  if (role === "GUEST") return "Invitado";
  return role;
}

function statusLabel(status: string) {
  if (status === "ACTIVE") return "Activo";
  if (status === "PENDING") return "Pendiente";
  if (status === "REVOKED") return "Revocado";
  if (status === "LEFT") return "Finalizado";
  return status;
}

function activityLabel(member: HomeMember) {
  if (member.status === "PENDING") return "Invitación enviada";
  if (member.status === "ACTIVE") return "Membresía activa";
  if (member.status === "REVOKED") return "Acceso revocado";
  return "Membresía finalizada";
}

function activityDate(member: HomeMember) {
  if (member.status === "PENDING") return member.invitedAt;

  if (member.status === "ACTIVE") {
    return member.acceptedAt ?? member.invitedAt;
  }

  return member.endedAt ?? member.updatedAt ?? member.invitedAt;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AccessScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { homeId, returnTo } = useLocalSearchParams<{
    homeId?: string;
    returnTo?: string;
  }>();

  const {
    accessibleHomes,
    homesLoadStatus,
    homeMembersByHome,
    inviteHomeMember,
  } = useSmartHome();

  const home = accessibleHomes.find((item) => item.id === homeId);
  const canManage = home?.homeRole === "OWNER";

  useAndroidBackFallback(
    returnTo !== "home-detail",
    homeId
      ? { pathname: "/(tabs)/home-detail", params: { homeId } }
      : "/(tabs)/(main)/homes",
  );

  useEffect(() => {
    if (homesLoadStatus === "loaded" && (!homeId || !home)) {
      router.replace("/(tabs)/(main)/homes");
    }
  }, [home, homeId, homesLoadStatus, router]);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole>("MEMBER");
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);

  const [freshMembers, setFreshMembers] = useState<{
    homeId: string;
    members: HomeMember[];
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!homeId || !canManage) return;

      let active = true;
      setRefreshing(true);
      setRefreshFailed(false);

      void smartHomeService
        .listHomeMembers(homeId)
        .then((members) => {
          if (active) setFreshMembers({ homeId, members });
        })
        .catch(() => {
          if (active) setRefreshFailed(true);
        })
        .finally(() => {
          if (active) setRefreshing(false);
        });

      return () => {
        active = false;
      };
    }, [homeId, canManage]),
  );

  const members =
    freshMembers && freshMembers.homeId === homeId
      ? freshMembers.members
      : (homeMembersByHome[homeId ?? ""] ?? []);

  const activeMembers = members.filter(
    (member) => member.status === "ACTIVE",
  );

  const pendingMembers = members.filter(
    (member) => member.status === "PENDING",
  );

  const currentMembers = [...activeMembers, ...pendingMembers];
  const visibleMembers = showAll
    ? currentMembers
    : currentMembers.slice(0, 4);

  const recentActivity = members
    .filter((member) => member.role !== "OWNER")
    .sort(
      (a, b) =>
        new Date(activityDate(b)).getTime() -
        new Date(activityDate(a)).getTime(),
    )
    .slice(0, 3);

  function closeScreen() {
    if (returnTo === "home-detail" && router.canGoBack()) {
      router.back();
    } else if (homeId) {
      router.replace({
        pathname: "/(tabs)/home-detail",
        params: { homeId },
      });
    } else {
      router.replace("/(tabs)/(main)/homes");
    }
  }

  async function sendInvitation() {
    const cleanEmail = email.trim().toLowerCase();

    if (!homeId || !canManage || submitting) return;

    if (!isValidEmail(cleanEmail)) {
      Alert.alert(
        "Correo no válido",
        "Introduce una dirección de correo válida.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await inviteHomeMember(homeId, cleanEmail, role);

      setEmail("");
      setFreshMembers(null);

      Alert.alert(
        "Invitación enviada",
        "La invitación fue registrada correctamente.",
      );
    } catch (error) {
      Alert.alert(
        "No se pudo invitar",
        error instanceof Error
          ? error.message
          : "Intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom + 20,
        }}
      >
        <View
          style={[
            styles.content,
            { maxWidth: layout.contentWidth },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Invitar personas
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar invitaciones"
              onPress={closeScreen}
              style={[
                styles.closeButton,
                { backgroundColor: theme.rowAlt },
              ]}
            >
              <Ionicons
                name="close"
                size={22}
                color={theme.text}
              />
            </Pressable>
          </View>

          {homesLoadStatus === "loading" ? (
            <ActivityIndicator
              style={{ marginTop: 32 }}
              color={theme.blue}
            />
          ) : !homeId || !canManage ? (
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
                No se encontró un hogar válido del que seas
                propietario. Abre esta pantalla desde tu hogar.
              </Text>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.homeContext,
                  { backgroundColor: theme.rowAlt },
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={19}
                  color={theme.blue}
                />

                <Text
                  numberOfLines={1}
                  style={[
                    styles.homeName,
                    { color: theme.text },
                  ]}
                >
                  {home.name}
                </Text>

                <Ionicons
                  name="lock-closed-outline"
                  size={15}
                  color={theme.muted}
                />
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
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text },
                  ]}
                >
                  Invitar por correo
                </Text>

                <TextInput
                  accessibilityLabel="Correo de la persona invitada"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={theme.muted}
                  maxLength={254}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.borderLight,
                      backgroundColor: theme.background,
                    },
                  ]}
                />

                <View style={styles.roles}>
                  {([
                    {
                      value: "MEMBER",
                      title: "Miembro",
                      detail: "Controlar dispositivos",
                    },
                    {
                      value: "GUEST",
                      title: "Invitado",
                      detail: "Acceso de consulta",
                    },
                  ] as const).map((option) => {
                    const selected = role === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        onPress={() => setRole(option.value)}
                        style={[
                          styles.roleOption,
                          {
                            borderColor: selected
                              ? theme.blue
                              : theme.borderLight,
                            backgroundColor: selected
                              ? theme.rowAlt
                              : theme.card,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleTitle,
                            {
                              color: selected
                                ? theme.blue
                                : theme.text,
                            },
                          ]}
                        >
                          {option.title}
                        </Text>

                        <Text
                          style={[
                            styles.roleDescription,
                            { color: theme.muted },
                          ]}
                        >
                          {option.detail}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Enviar invitación"
                  disabled={submitting || !email.trim()}
                  onPress={() => void sendInvitation()}
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: theme.blue,
                      opacity:
                        submitting || !email.trim() ? 0.55 : 1,
                    },
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name="send-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                  )}

                  <Text style={styles.primaryText}>
                    {submitting
                      ? "Enviando..."
                      : "Enviar invitación"}
                  </Text>
                </Pressable>
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
                <View style={styles.sectionHeader}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: theme.text },
                    ]}
                  >
                    Membresías
                  </Text>

                  {refreshing ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.blue}
                    />
                  ) : null}
                </View>

                <View style={styles.statsRow}>
                  <View
                    style={[
                      styles.stat,
                      { backgroundColor: theme.rowAlt },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statNumber,
                        { color: theme.text },
                      ]}
                    >
                      {activeMembers.length}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: theme.muted },
                      ]}
                    >
                      Activas
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.stat,
                      { backgroundColor: theme.rowAlt },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statNumber,
                        { color: theme.text },
                      ]}
                    >
                      {pendingMembers.length}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: theme.muted },
                      ]}
                    >
                      Pendientes
                    </Text>
                  </View>
                </View>

                {refreshFailed ? (
                  <Text
                    style={[
                      styles.note,
                      { color: theme.muted },
                    ]}
                  >
                    No se pudo actualizar la lista.
                    Se muestran los datos disponibles.
                  </Text>
                ) : null}

                {visibleMembers.length === 0 ? (
                  <Text
                    style={[
                      styles.emptyText,
                      { color: theme.muted },
                    ]}
                  >
                    No hay membresías disponibles para mostrar.
                  </Text>
                ) : (
                  visibleMembers.map((member) => (
                    <View
                      key={member.id}
                      style={[
                        styles.memberRow,
                        { borderTopColor: theme.borderLight },
                      ]}
                    >
                      <View
                        style={[
                          styles.avatar,
                          { backgroundColor: theme.rowAlt },
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color={theme.blue}
                        />
                      </View>

                      <View style={styles.memberCopy}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.memberName,
                            { color: theme.text },
                          ]}
                        >
                          {personLabel(member)}
                        </Text>

                        <Text
                          style={[
                            styles.memberDetail,
                            { color: theme.muted },
                          ]}
                        >
                          {roleLabel(member.role)}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.memberStatus,
                          {
                            color:
                              member.status === "ACTIVE"
                                ? theme.success
                                : theme.muted,
                          },
                        ]}
                      >
                        {statusLabel(member.status)}
                      </Text>
                    </View>
                  ))
                )}

                {currentMembers.length > 4 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowAll((value) => !value)}
                    style={styles.showAll}
                  >
                    <Text
                      style={{
                        color: theme.blue,
                        fontWeight: "800",
                      }}
                    >
                      {showAll ? "Ver menos" : "Ver todas"}
                    </Text>
                  </Pressable>
                ) : null}

                <View
                  style={[
                    styles.history,
                    { borderTopColor: theme.borderLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.historyTitle,
                      { color: theme.text },
                    ]}
                  >
                    Movimientos recientes
                  </Text>

                  {recentActivity.length === 0 ? (
                    <Text
                      style={[
                        styles.note,
                        { color: theme.muted },
                      ]}
                    >
                      Todavía no hay movimientos disponibles.
                    </Text>
                  ) : (
                    recentActivity.map((member) => (
                      <View
                        key={member.id}
                        style={styles.activityRow}
                      >
                        <Ionicons
                          name="time-outline"
                          size={19}
                          color={theme.muted}
                        />

                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.activityName,
                              { color: theme.text },
                            ]}
                          >
                            {activityLabel(member)}
                          </Text>

                          <Text
                            style={[
                              styles.memberDetail,
                              { color: theme.muted },
                            ]}
                          >
                            {personLabel(member)} ·{" "}
                            {formatDate(activityDate(member))}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: "100%", alignSelf: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { flex: 1, fontSize: 23, fontWeight: "900" },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  homeContext: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    minHeight: 46,
    borderRadius: 13,
    marginBottom: 16,
  },
  homeName: { flex: 1, fontSize: 14, fontWeight: "800" },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  roles: { flexDirection: "row", gap: 10 },
  roleOption: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 13,
    minHeight: 75,
  },
  roleTitle: { fontSize: 13, fontWeight: "800" },
  roleDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statsRow: { flexDirection: "row", gap: 10 },
  stat: {
    flex: 1,
    alignItems: "center",
    borderRadius: 13,
    paddingVertical: 14,
  },
  statNumber: { fontSize: 22, fontWeight: "900" },
  statLabel: { fontSize: 12, marginTop: 3 },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  memberCopy: { flex: 1 },
  memberName: { fontSize: 13, fontWeight: "800" },
  memberDetail: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  memberStatus: { fontSize: 11, fontWeight: "800" },
  showAll: { alignSelf: "center", padding: 8 },
  history: {
    borderTopWidth: 1,
    paddingTop: 15,
    marginTop: 4,
    gap: 12,
  },
  historyTitle: { fontSize: 14, fontWeight: "800" },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activityName: { fontSize: 12, fontWeight: "700" },
  emptyText: { fontSize: 12, lineHeight: 18 },
  note: { fontSize: 12, lineHeight: 18 },
});
