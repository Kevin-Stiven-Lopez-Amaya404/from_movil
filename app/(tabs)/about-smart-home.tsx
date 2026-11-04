import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTranslation } from "@/lib/i18n/i18n";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/about-smart-home.styles";

export default function AboutSmartHomeScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const parentRoute =
    from === "settings" ? "/(tabs)/settings" : "/(tabs)/(main)/profile";
  const parentSource = from === "settings" ? "settings" : "profile";
  useAndroidBackFallback(from !== parentSource, parentRoute);
  const version =
    Constants.expoConfig?.version ?? t("profile.dataUnavailable");
  const platform =
    Platform.OS === "android"
      ? t("about.android")
      : Platform.OS === "ios"
        ? t("about.ios")
        : t("about.otherPlatform");

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
            accessibilityRole="button"
            accessibilityLabel={t("action.back")}
            onPress={() =>
              returnToParent(
                router,
                from,
                parentSource,
                parentRoute,
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
              <Ionicons
                name="information-circle-outline"
                size={26}
                color={theme.blue}
              />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                {t("about.title")}
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                {t("about.subtitle")}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Text
              accessibilityRole="header"
              style={[styles.sectionTitle, { color: theme.text }]}
            >
              {t("about.sectionTitle")}
            </Text>
            <Text style={[styles.description, { color: theme.muted }]}>
              {t("about.description")}
            </Text>

            <View style={[styles.infoRow, { borderTopColor: theme.divider }]}>
              <Text style={[styles.label, { color: theme.muted }]}>
                {t("about.version")}
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {version}
              </Text>
            </View>

            <View style={[styles.infoRow, { borderTopColor: theme.divider }]}>
              <Text style={[styles.label, { color: theme.muted }]}>
                {t("about.platform")}
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {platform}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
