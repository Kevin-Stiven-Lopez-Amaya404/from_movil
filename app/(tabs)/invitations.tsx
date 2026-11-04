import { typography } from "@/lib/theme/typography";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/lib/api/api-error";
import { useSmartHome } from "@/lib/context/smart-home-context";
import type { HomeInvitation } from "@/lib/domain/home";
import { useTranslation } from "@/lib/i18n/i18n";
import { useAndroidBackFallback } from "@/lib/navigation/use-android-back-fallback";
import { smartHomeService } from "@/lib/services/smart-home-service";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function InvitationsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { t } = useTranslation();

  useAndroidBackFallback(true, "/(tabs)/(main)/homes");

  const { acceptInvitation, rejectInvitation } = useSmartHome();

  const [invitations, setInvitations] = useState<HomeInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const processingLock = useRef(false);
  const loadVersion = useRef(0);

  const loadInvitations = useCallback(async () => {
    const requestVersion = ++loadVersion.current;
    setLoading(true);
    setError(null);

    try {
      const result = await smartHomeService.listIncomingInvitations();
      if (requestVersion === loadVersion.current) setInvitations(result);
    } catch (cause) {
      if (requestVersion === loadVersion.current) setError(getApiErrorMessage(cause));
    } finally {
      if (requestVersion === loadVersion.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadInvitations();
      return () => {
        loadVersion.current += 1;
      };
    }, [loadInvitations]),
  );

  async function respond(id: string, action: "accept" | "reject") {
    if (processingLock.current) return;

    processingLock.current = true;
    setProcessingId(id);

    try {
      if (action === "accept") {
        await acceptInvitation(id);
      } else {
        await rejectInvitation(id);
      }

      setInvitations((current) =>
        current.filter((item) => item.id !== id),
      );

      Alert.alert(
        action === "accept"
          ? t("invitations.acceptedTitle")
          : t("invitations.rejectedTitle"),
        action === "accept"
          ? t("invitations.acceptedBody")
          : t("invitations.rejectedBody"),
      );
    } catch (cause) {
      Alert.alert(
        t("invitations.errorTitle"),
        getApiErrorMessage(cause),
      );
    } finally {
      processingLock.current = false;
      setProcessingId(null);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <Pressable
          onPress={() => router.replace("/(tabs)/(main)/homes")}
          accessibilityRole="button"
          accessibilityLabel={t("action.close")}
          style={({ pressed }) => ({
            alignItems: "center",
            alignSelf: "flex-end",
            backgroundColor: theme.rowAlt,
            borderRadius: 22,
            height: 44,
            justifyContent: "center",
            opacity: pressed ? 0.65 : 1,
            width: 44,
          })}
        >
          <Ionicons name="close" size={21} color={theme.text} />
        </Pressable>

        <Text
          accessibilityRole="header"
          style={{
            fontSize: typography.size.title,
            fontWeight: "700",
            color: theme.text,
          }}
        >
          {t("invitations.title")}
        </Text>

        <Text style={{ color: theme.muted }}>
          {t("invitations.subtitle")}
        </Text>

        {loading ? (
          <View accessibilityLiveRegion="polite" style={{ alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="large" color={theme.blue} />
            <Text style={{ color: theme.muted }}>{t("invitations.loading")}</Text>
          </View>
        ) : error ? (
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.text }}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadInvitations()}
              style={{ padding: 14, backgroundColor: theme.solidActionBackground, borderRadius: 12 }}
            >
              <Text style={{ color: theme.onSolidAction, textAlign: "center" }}>
                {t("common.retry")}
              </Text>
            </Pressable>
          </View>
        ) : invitations.length === 0 ? (
          <View
            style={{
              padding: 24,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.borderLight,
              backgroundColor: theme.card,
              alignItems: "center",
              gap: 12,
            }}
          >
            <Ionicons
              name="mail-open-outline"
              size={42}
              color={theme.blue}
            />
            <Text style={{ color: theme.text, fontWeight: "600" }}>
              {t("invitations.emptyTitle")}
            </Text>
            <Text style={{ color: theme.muted, textAlign: "center" }}>
              {t("invitations.emptyBody")}
            </Text>
          </View>
        ) : (
          invitations.map((invitation) => (
            <View
              key={invitation.id}
              style={{
                padding: 18,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.borderLight,
                backgroundColor: theme.card,
                gap: 12,
              }}
            >
              <Text
                accessibilityRole="header"
                style={{
                  fontSize: typography.size.bodyLarge,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                {t("invitations.cardTitle")}
              </Text>

              <Text style={{ color: theme.muted }}>
                {t("personal.role")}: {invitation.role === "OWNER"
                  ? t("home.roleOwner")
                  : invitation.role === "MEMBER"
                    ? t("profile.roleMember")
                    : t("profile.roleGuest")}
              </Text>

              <Text style={{ color: theme.muted, fontSize: typography.size.caption }}>
                {t("invitations.homeLabel")}: {invitation.homeName?.trim() || t("invitations.homeUnavailable")}
              </Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  accessibilityRole="button"
                  disabled={processingId !== null}
                  onPress={() => void respond(invitation.id, "reject")}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.borderLight,
                    opacity: processingId ? 0.6 : 1,
                  }}
                >
                  <Text
                    style={{ textAlign: "center", color: theme.text }}
                  >
                    {t("action.reject")}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={processingId !== null}
                  onPress={() => void respond(invitation.id, "accept")}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: theme.solidActionBackground,
                    opacity: processingId ? 0.6 : 1,
                  }}
                >
                  {processingId === invitation.id ? (
                    <ActivityIndicator color={theme.onSolidAction} />
                  ) : (
                    <Text
                      style={{
                        textAlign: "center",
                        color: theme.onSolidAction,
                        fontWeight: "600",
                      }}
                    >
                      {t("action.accept")}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
