import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type AddNameRowProps = {
  backgroundColor: string;
  borderColor: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  placeholderTextColor: string;
  textColor: string;
  value: string;
};

const appFont = typography.fontFamily.emphasis;

/**
 * Campo de ingreso con boton de envio rapido.
 *
 * Se utiliza en pantalla de hogares y en cualquier lugar donde el usuario
 * deba ingresar un nombre corto y confirmar en la misma fila.
 */
export function AddNameRow({
  backgroundColor,
  borderColor,
  onChangeText,
  onSubmit,
  placeholder,
  placeholderTextColor,
  textColor,
  value,
}: AddNameRowProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.addRow}>
      <TextInput
        style={[styles.addInput, { backgroundColor, borderColor, color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={onChangeText}
      />

      {/* Boton de envio a la derecha del input. Mantiene la fila compacta. */}
      <Pressable
        style={[styles.addButton, { backgroundColor: theme.brandStrong }]}
        onPress={onSubmit}
      >
        <Ionicons name="add" size={24} color={theme.onPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  addRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  addInput: {
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "700",
    height: 48,
    paddingHorizontal: 14,
  },
  addButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
});
