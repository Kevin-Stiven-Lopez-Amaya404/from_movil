import { Text, View } from "react-native";

import {
  barWidthPercent,
  formatPercent,
  isValidUsagePercent,
  overLimitPercent,
} from "@/lib/features/energy-sql034/energy-rules";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/energy.styles";

type Props = {
  title: string;
  limitLabel: string;
  percent: string | null;
  unavailableText: string;
};

/** Monthly progress of a goal, shown on the separate Goals screen. */
export function EnergyGoalProgressRow({
  title,
  limitLabel,
  percent,
  unavailableText,
}: Props) {
  const theme = useAppTheme();
  const hasValidPercent = isValidUsagePercent(percent);

  if (!hasValidPercent) {
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={[styles.label, { color: theme.muted }]}>{title}</Text>
        <Text style={[styles.note, { color: theme.muted }]}>
          {unavailableText}
        </Text>
      </View>
    );
  }

  const over = overLimitPercent(percent);
  const progressColor = over ? theme.danger : theme.blue;

  return (
    <View
      accessible
      accessibilityLabel={`${title}: ${formatPercent(percent)} de ${limitLabel}${
        over ? `. Superaste el límite en ${formatPercent(over)}` : ""
      }`}
      style={{ marginTop: 12 }}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.label, { color: theme.muted }]}>{title}</Text>
        <Text style={[styles.label, { color: theme.text, fontWeight: "800" }]}>
          {formatPercent(percent)} de {limitLabel}
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: theme.chartGrid }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${over ? 100 : barWidthPercent(percent)}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
      {over ? (
        <Text style={[styles.note, { color: theme.danger, fontWeight: "700" }]}>
          Superaste el límite en {formatPercent(over)}.
        </Text>
      ) : null}
    </View>
  );
}
