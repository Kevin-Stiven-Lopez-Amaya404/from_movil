import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const authFont = typography.fontFamily.emphasis;

export const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    width: "100%",
  },

  header: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontFamily: authFont,
    fontSize: typography.size.section,
    fontWeight: "700",
    marginBottom: 20,
  },

  formContainer: {
    gap: 16,
    width: "100%",
  },

  input: {
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 17,


    fontFamily: authFont,
    fontSize: typography.size.body,
    fontWeight: "500",

    height: 56,

    paddingHorizontal: 18,

    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,

    elevation: 5,
  },

  strengthContainer: {
    height: 4,


    borderRadius: 2,

    marginTop: 8,

    overflow: "hidden",
  },

  strengthBar: {
    height: "100%",
  },

  button: {
    marginTop: 8,
  },
});
