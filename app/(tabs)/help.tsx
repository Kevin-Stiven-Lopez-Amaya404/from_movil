import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { typography } from "@/lib/theme/typography";
import { useTranslation } from "@/lib/i18n/i18n";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function HelpScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const parentRoute =
    from === "settings" ? "/(tabs)/settings" : "/(tabs)/(main)/profile";
  const parentSource = from === "settings" ? "settings" : "profile";
  useAndroidBackFallback(from !== parentSource, parentRoute);
  const faqs = [
    {
      question: t("help.faqHomesQuestion"),
      answer: t("help.faqHomesAnswer"),
    },
    {
      question: t("help.faqDevicesQuestion"),
      answer: t("help.faqDevicesAnswer"),
    },
    {
      question: t("help.faqAlertsQuestion"),
      answer: t("help.faqAlertsAnswer"),
    },
    {
      question: t("help.faqAppearanceQuestion"),
      answer: t("help.faqAppearanceAnswer"),
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
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
            accessibilityLabel={t("action.close")}
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
            <View style={[styles.headerIcon, { backgroundColor: theme.rowAlt }]}>
              <Ionicons name="help-circle-outline" size={28} color={theme.blue} />
            </View>
            <View style={styles.headerCopy}>
              <Text
                accessibilityRole="header"
                style={[styles.title, { color: theme.text }]}
              >
                {t("help.title")}
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                {t("help.subtitle")}
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
              {t("help.faqTitle")}
            </Text>
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <View
                  key={faq.question}
                  style={[styles.faq, { borderTopColor: theme.borderLight }]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityHint={t("help.faqToggleHint")}
                    accessibilityState={{ expanded: isOpen }}
                    onPress={() => setOpenIndex(isOpen ? null : index)}
                    style={({ pressed }) => [
                      styles.faqButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.question, { color: theme.text }]}>
                      {faq.question}
                    </Text>
                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={19}
                      color={theme.muted}
                    />
                  </Pressable>
                  {isOpen ? (
                    <Text style={[styles.answer, { color: theme.muted }]}>
                      {faq.answer}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>

          <View
            accessibilityLiveRegion="polite"
            style={[styles.supportNotice, { backgroundColor: theme.rowAlt }]}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.blue}
              accessible={false}
            />
            <Text style={[styles.supportNoticeText, { color: theme.muted }]}>
              {t("help.contactUnavailable")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { alignItems: "center" },
  content: { alignSelf: "center", width: "100%" },
  closeButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginBottom: 18,
    width: 44,
  },
  header: { alignItems: "center", flexDirection: "row", gap: 13 },
  headerIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { fontSize: typography.size.title, fontWeight: "900" },
  subtitle: {
    fontSize: typography.size.helper,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 4,
  },
  card: { borderRadius: 18, borderWidth: 1, marginTop: 26, paddingHorizontal: 14 },
  sectionTitle: {
    fontSize: typography.size.bodyLarge,
    fontWeight: "900",
    paddingBottom: 4,
    paddingTop: 16,
  },
  faq: { borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
  faqButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
  },
  question: {
    flex: 1,
    fontSize: typography.size.body,
    fontWeight: "800",
    paddingRight: 12,
  },
  answer: {
    fontSize: typography.size.helper,
    fontWeight: "600",
    lineHeight: 19,
    paddingBottom: 10,
    paddingRight: 18,
  },
  supportNotice: {
    alignItems: "flex-start",
    borderRadius: 14,
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    padding: 14,
  },
  supportNoticeText: {
    flex: 1,
    fontSize: typography.size.caption,
    fontWeight: "600",
    lineHeight: 19,
  },
  pressed: { opacity: 0.72 },
});
