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
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  formContainer: {
    gap: 16,
    width: "100%",
  },

  input: {
    backgroundColor: "#FBFBFD",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 17,

    color: "#3F3F3F",

    fontFamily: authFont,
    fontSize: 15,
    fontWeight: "500",

    height: 56,

    paddingHorizontal: 18,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,

    elevation: 5,
  },

  button: {
    marginTop: 8,
  },
});
