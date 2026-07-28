import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/lib/responsive/responsive';
import { typography } from '@/lib/theme/typography';
import { type ReactNode } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthScreenLayoutProps = {
  backgroundColor?: string;
  children: ReactNode;
  compact?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  title?: string;
  titleColor?: string;
  titleStyle?: StyleProp<TextStyle>;
};

export function AuthScreenLayout({
  backgroundColor,
  children,
  compact = false,
  contentStyle,
  title,
  titleColor,
  titleStyle,
}: AuthScreenLayoutProps) {
  const layout = useResponsiveLayout();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: backgroundColor ?? theme.colors.backgroundWhite }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingBottom: layout.safeBottom + 40,
              paddingHorizontal: layout.gutter,
              paddingTop: layout.safeTop + (layout.compact ? 30 : 70),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { maxWidth: layout.contentWidth }, contentStyle]}>
            {title ? (
              <Text
                style={[
                  styles.title,
                  compact && styles.titleCompact,
                  titleStyle,
                  titleColor ? { color: titleColor } : null,
                ]}
              >
                {title}
              </Text>
            ) : null}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    flexGrow: 1,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    color: theme.colors.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: 42,
    fontWeight: '700',
    lineHeight: 50,
    marginBottom: 24,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 36,
    lineHeight: 43,
    marginBottom: 18,
  },
});
