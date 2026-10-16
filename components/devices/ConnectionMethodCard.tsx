
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";

type IconName = React.ComponentProps<
  typeof Ionicons
>["name"];

type Props = {
  title: string;
  description: string;
  icon: IconName;
  expanded: boolean;
  onPress: () => void;
  disabled?: boolean;
  children?: ReactNode;
};

export function ConnectionMethodCard({
  title,
  description,
  icon,
  expanded,
  onPress,
  disabled = false,
  children,
}: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: expanded
            ? theme.blue
            : theme.borderLight,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{
          expanded,
          disabled,
        }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.header,
          pressed && { opacity: 0.72 },
          disabled && { opacity: 0.5 },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: theme.rowAlt },
          ]}
        >
          <Ionicons
            name={icon}
            size={24}
            color={theme.blue}
          />
        </View>

        <View style={styles.textWrap}>
          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.description,
              { color: theme.muted },
            ]}
          >
            {description}
          </Text>
        </View>

        <Ionicons
          name={
            expanded
              ? "chevron-up"
              : "chevron-down"
          }
          size={20}
          color={theme.muted}
        />
      </Pressable>

      {expanded && children ? (
        <View
          style={[
            styles.content,
            { borderTopColor: theme.borderLight },
          ]}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 12,
    minHeight: 78,
  },
  iconWrap: {
    height: 48,
    width: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  content: {
    borderTopWidth: 1,
    padding: 16,
  },
});
