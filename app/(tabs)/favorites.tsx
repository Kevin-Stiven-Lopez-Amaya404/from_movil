import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./favorites.styles";

export default function FavoritesScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  const { accessibleHomes, setActiveHomeId, toggleHomeFavorite } =
    useSmartHome();

  const favoriteHomes = accessibleHomes.filter((home) => home.favorite);

  function openHome(homeId: string) {
    setActiveHomeId(homeId);

    router.push({
      pathname: "/(tabs)/home-detail",
      params: { homeId, from: "favorites" },
    });
  }

  async function removeFavorite(homeId: string) {
    try {
      await toggleHomeFavorite(homeId);
    } catch (error) {
      Alert.alert(
        "No se pudo quitar el favorito",
        error instanceof Error ? error.message : "Vuelve a intentarlo.",
      );
    }
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
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/(main)/index");
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Cerrar favoritos"
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
              <Ionicons name="close" size={21} color={theme.text} />
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
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Mis hogares favoritos
              </Text>
              {favoriteHomes.length > 0 ? (
                <View style={[styles.countBadge, { backgroundColor: theme.rowAlt }]}>
                  <Text style={[styles.countText, { color: theme.muted }]}>
                    {favoriteHomes.length}
                  </Text>
                </View>
              ) : null}
            </View>

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

                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/(tabs)/(main)/homes")}
                  style={({ pressed }) => [
                    styles.emptyAction,
                    { backgroundColor: theme.blue },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.emptyActionText, { color: theme.onPrimary }]}>
                    Ver mis hogares
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.onPrimary} />
                </Pressable>
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
                      { backgroundColor: theme.rowAlt },
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
