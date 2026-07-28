import { StyleSheet, Text } from 'react-native';

import { typography } from '@/lib/theme/typography';

type FormErrorTextProps = {
  children: string;
};

export function FormErrorText({ children }: FormErrorTextProps) {
  return <Text style={styles.text}>{children}</Text>;
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
