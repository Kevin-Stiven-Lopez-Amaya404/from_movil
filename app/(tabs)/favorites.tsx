import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useTranslation } from "@/lib/i18n/i18n";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { runSingleFlight } from "@/lib/utils/async-action-lock";
import { styles } from "../../styles/(tabs)/favorites.styles";

export default function FavoritesScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { t } = useTranslation();

  const { accessibleHomes, setActiveHomeId, toggleHomeFavorite } =
    useSmartHome();
  const favoriteActionLock = useRef(false);
  const [removingFavoriteId, setRemovingFavoriteId] = useState<string | null>(null);

  const favoriteHomes = accessibleHomes.filter((home) => home.favorite);

  function openHome(homeId: string) {
    setActiveHomeId(homeId);

    router.push({
      pathname: "/(tabs)/home-detail",
      params: { homeId, from: "favorites" },
    });
  }

  async function removeFavorite(homeId: string) {
    await runSingleFlight(favoriteActionLock, async () => {
      setRemovingFavoriteId(homeId);
      try {
        await toggleHomeFavorite(homeId);
      } catch {
        Alert.alert(t("favorites.removeErrorTitle"), t("favorites.removeError"));
      } finally {
        setRemovingFavoriteId(null);
      }
    });
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
            <ScreenHeader
              accessibilityLabel={t("favorites.title")}
              backBackgroundColor={theme.card}
              fallbackHref="/(tabs)/(main)/index"
              subtitle={t("favorites.subtitle")}
              title={t("favorites.title")}
              titleSize="title"
            />
          </View>

          {/* FAVORITE HOMES */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t("favorites.section")}
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
                  {t("favorites.emptyTitle")}
                </Text>

                <Text style={[styles.emptyDescription, { color: theme.muted }]}>
                  {t("favorites.emptyDescription")}
                </Text>

                <Button
                  colorSource="solidAction"
                  icon={<Ionicons name="arrow-forward" size={16} color={theme.onSolidAction} />}
                  label={t("favorites.viewHomes")}
                  labelSize="helper"
                  onPress={() => router.push("/(tabs)/(main)/homes")}
                  style={styles.emptyAction}
                  variant="primary"
                />
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
                    accessibilityLabel={t("favorites.openHome", { name: home.name })}
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
                        {home.location || t("profile.dataUnavailable")}
                      </Text>
                    </View>
                  </Pressable>

                  {/* REMOVE FAVORITE */}
                  <Pressable
                    onPress={() => removeFavorite(home.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t("favorites.removeFavorite", { name: home.name })}
                    accessibilityState={{
                      selected: true,
                      disabled: removingFavoriteId !== null,
                      busy: removingFavoriteId === home.id,
                    }}
                    disabled={removingFavoriteId !== null}
                    style={({ pressed }) => [
                      styles.starButton,
                      { backgroundColor: theme.rowAlt },
                      (pressed || removingFavoriteId !== null) && styles.pressed,
                    ]}
                  >
                    {removingFavoriteId === home.id ? (
                      <ActivityIndicator size="small" color={theme.blue} />
                    ) : (
                      <Ionicons name="star" size={23} color={theme.blue} />
                    )}
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
