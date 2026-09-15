import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function FavoritesScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  const { homes, setActiveHomeId, toggleHomeFavorite } = useSmartHome();

  const favoriteHomes = homes.filter((home) => home.favorite);

  function openHome(homeId: string) {
    setActiveHomeId(homeId);

    router.push({
      pathname: "/(tabs)/homes",
      params: { homeId },
    });
  }

  function removeFavorite(homeId: string) {
    toggleHomeFavorite(homeId);
  }

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
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={8}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </Pressable>

            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                Favoritos
              </Text>

              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Tus hogares guardados para acceder rápidamente
              </Text>
            </View>
          </View>

          {/* FAVORITE HOMES */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Mis hogares favoritos
            </Text>

            {favoriteHomes.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.emptyIconContainer,
                    { backgroundColor: theme.rowAlt },
                  ]}
                >
                  <Ionicons name="star-outline" size={38} color={theme.muted} />
                </View>

                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Aún no tienes favoritos
                </Text>

                <Text style={[styles.emptyDescription, { color: theme.muted }]}>
                  Marca un hogar con la estrella para tenerlo disponible aquí.
                </Text>
              </View>
            ) : (
              favoriteHomes.map((home) => (
                <View
                  key={home.id}
                  style={[
                    styles.favoriteCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  {/* HOME CONTENT */}
                  <Pressable
                    onPress={() => openHome(home.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${home.name}`}
                    style={({ pressed }) => [
                      styles.homeContent,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: theme.rowAlt },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="home-city-outline"
                        size={28}
                        color={theme.blue}
                      />
                    </View>

                    <View style={styles.cardCopy}>
                      <Text
                        numberOfLines={1}
                        style={[styles.cardTitle, { color: theme.text }]}
                      >
                        {home.name}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={[styles.cardSubtitle, { color: theme.muted }]}
                      >
                        {home.location}
                      </Text>
                    </View>
                  </Pressable>

                  {/* REMOVE FAVORITE */}
                  <Pressable
                    onPress={() => removeFavorite(home.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar ${home.name} de favoritos`}
                    hitSlop={6}
                    style={({ pressed }) => [
                      styles.starButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons name="star" size={23} color="#F5B400" />
                  </Pressable>

                  {/* NAVIGATION */}
                  <Pressable
                    onPress={() => openHome(home.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${home.name}`}
                    hitSlop={6}
                    style={({ pressed }) => [
                      styles.chevronButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.muted}
                    />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    alignItems: "center",
  },

  content: {
    alignSelf: "center",
    width: "100%",
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },

  backButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  headerCopy: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 12,
  },

  favoriteCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    minHeight: 74,
    paddingLeft: 14,
    paddingRight: 6,
  },

  homeContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
    paddingVertical: 8,
  },

  iconContainer: {
    alignItems: "center",
    borderRadius: 12,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  cardCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
  },

  cardSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  starButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  chevronButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 32,
  },

  emptyCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 28,
  },

  emptyIconContainer: {
    alignItems: "center",
    borderRadius: 22,
    height: 64,
    justifyContent: "center",
    width: 64,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyDescription: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 5,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.7,
  },
});
