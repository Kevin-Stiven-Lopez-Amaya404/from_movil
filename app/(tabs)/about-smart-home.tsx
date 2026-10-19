import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import { useResponsiveLayout } from "@/lib/responsive/responsive";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./about-smart-home.styles";

export default function AboutSmartHomeScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  useAndroidBackFallback(from !== "profile", "/(tabs)/(main)/profile");

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
              <Ionicons
                name="information-circle-outline"
                size={26}
                color={theme.blue}
              />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                Smart Home
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Tu hogar inteligente en un solo lugar
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Acerca de la app
            </Text>
            <Text style={[styles.description, { color: theme.muted }]}>
              Smart Home te ayuda a controlar dispositivos, revisar consumos,
              gestionar hogares y mantener tus espacios conectados con mayor
              claridad y rapidez.
            </Text>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.muted }]}>
                Versión
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>1.0.0</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.muted }]}>
                Plataforma
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>
                Expo / React Native
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.muted }]}>Estado</Text>
              <Text style={[styles.value, { color: theme.text }]}>Beta</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
