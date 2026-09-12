import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import { AppLanguage, useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

const languages: { code: AppLanguage; label: string; native: string }[] = [
  { code: "es", label: "Español", native: "Español (Colombia)" },
  { code: "en", label: "English", native: "English" },
  { code: "pt", label: "Português", native: "Português (Brasil)" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { language, setLanguage } = useSmartHome();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return languages;
    }

    return languages.filter((item) =>
      `${item.label} ${item.native}`.toLowerCase().includes(normalized),
    );
  }, [query]);

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
              <Ionicons name="language-outline" size={24} color={theme.blue} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>Idioma</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Busca y selecciona tu idioma
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.searchBox,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={theme.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar idioma"
              placeholderTextColor={theme.muted}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            {filtered.map((item) => {
              const active = language === item.code;

              return (
                <Pressable
                  key={`${item.code}-${item.label}`}
                  accessibilityRole="button"
                  onPress={() => {
                    setLanguage(item.code);
                    router.back();
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    active && {
                      backgroundColor: theme.rowAlt,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.optionTextWrap}>
                    <Text style={[styles.optionLabel, { color: theme.text }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.optionNative, { color: theme.muted }]}>
                      {item.native}
                    </Text>
                  </View>

                  {active ? (
                    <View
                      style={[styles.checkDot, { backgroundColor: theme.blue }]}
                    >
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View
                      style={[styles.checkDot, { borderColor: theme.border }]}
                    />
                  )}
                </Pressable>
              );
            })}
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
  searchBox: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: profileFont,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  optionRow: {
    alignItems: "center",
    borderBottomColor: "rgba(148,163,184,0.25)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionTextWrap: { flex: 1 },
  optionLabel: {
    fontFamily: profileFont,
    fontSize: 15,
    fontWeight: "800",
  },
  optionNative: {
    fontFamily: profileFont,
    fontSize: 11,
    marginTop: 2,
  },
  checkDot: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  pressed: { opacity: 0.72 },
});
