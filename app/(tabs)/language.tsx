import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import { useSmartHome } from "@/lib/context/smart-home-context";
import type { AppLanguage } from "@/lib/domain/preferences";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./language.styles";

const languages: { code: AppLanguage; label: string; native: string }[] = [
  { code: "es", label: "Español", native: "Español (Colombia)" },
  { code: "en", label: "English", native: "English" },
  { code: "pt", label: "Português", native: "Português (Brasil)" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { language, setLanguage } = useSmartHome();
  useAndroidBackFallback(from !== "profile", "/(tabs)/(main)/profile");
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
            onPress={() =>
              returnToParent(
                router,
                from,
                "profile",
                "/(tabs)/(main)/profile",
              )
            }
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
                    returnToParent(
                      router,
                      from,
                      "profile",
                      "/(tabs)/(main)/profile",
                    );
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
