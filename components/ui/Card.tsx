import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { theme as layoutTheme } from "@/constants/theme";
import { useAppTheme } from "@/lib/theme/app-theme";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
};

/** Contenedor de superficie para tarjetas de la aplicación. */
export function Card({ children, style, padding = layoutTheme.spacing.md }: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.borderLight,
          borderRadius: layoutTheme.radius.card,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
