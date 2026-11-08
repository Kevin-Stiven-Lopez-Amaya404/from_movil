import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

type Props = { children: ReactNode };

/** Prevents the keyboard from covering buttons and fields on form screens. */
export function KeyboardAvoidingScreen({ children }: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
