import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { formatWatts } from "@/lib/utils/formatters";

type Props = {
  power: number;
  isOn: boolean;
};

export function CurrentConsumptionCard({ power, isOn }: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.rowAlt,
            },
          ]}
        >
          <Ionicons name="flash" size={20} color={theme.blue} />
        </View>

        <View
          style={[
            styles.status,
            {
              backgroundColor: isOn ? theme.successSoft : theme.rowAlt,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isOn ? theme.success : theme.muted,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: isOn ? theme.success : theme.muted,
              },
            ]}
          >
            {isOn ? "Activo" : "Apagado"}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.label,
          {
            color: theme.muted,
          },
        ]}
      >
        Consumo actual
      </Text>

      <Text
        style={[
          styles.value,
          {
            color: theme.text,
          },
        ]}
      >
        {formatWatts(power)}
      </Text>

      <Text
        style={[
          styles.helper,
          {
            color: theme.muted,
          },
        ]}
      >
        Potencia instantánea
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minHeight: 156,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  iconContainer: {
    alignItems: "center",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  status: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  statusDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },

  statusText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    fontWeight: typography.weight.bold,
  },

  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    fontWeight: typography.weight.medium,
    marginTop: 16,
  },

  value: {
    fontFamily: typography.fontFamily.display,
    fontSize: 28,
    fontWeight: typography.weight.heavy,
    marginTop: 2,
  },

  helper: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    marginTop: 3,
  },
});
