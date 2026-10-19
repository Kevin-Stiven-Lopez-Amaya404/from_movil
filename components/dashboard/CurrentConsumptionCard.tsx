import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";

import { formatWatts } from "@/lib/utils/formatters";
import { styles } from "./CurrentConsumptionCard.styles";

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
