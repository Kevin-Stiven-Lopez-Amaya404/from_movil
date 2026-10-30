import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';
import { useAuthPalette } from '@/lib/theme/appearance';
import { typography } from '@/lib/theme/typography';

type PrimaryButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  text: string;
};

export function PrimaryButton({ disabled = false, loading = false, onPress, style, text }: PrimaryButtonProps) {
  const palette = useAuthPalette();
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.primaryButton },
        style,
        isInactive
          ? [styles.buttonDisabled, { backgroundColor: palette.disabledBackground }]
          : null,
        pressed && !isInactive
          ? [styles.buttonPressed, { backgroundColor: palette.primaryButtonPressed }]
          : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isInactive ? palette.disabledForeground : palette.onPrimary} />
      ) : (
        <Text style={[styles.text, { color: isInactive ? palette.disabledForeground : palette.onPrimary }]}>
          {text}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#9AA8C2',
    opacity: 0.8,
  },
  buttonPressed: {
    backgroundColor: '#004FA5',
  },
  text: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 17,
    fontWeight: '800',
  },
});
