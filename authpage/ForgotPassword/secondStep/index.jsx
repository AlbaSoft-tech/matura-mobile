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
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Context } from "../index"; // Assuming Context is defined correctly

export default function SecondStep({ onContinue, goPrev }) {
  const goBack = () => {
    goPrev();
  };
  const { setForgotPasswordToken } = useAuthStore();
  const [email, setEmail] = useContext(Context);
  const [code, setCode] = useState("");

  const handlePress = async () => {
    if (!code.trim()) {
      // Added trim for validation
      alert("Please enter the verification code.");
      return;
    }
    try {
      const response = await fetch(
        "https://matura-backend.onrender.com/api/auth/verifyCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // Get error message from response
        alert(errorData.message || "Code Incorrect. Please try again.");
        return;
      }

      const data = await response.json();
      setForgotPasswordToken(data.token);
      onContinue();
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjust as needed
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.card}>
            <TouchableOpacity
              onPress={goBack}
              style={{ alignSelf: "flex-start", padding: 10, marginBottom: 20 }}
            >
              <Ionicons name="arrow-back" size={40} color="#d1d5db" />
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
                placeholderTextColor="#9ca3af" /* Changed placeholder color */
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#343541",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "#202123",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#d1d5db",
    textAlign: "center",
    marginBottom: 25,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#d1d5db",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: 15,
    fontSize: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4b5563",
    backgroundColor: "#374151",
    textAlign: "center",
    color: "white",
  },
  button: {
    backgroundColor: "#3b82f6",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
