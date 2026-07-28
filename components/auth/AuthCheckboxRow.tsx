import { CheckIcon } from '@/components/icons/CheckIcon';
import { typography } from '@/lib/theme/typography';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

type AuthCheckboxRowProps = {
  checked: boolean;
  disabled?: boolean;
  label: React.ReactNode;
  onToggle: () => void;
  labelStyle?: StyleProp<TextStyle>;
};

export function AuthCheckboxRow({ checked, disabled = false, label, labelStyle, onToggle }: AuthCheckboxRowProps) {
  return (
    <Pressable disabled={disabled} onPress={onToggle} style={styles.row}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <CheckIcon /> : null}
      </View>
      {typeof label === 'string' ? <Text style={[styles.label, labelStyle]}>{label}</Text> : label}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: '#D8DADC',
    borderRadius: 6,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: '#0864C8',
  },
  label: {
    color: '#3F3F3F',
    flex: 1,
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: '700',
  },
});
