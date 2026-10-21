import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { useTranslation } from "@/lib/i18n/i18n";
import { styles } from "../../styles/(tabs)/language.styles";

export default function LanguageScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { language, setLanguage } = useSmartHome();
  const { t } = useTranslation();
  useAndroidBackFallback(from !== "profile", "/(tabs)/(main)/profile");

  const selectFrench = () => {
    setLanguage("fr");
    returnToParent(
      router,
      from,
      "profile",
      "/(tabs)/(main)/profile",
    );
  };

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
              <Text style={[styles.title, { color: theme.text }]}>
                {t("profile.language")}
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                {t("profile.languageDescription")}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("language.switchToFrench")}
              accessibilityState={{ selected: language === "fr" }}
              onPress={selectFrench}
              style={({ pressed }) => [
                styles.optionRow,
                language === "fr" && { backgroundColor: theme.rowAlt },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>
                  Français
                </Text>
                <Text style={[styles.optionNative, { color: theme.muted }]}>
                  {t("language.switchToFrenchDescription")}
                </Text>
              </View>

              {language === "fr" ? (
                <View style={[styles.checkDot, { backgroundColor: theme.blue }]}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              ) : (
                <View style={[styles.checkDot, { borderColor: theme.border }]} />
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
