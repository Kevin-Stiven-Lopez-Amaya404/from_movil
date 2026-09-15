import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

const faqs = [
  {
    question: "¿Cómo agrego un hogar?",
    answer: "En Hogares, escribe un nombre y pulsa el botón +. El nuevo hogar quedará seleccionado para que puedas añadir dispositivos.",
  },
  {
    question: "¿Cómo agrego un dispositivo?",
    answer: "Abre un hogar, escribe el nombre del dispositivo y pulsa +. Cada dispositivo queda asociado al hogar que estás viendo.",
  },
  {
    question: "¿Qué significa una alerta?",
    answer: "Una alerta aparece cuando un dispositivo crítico necesita atención o pierde conexión. Puedes abrirla, revisar el dispositivo y marcarla como atendida.",
  },
  {
    question: "¿Cómo cambio el tema de la aplicación?",
    answer: "Ve a Configuración > Preferencias y selecciona Claro u Oscuro. El cambio se aplica inmediatamente a toda la aplicación.",
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function contactSupport() {
    Alert.alert(
      "Soporte Smart Home",
      "Para recibir ayuda, describe el problema y comparte el nombre del dispositivo afectado.",
      [{ text: "Entendido" }],
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingTop: layout.screenTop,
            paddingBottom: layout.screenBottom,
          },
        ]}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.blue} />
            <Text style={[styles.backText, { color: theme.blue }]}>Ayuda</Text>
          </Pressable>

          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: theme.rowAlt }]}>
              <Ionicons name="help-circle-outline" size={28} color={theme.blue} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>Centro de ayuda</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>Resuelve dudas sobre tu hogar inteligente.</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Preguntas frecuentes</Text>
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <View key={faq.question} style={[styles.faq, { borderTopColor: theme.borderLight }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    onPress={() => setOpenIndex(isOpen ? null : index)}
                    style={({ pressed }) => [styles.faqButton, pressed && styles.pressed]}
                  >
                    <Text style={[styles.question, { color: theme.text }]}>{faq.question}</Text>
                    <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={19} color={theme.muted} />
                  </Pressable>
                  {isOpen ? <Text style={[styles.answer, { color: theme.muted }]}>{faq.answer}</Text> : null}
                </View>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Contactar soporte"
            onPress={contactSupport}
            style={({ pressed }) => [styles.supportButton, { backgroundColor: theme.blue }, pressed && styles.pressed]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
            <Text style={styles.supportText}>Contactar soporte</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { alignItems: "center" },
  content: { alignSelf: "center", width: "100%" },
  backButton: { alignItems: "center", flexDirection: "row", gap: 4, marginBottom: 18, paddingVertical: 4 },
  backText: { fontSize: 15, fontWeight: "800" },
  header: { alignItems: "center", flexDirection: "row", gap: 13 },
  headerIcon: { alignItems: "center", borderRadius: 16, height: 54, justifyContent: "center", width: 54 },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { fontSize: 27, fontWeight: "900" },
  subtitle: { fontSize: 13, fontWeight: "600", lineHeight: 18, marginTop: 4 },
  card: { borderRadius: 18, borderWidth: 1, marginTop: 26, paddingHorizontal: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "900", paddingBottom: 4, paddingTop: 16 },
  faq: { borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
  faqButton: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 42 },
  question: { flex: 1, fontSize: 15, fontWeight: "800", paddingRight: 12 },
  answer: { fontSize: 13, fontWeight: "600", lineHeight: 19, paddingBottom: 10, paddingRight: 18 },
  supportButton: { alignItems: "center", borderRadius: 14, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 18, minHeight: 48 },
  supportText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
