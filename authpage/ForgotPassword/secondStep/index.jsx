import React, { useState, useContext } from "react";
import useAuthStore from "../../../store/authStore";
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
import { Context } from "../index"; // ✅ Correct import

export default function SecondStep({ onContinue, goPrev }) {
  const goBack = () => {goPrev()}
  const { setForgotPasswordToken } = useAuthStore(); // ✅ Inside the component
  const [email, setEmail] = useContext(Context); // ✅ Now inside component
  const [code, setCode] = useState("");

  const handlePress = async () => {
    try {
      const response = await fetch(
        "https://maturabackend.onrender.com/api/auth/verifyCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code }),
        }
      );

      if (!response.ok) {
        alert("Code Incorrect");
        return;
      }

      const data = await response.json(); // ✅ Await here
      setForgotPasswordToken(data.token);
      onContinue();
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          onPress={goBack}
          style={{ alignSelf: "flex-start", padding: 10, marginBottom: 20 }}
        >
          <Ionicons name="arrow-back" size={40} color="dimgray" />
        </TouchableOpacity>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We’ve sent a 6-digit code to your email. Please enter it below to
          continue.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>6-Digit Code</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            keyboardType="numeric"
            maxLength={6}
            autoCapitalize="none"
            onChangeText={setCode}
            value={code}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f7f7", // Light background for contrast
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5, // For Android shadow
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: 10,
    fontSize: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "dimgray", // Green for a call-to-action
    width: "100%",
    paddingVertical: 14,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
};
