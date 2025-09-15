import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useAuthStore from "../../store/authStore";

export default function VerifyAccount() {
  const [code, setCode] = useState("");
  const { verifyAccountFunction, isLoading } = useAuthStore();

  const handlePress = async () => {
    if (!code.trim()) {
      alert("Please enter the verification code.");
      return;
    }
    const result = await verifyAccountFunction(code);
    if (result.success) {
      return;
    } else {
      alert(result.error || "Verification failed. Please try again.");
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraHeight={Platform.OS === "ios" ? 100 : 80} // adjusts for keyboard
      keyboardOpeningTime={0}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
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
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            maxLength={6}
            autoCapitalize="none"
            onChangeText={setCode}
            value={code}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handlePress}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
