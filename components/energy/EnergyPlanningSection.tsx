import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { EnergyCostSummaryCard } from "@/components/energy/EnergyCostSummaryCard";
import type { HomeRole } from "@/lib/domain/home";
import { getEnergyAccess } from "@/lib/features/energy-sql034/energy-rules";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type Props = {
  homeId: string | null;
  homeRole?: HomeRole;
};

export function EnergyPlanningSection({ homeId, homeRole }: Props) {
  const theme = useAppTheme();

  if (!homeId) {
    return (
      <AccessNotice
        icon="home-outline"
        message="Selecciona un hogar para consultar su planificación energética."
      />
    );
  }

  if (!homeRole) {
    return (
      <AccessNotice
        icon="shield-outline"
        message="No se pudo verificar tu rol. No se consultaron costos, tarifas ni metas."
      />
    );
  }

  if (!getEnergyAccess(homeRole).canRequest) {
    return (
      <AccessNotice
        icon="lock-closed-outline"
        message="Tu rol en este hogar no permite consultar costos, tarifas ni metas. Puedes seguir viendo el consumo general en la sección Consumo."
      />
    );
  }

  return (
    <View style={styles.content}>
      <View
        style={[
          styles.introCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.borderLight,
          },
        ]}
      >
        <View style={styles.introHeading}>
          <View
            style={[
              styles.introIcon,
              { backgroundColor: theme.rowAlt },
            ]}
          >
            <Ionicons name="wallet-outline" size={21} color={theme.blue} />
          </View>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: theme.text }]}
          >
            Planificación energética
          </Text>
        </View>
        <Text style={[styles.description, { color: theme.muted }]}>
          Consulta el costo mensual estimado y accede al historial de tarifas y a las metas del hogar.
        </Text>
      </View>

      <EnergyCostSummaryCard
        key={homeId}
        homeId={homeId}
        homeRole={homeRole}
      />

      <View
        style={[
          styles.contextCard,
          {
            backgroundColor: theme.rowAlt,
            borderColor: theme.borderLight,
          },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={19}
          color={theme.blue}
          accessible={false}
        />
        <Text style={[styles.contextText, { color: theme.text }]}>
          Tarifas y metas se consultan en sus pantallas independientes. Las opciones de administración dependen del rol en este hogar.
        </Text>
      </View>
    </View>
  );
}

type AccessNoticeProps = {
  icon: "home-outline" | "shield-outline" | "lock-closed-outline";
  message: string;
};

function AccessNotice({ icon, message }: AccessNoticeProps) {
  const theme = useAppTheme();

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.notice,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
        },
      ]}
    >
      <Ionicons name={icon} size={23} color={theme.muted} accessible={false} />
      <Text style={[styles.description, { color: theme.muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    width: "100%",
  },
  introCard: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  introHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  introIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  title: {
    flex: 1,
    fontSize: typography.size.bodyLarge,
    fontWeight: "800",
  },
  description: {
    fontSize: typography.size.helper,
    lineHeight: 22,
    flexShrink: 1,
  },
  contextCard: {
    alignItems: "flex-start",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 14,
  },
  contextText: {
    flex: 1,
    fontSize: typography.size.caption,
    lineHeight: 20,
  },
  notice: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 74,
    padding: 16,
  },
});
