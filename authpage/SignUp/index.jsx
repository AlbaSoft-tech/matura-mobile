import {
  Text,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
} from "react-native";

import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";
import { ActivityIndicator } from "react-native";

export default function SignUp({ onAlreadyHaveAnAccount }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { user, isLoading, signUp, setIsSignUp } = useAuthStore();

  const handleSignUp = async () => {
    if (!email.trim() || !username.trim() || !password.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    const result = await signUp(username, email, password);
    if (result.success) {
      setIsSignUp(false);
    } else {
      alert(result.message || "Sign up failed. Please try again.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: "#343541" }}>
        <View
          style={{
            height: 384,
            flexDirection: "column",
            gap: 40,
            alignItems: "center",
          }}
        >
          <View
            style={{
              height: 224,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                height: 64,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#d1d5db" }}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  borderBottomWidth: 2,
                  borderColor: "#4b5563",
                  width: 384,
                  fontSize: 20,
                  height: 40,
                  color: "white",
                }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View
              style={{
                height: 64,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#d1d5db" }}>Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                style={{
                  borderBottomWidth: 2,
                  borderColor: "#4b5563",
                  width: 384,
                  fontSize: 20,
                  height: 40,
                  color: "white",
                }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View
              style={{
                height: 64,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#d1d5db" }}>Password</Text>
              <View style={{ flexDirection: "row" }}>
                <TextInput
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="newPassword"
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  keyboardType={
                    Platform.OS === "ios" ? "ascii-capable" : "default"
                  }
                  style={{
                    borderBottomWidth: 2,
                    borderColor: "#4b5563",
                    width: 320,
                    fontSize: 20,
                    height: 40,
                    color: "white",
                  }}
                  placeholderTextColor="#9ca3af"
                />
                <TouchableWithoutFeedback
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <View
                    style={{
                      borderBottomWidth: 2,
                      borderColor: "#4b5563",
                      width: 64,
                      alignItems: "flex-end",
                    }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={30}
                      color="#9ca3af"
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            style={{
              backgroundColor: "#3b82f6",
              width: 192,
              height: 56,
              borderRadius: 9999,
              justifyContent: "center",
              alignItems: "center",
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                Sign Up
              </Text>
            )}
          </TouchableOpacity>
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              marginTop: 40,
            }}
          >
            <Text style={{ color: "#d1d5db" }}>Already have an account?</Text>
            <TouchableOpacity onPress={onAlreadyHaveAnAccount}>
              <Text style={{ color: "#3b82f6", fontSize: 24 }}>
                Go to log in page
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const signUpStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#343541",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  formSection: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#202123",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
    alignItems: "center",
  },
  inputContainerGroup: {
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#d1d5db",
    marginBottom: 8,
  },
  textInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    color: "white",
    borderColor: "#4b5563",
    borderWidth: 1,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#374151",
    borderRadius: 10,
    borderColor: "#4b5563",
    borderWidth: 1,
  },
  passwordTextInput: {
    flex: 1,
    paddingLeft: 15,
    fontSize: 18,
    color: "white",
  },
  passwordToggle: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpButton: {
    backgroundColor: "#3b82f6",
    width: 200,
    height: 56,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 40,
  },
  signUpButtonText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  loginPromptContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    paddingBottom: 20,
  },
  loginPromptText: {
    fontSize: 16,
    color: "#d1d5db",
  },
  goToLoginText: {
    fontSize: 20,
    color: "#3b82f6",
    fontWeight: "bold",
  },
});
