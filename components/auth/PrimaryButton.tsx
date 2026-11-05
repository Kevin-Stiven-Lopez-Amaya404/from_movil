import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { Button } from "@/components/ui/Button";

type PrimaryButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  text: string;
};

/** Compatibilidad para formularios de acceso mientras adoptan Button directamente. */
export function PrimaryButton({
  disabled = false,
  loading = false,
  onPress,
  style,
  text,
}: PrimaryButtonProps) {
  return (
    <Button
      colorSource="auth"
      disabled={disabled}
      fullWidth
      labelSize="bodyLarge"
      label={text}
      loading={loading}
      onPress={onPress}
      style={[styles.button, style]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    minHeight: 54,
  },
});
