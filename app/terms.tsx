import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  TERMS_DATE,
  TERMS_SECTIONS,
  TERMS_STATUS,
  TERMS_SUBTITLE,
  TERMS_TITLE,
  TERMS_VERSION,
} from "@/lib/legal/terms-content";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../styles/terms.styles";

export default function TermsScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const fallbackHref = from === "register" ? "/register" : "/(tabs)/settings";

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: layout.screenBottom,
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop + 8,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View style={styles.header}>
            <ScreenHeader
              fallbackHref={fallbackHref}
              subtitle="Documento completo"
              title="Términos y condiciones"
            />
          </View>

          <Text
            accessibilityRole="header"
            style={[styles.documentTitle, { color: theme.text }]}
          >
            {TERMS_TITLE}
          </Text>

          <Text style={[styles.documentSubtitle, { color: theme.muted }]}>
            {TERMS_SUBTITLE}
          </Text>

          <Text style={[styles.version, { color: theme.muted }]}>
            Versión: {TERMS_VERSION} · {TERMS_DATE}
          </Text>

          <Text style={[styles.status, { color: theme.text }]}>
            Estado: {TERMS_STATUS}
          </Text>

          {TERMS_SECTIONS.map((section, index) => (
            <View
              key={section.title}
              style={[
                styles.section,
                index === TERMS_SECTIONS.length - 1 && { borderBottomWidth: 0 },
                { borderBottomColor: theme.divider },
              ]}
            >
              <Text
                accessibilityRole="header"
                style={[styles.sectionTitle, { color: theme.text }]}
              >
                {index + 1}. {section.title}
              </Text>
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <Text
                  key={`${section.title}-${paragraphIndex}`}
                  selectable
                  style={[styles.paragraph, { color: theme.text }]}
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
