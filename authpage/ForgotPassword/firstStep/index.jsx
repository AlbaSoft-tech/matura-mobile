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
import { Context } from "../index"; // Assuming Context is defined correctly

export default function FirstStep({ onContinue }) {
  const { setForgotPassword } = useAuthStore();
  const [email, setEmail] = useContext(Context); // Assuming setEmail is the setter from Context
  const handlePress = async () => {
    if (!email) {
      alert("Please enter your email address"); // Keeping alert as per user instruction
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

    // You might want to add error handling and success messages here
    // For example:
    if (response.ok) {
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Failed to send reset email.");
    }

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
            <Ionicons name="arrow-back" size={40} color="#d1d5db" /> 
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
              placeholderTextColor="#9ca3af" /* Placeholder color */
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
    backgroundColor: "#343541", // Main dark background
    padding: 16,
  },
  card: {
    backgroundColor: "#202123", // Darker background for card
    padding: 20,
    borderRadius: 15, // More rounded corners
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "white", // White title text
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: "#d1d5db", // Light gray subtitle text
    textAlign: "center",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#d1d5db", // Light gray label text
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderColor: "#4b5563", // Subtle border color
    borderWidth: 1,
    borderRadius: 10, // More rounded input fields
    paddingHorizontal: 16,
    fontSize: 16,
    color: "white", // White input text
    backgroundColor: "#374151", // Darker background for input field
  },
  messageContainer: {
    marginBottom: 16,
  },
  successMessage: {
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: "#22c55e", // Green accent for success background
    color: "white", // White text for success
  },
  errorMessage: {
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: "#dc2626", // Red accent for error background
    color: "white", // White text for error
  },
  button: {
    width: "100%",
    backgroundColor: "#3b82f6", // Blue accent for button background
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30, // Pill shape for button
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white", // White text on button
    fontSize: 16,
    fontWeight: "bold",
  },
});
