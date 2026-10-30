import { StyleSheet, Text } from 'react-native';

import { useAuthPalette } from '@/lib/theme/appearance';
import { typography } from '@/lib/theme/typography';

type FormErrorTextProps = {
  children: string;
};

export function FormErrorText({ children }: FormErrorTextProps) {
  const palette = useAuthPalette();
  return <Text style={[styles.text, { color: palette.formError }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: '#D32F2F',
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
});
