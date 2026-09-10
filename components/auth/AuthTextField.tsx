import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { theme } from "@/constants/theme";
import { typography } from "@/lib/theme/typography";

type AuthTextFieldProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  error?: string;
  inputStyle?: StyleProp<TextStyle>;
  keyboardType?: KeyboardTypeOptions;
  label?: string;
  maxLength?: number;
  multiline?: boolean;
  onBlur?: () => void;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  placeholderTextColor?: string;
  returnKeyType?: "done" | "next" | "search" | "go" | "default";
  secureTextEntry?: boolean;
  value: string;
};

export function AuthTextField({
  autoCapitalize = "none",
  autoCorrect = false,
  containerStyle,
  disabled = false,
  error,
  inputStyle,
  keyboardType = "default",
  label,
  maxLength,
  multiline = false,
  onBlur,
  onChangeText,
  onSubmitEditing,
  placeholder,
  placeholderTextColor = theme.colors.placeholder,
  returnKeyType = "done",
  secureTextEntry = false,
  value,
}: AuthTextFieldProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{
          disabled,
        }}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        editable={!disabled}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        onBlur={onBlur}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          inputStyle,
          error ? styles.inputError : null,
          disabled ? styles.inputDisabled : null,
        ]}
        value={value}
      />

      {error ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function AuthPasswordField(
  props: Omit<AuthTextFieldProps, "secureTextEntry"> & {
    showPassword: boolean;
    onToggleVisibility: () => void;
  },
) {
  const { showPassword, onToggleVisibility, ...rest } = props;

  return (
    <View style={[styles.container, rest.containerStyle]}>
      {rest.label ? <Text style={styles.label}>{rest.label}</Text> : null}

      <View style={styles.passwordWrap}>
        <TextInput
          accessibilityLabel={rest.label ?? rest.placeholder}
          accessibilityState={{
            disabled: rest.disabled,
          }}
          autoCapitalize={rest.autoCapitalize ?? "none"}
          autoCorrect={rest.autoCorrect ?? false}
          editable={!rest.disabled}
          keyboardType={rest.keyboardType ?? "default"}
          maxLength={rest.maxLength}
          multiline={rest.multiline}
          onBlur={rest.onBlur}
          onChangeText={rest.onChangeText}
          onSubmitEditing={rest.onSubmitEditing}
          placeholder={rest.placeholder}
          placeholderTextColor={
            rest.placeholderTextColor ?? theme.colors.placeholder
          }
          returnKeyType={rest.returnKeyType ?? "done"}
          secureTextEntry={!showPassword}
          style={[
            styles.input,
            styles.passwordInput,
            rest.inputStyle,
            rest.error ? styles.inputError : null,
            rest.disabled ? styles.inputDisabled : null,
          ]}
          value={rest.value}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
          }
          accessibilityState={{
            disabled: rest.disabled,
          }}
          disabled={rest.disabled}
          hitSlop={8}
          onPress={onToggleVisibility}
          style={styles.eyeButton}
        >
          <Ionicons
            color={theme.colors.textMuted}
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={21}
          />
        </Pressable>
      </View>

      {rest.error ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {rest.error}
        </Text>
      ) : null}
    </View>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  input: {
    backgroundColor: "#FBFBFD",
    borderColor: "transparent",
    borderRadius: 16,
    borderWidth: 1,

    color: "#3F3F3F",

    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: "700",

    minHeight: 52,

    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  inputDisabled: {
    opacity: 0.7,
  },

  inputError: {
    borderColor: theme.colors.error,
  },

  label: {
    color: theme.colors.textDark,

    fontFamily: typography.fontFamily.emphasis,
    fontSize: 13,
    fontWeight: "800",

    marginBottom: 7,
    marginLeft: 2,
  },

  passwordInput: {
    paddingRight: 52,
  },

  passwordWrap: {
    position: "relative",
    width: "100%",
  },

  eyeButton: {
    position: "absolute",
    right: 10,
    top: 0,

    width: 40,
    height: 52,

    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    color: theme.colors.error,

    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "700",

    marginLeft: 4,
    marginTop: 5,
  },
});
