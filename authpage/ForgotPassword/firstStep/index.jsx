import { useContext, useState } from "react";
import useAuthStore, { authStore } from "../../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Context } from "../index";

export default function FirstStep({ onContinue }) {
  const { setForgotPassword } = useAuthStore();
  const [email, setEmail] = useContext(Context);
  const handlePress = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }
    const response = await fetch(
      "https://maturabackend.onrender.com/api/auth/forgotPassword",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }
    );

    onContinue();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => setForgotPassword(false)}
          style={{ alignSelf: "flex-start", padding: 10, marginBottom: 20 }}
        >
          <Ionicons name="arrow-back" size={40} color="dimgray" />
        </TouchableOpacity>

        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address below and we'll send you a password reset
          code.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.messageContainer}></View>

        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
}

// StyleSheet for React Native components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6", // Equivalent to bg-gray-100
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // For Android shadow
    width: "100%",
    maxWidth: 400, // Equivalent to max-w-md
  },
  title: {
    fontSize: 28, // Equivalent to text-3xl
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937", // Equivalent to text-gray-800
    marginBottom: 24, // Equivalent to mb-6
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563", // Equivalent to text-gray-600
    textAlign: "center",
    marginBottom: 24, // Equivalent to mb-6
  },
  inputGroup: {
    marginBottom: 16, // Equivalent to mb-4
  },
  label: {
    fontSize: 14, // Equivalent to text-sm
    color: "#374151", // Equivalent to text-gray-700
    fontWeight: "500", // Equivalent to font-medium
    marginBottom: 8, // Equivalent to mb-2
  },
  input: {
    height: 48, // py-3 px-4 implies a certain height
    borderColor: "#d1d5db", // Equivalent to border
    borderWidth: 1,
    borderRadius: 6, // Equivalent to rounded-md
    paddingHorizontal: 16, // Equivalent to px-4
    fontSize: 16,
    color: "#374151", // Equivalent to text-gray-700
  },
  messageContainer: {
    marginBottom: 16, // Equivalent to mb-4
    // Add styles for success/error messages if you want to visually represent them
  },
  successMessage: {
    padding: 12, // Equivalent to p-3
    borderRadius: 6, // Equivalent to rounded-md
    fontSize: 14, // Equivalent to text-sm
    backgroundColor: "#d1fae5", // Equivalent to bg-green-100
    color: "#065f46", // Equivalent to text-green-700
  },
  errorMessage: {
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: "#fee2e2", // Equivalent to bg-red-100
    color: "#991b1b", // Equivalent to text-red-700
  },
  button: {
    width: "100%",
    backgroundColor: "dimgray", // Equivalent to bg-blue-600
    paddingVertical: 12, // Equivalent to py-3
    paddingHorizontal: 16, // Equivalent to px-4
    borderRadius: 100, // Equivalent to rounded-md
    alignItems: "center",
    justifyContent: "center",
    // No hover/transition effects here as they are for web, but TouchableOpacity handles press feedback
  },
  buttonText: {
    color: "#fff", // Equivalent to text-white
    fontSize: 16,
    fontWeight: "bold",
  },
});
