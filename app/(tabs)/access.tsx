import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome, type UserRole } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type AccessRow = { email: string; name: string; role: UserRole; homeIds: string[] };

const demoMembers: AccessRow[] = [
  { email: "pepe@smarthome.com", name: "Pepe", role: "miembro", homeIds: ["casa"] },
  { email: "miembro@smarthome.com", name: "Miembro Demo", role: "miembro", homeIds: ["casa"] },
  { email: "invitado@smarthome.com", name: "Invitado Demo", role: "invitado", homeIds: ["casa"] },
];

export default function AccessScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { homes, assignHomeAccess, sessionRole } = useSmartHome();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("miembro");
  const [selectedHomeId, setSelectedHomeId] = useState(homes[0]?.id ?? "");

  const [members, setMembers] = useState<AccessRow[]>(demoMembers);
  const canManage = sessionRole === "admin";

  const visibleMembers = useMemo(
    () => members.filter((member) => member.role !== "admin"),
    [members],
  );

  function addMember() {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanName || !selectedHomeId) {
      Alert.alert("Datos incompletos", "Ingresa nombre, correo y hogar.");
      return;
    }

    const existing = members.findIndex((member) => member.email === cleanEmail);
    const next = { email: cleanEmail, name: cleanName, role, homeIds: [selectedHomeId] };

    if (existing >= 0) {
      const copy = [...members];
      copy[existing] = { ...copy[existing], ...next };
      setMembers(copy);
    } else {
      setMembers((current) => [...current, next]);
    }

    assignHomeAccess(cleanEmail, selectedHomeId, true);
    setEmail("");
    setName("");
    Alert.alert("Acceso asignado", `${cleanName} ahora tiene acceso a ${homes.find((h) => h.id === selectedHomeId)?.name ?? "el hogar"}.`);
  }

  function toggleHome(member: AccessRow, homeId: string) {
    const assigned = member.homeIds.includes(homeId);
    const nextIds = assigned
      ? member.homeIds.filter((id) => id !== homeId)
      : [...member.homeIds, homeId];

    setMembers((current) =>
      current.map((item) => item.email === member.email ? { ...item, homeIds: nextIds } : item),
    );
    assignHomeAccess(member.email, homeId, !assigned);
  }

  if (!canManage) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.denied}>
          <Ionicons name="lock-closed-outline" size={48} color={theme.muted} />
          <Text style={[styles.deniedTitle, { color: theme.text }]}>Acceso restringido</Text>
          <Text style={[styles.deniedText, { color: theme.muted }]}>Solo el administrador puede asignar hogares a miembros e invitados.</Text>
          <Pressable onPress={() => router.back()} style={[styles.primary, { backgroundColor: theme.blue }]}>
            <Text style={styles.primaryText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingTop: layout.screenTop, paddingBottom: layout.screenBottom }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={theme.blue} />
            <Text style={[styles.backText, { color: theme.blue }]}>Hogares</Text>
          </Pressable>

          <Text style={[styles.title, { color: theme.text }]}>Accesos del hogar</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Define exactamente qué casa puede ver cada miembro o invitado.
          </Text>

          <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
            <Text style={[styles.label, { color: theme.text }]}>Nueva asignación</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.text, borderColor: theme.borderLight }]} />
            <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Correo electrónico" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.text, borderColor: theme.borderLight }]} />
            <View style={styles.roleRow}>
              {(["miembro", "invitado"] as UserRole[]).map((item) => (
                <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleChip, { borderColor: role === item ? theme.blue : theme.borderLight, backgroundColor: role === item ? theme.rowAlt : theme.card }]}>
                  <Text style={[styles.roleText, { color: role === item ? theme.blue : theme.muted }]}>{item[0].toUpperCase() + item.slice(1)}</Text>
                </Pressable>
              ))}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.homeChips}>
              {homes.map((home) => (
                <Pressable key={home.id} onPress={() => setSelectedHomeId(home.id)} style={[styles.homeChip, { borderColor: selectedHomeId === home.id ? theme.blue : theme.borderLight, backgroundColor: selectedHomeId === home.id ? theme.rowAlt : theme.card }]}>
                  <Ionicons name="home-outline" size={16} color={selectedHomeId === home.id ? theme.blue : theme.muted} />
                  <Text style={[styles.roleText, { color: selectedHomeId === home.id ? theme.blue : theme.muted }]}>{home.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={addMember} style={[styles.primary, { backgroundColor: theme.blue }]}>
              <Ionicons name="person-add-outline" size={19} color="#fff" />
              <Text style={styles.primaryText}>Asignar acceso</Text>
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Personas y hogares</Text>
          {visibleMembers.map((member) => (
            <View key={member.email} style={[styles.memberCard, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
              <View style={styles.memberHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.rowAlt }]}>
                  <Ionicons name={member.role === "invitado" ? "person-outline" : "person"} size={21} color={theme.blue} />
                </View>
                <View style={styles.memberCopy}>
                  <Text style={[styles.memberName, { color: theme.text }]}>{member.name}</Text>
                  <Text style={[styles.memberEmail, { color: theme.muted }]}>{member.email} · {member.role}</Text>
                </View>
              </View>
              <Text style={[styles.assignLabel, { color: theme.muted }]}>Hogares permitidos</Text>
              <View style={styles.assignmentRow}>
                {homes.map((home) => {
                  const assigned = member.homeIds.includes(home.id);
                  return (
                    <Pressable key={home.id} onPress={() => toggleHome(member, home.id)} style={[styles.assignment, { borderColor: assigned ? theme.success : theme.borderLight, backgroundColor: assigned ? theme.successSoft : theme.card }]}>
                      <Ionicons name={assigned ? "checkmark-circle" : "ellipse-outline"} size={17} color={assigned ? theme.success : theme.muted} />
                      <Text style={[styles.roleText, { color: assigned ? theme.success : theme.muted }]}>{home.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  back: { alignItems: "center", flexDirection: "row", gap: 4, marginBottom: 12 },
  backText: { fontFamily: typography.fontFamily.emphasis, fontSize: 15, fontWeight: "800" },
  title: { fontFamily: typography.fontFamily.display, fontSize: 25, fontWeight: "900" },
  subtitle: { fontFamily: typography.fontFamily.regular, fontSize: 13, lineHeight: 19, marginTop: 5 },
  form: { borderRadius: 18, borderWidth: 1, gap: 10, marginTop: 18, padding: 15 },
  label: { fontFamily: typography.fontFamily.emphasis, fontSize: 15, fontWeight: "800" },
  input: { borderRadius: 11, borderWidth: 1, height: 46, paddingHorizontal: 12, fontFamily: typography.fontFamily.regular },
  roleRow: { flexDirection: "row", gap: 8 },
  roleChip: { borderRadius: 12, borderWidth: 1, flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center" },
  homeChips: { gap: 8, paddingVertical: 2 },
  homeChip: { alignItems: "center", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 6, minHeight: 40, paddingHorizontal: 12 },
  roleText: { fontFamily: typography.fontFamily.emphasis, fontSize: 12, fontWeight: "800" },
  primary: { alignItems: "center", borderRadius: 12, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 46, paddingHorizontal: 14 },
  primaryText: { color: "#fff", fontFamily: typography.fontFamily.emphasis, fontSize: 13, fontWeight: "800" },
  sectionTitle: { fontFamily: typography.fontFamily.display, fontSize: 19, fontWeight: "900", marginTop: 24, marginBottom: 10 },
  memberCard: { borderRadius: 17, borderWidth: 1, marginBottom: 10, padding: 15 },
  memberHeader: { alignItems: "center", flexDirection: "row", gap: 11 },
  avatar: { alignItems: "center", borderRadius: 12, height: 42, justifyContent: "center", width: 42 },
  memberCopy: { flex: 1 },
  memberName: { fontFamily: typography.fontFamily.emphasis, fontSize: 15, fontWeight: "800" },
  memberEmail: { fontFamily: typography.fontFamily.regular, fontSize: 11, marginTop: 2 },
  assignLabel: { fontFamily: typography.fontFamily.regular, fontSize: 11, marginTop: 13, marginBottom: 7 },
  assignmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  assignment: { alignItems: "center", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 5, minHeight: 38, paddingHorizontal: 10 },
  denied: { alignItems: "center", flex: 1, justifyContent: "center", padding: 28 },
  deniedTitle: { fontFamily: typography.fontFamily.display, fontSize: 20, fontWeight: "900", marginTop: 12 },
  deniedText: { fontFamily: typography.fontFamily.regular, fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: "center" },
});
