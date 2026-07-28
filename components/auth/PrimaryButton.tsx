import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';
import { typography } from '@/lib/theme/typography';

type PrimaryButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  text: string;
};

export function PrimaryButton({ disabled = false, loading = false, onPress, style, text }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, style, disabled || loading ? styles.buttonDisabled : null, pressed && !disabled && !loading ? styles.buttonPressed : null]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.text}>{text}</Text>}
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
