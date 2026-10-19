import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, TextInput, View, type KeyboardTypeOptions, type StyleProp, type TextStyle, type ViewStyle } from "react-native";


import { useAuthPalette } from "@/lib/theme/appearance";
import { styles } from "./AuthTextField.styles";


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
  variant?: "default" | "outlined";
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
  placeholderTextColor,
  returnKeyType = "done",
  secureTextEntry = false,
  variant = "default",
  value,
}: AuthTextFieldProps) {
  const palette = useAuthPalette();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, { color: palette.text }]}>{label}</Text> : null}

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
        onBlur={() => {
          if (variant === "outlined") {
            setFocused(false);
          }
          onBlur?.();
        }}
        onChangeText={onChangeText}
        onFocus={() => {
          if (variant === "outlined") {
            setFocused(true);
          }
        }}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? palette.muted}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          inputStyle,
          {
            backgroundColor: palette.field,
            borderColor: palette.fieldBorder,
            color: palette.text,
          },
          variant === "outlined"
            ? {
                borderColor: focused
                  ? palette.button
                  : palette.fieldBorder === "transparent"
                    ? "#CBD5E1"
                    : palette.fieldBorder,
              }
            : null,
          error ? [styles.inputError, { borderColor: palette.danger }] : null,
          disabled ? styles.inputDisabled : null,
        ]}
        value={value}
      />

      {error ? (
        <Text
          accessibilityRole="alert"
          style={[styles.errorText, { color: palette.danger }]}
        >
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
  const palette = useAuthPalette();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, rest.containerStyle]}>
      {rest.label ? (
        <Text style={[styles.label, { color: palette.text }]}>{rest.label}</Text>
      ) : null}

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
          onBlur={() => {
            if (rest.variant === "outlined") {
              setFocused(false);
            }
            rest.onBlur?.();
          }}
          onChangeText={rest.onChangeText}
          onFocus={() => {
            if (rest.variant === "outlined") {
              setFocused(true);
            }
          }}
          onSubmitEditing={rest.onSubmitEditing}
          placeholder={rest.placeholder}
          placeholderTextColor={
            rest.placeholderTextColor ?? palette.muted
          }
          returnKeyType={rest.returnKeyType ?? "done"}
          secureTextEntry={!showPassword}
          style={[
            styles.input,
            styles.passwordInput,
            rest.inputStyle,
            {
              backgroundColor: palette.field,
              borderColor: palette.fieldBorder,
              color: palette.text,
            },
            rest.variant === "outlined"
              ? {
                  borderColor: focused
                    ? palette.button
                    : palette.fieldBorder === "transparent"
                      ? "#CBD5E1"
                      : palette.fieldBorder,
                }
              : null,
            rest.error
              ? [styles.inputError, { borderColor: palette.danger }]
              : null,
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
            color={palette.muted}
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={21}
          />
        </Pressable>
      </View>

      {rest.error ? (
        <Text
          accessibilityRole="alert"
          style={[styles.errorText, { color: palette.danger }]}
        >
          {rest.error}
        </Text>
      ) : null}
    </View>
  );
}

// ======================================================
// ESTILOS
// ======================================================
