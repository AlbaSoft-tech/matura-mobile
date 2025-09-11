// In SignUp.jsx
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import useAuthStore from "../../store/authStore";
import VerifyAccount from "./verifyAccount";

export default function SignUp({ onAlreadyHaveAnAccount }) {
    const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, signUp, verifyAccount} = useAuthStore();

  const handleSignUp = async () => {
    if (!email.trim() || !username.trim() || !password.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    const result = await signUp(username, email, password);
    if (result.success) {
      return;
    } else {
      alert(result.message || "Sign up failed. Please try again.");
    }
    return;
  };

  if (verifyAccount) { return(<VerifyAccount></VerifyAccount>)}
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
            {/* Email Field */}
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
                keyboardType="default"
                autoCapitalize="none"
                style={{
                  borderBottomWidth: 2,
                  borderColor: "#4b5563",
                  width: SCREEN_WIDTH * 0.9,
                  fontSize: 20,
                  color: "white",
                }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Username Field */}
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
                keyboardType="default"
                style={{
                  borderBottomWidth: 2,
                  borderColor: "#4b5563",
                  width: SCREEN_WIDTH * 0.9,
                  fontSize: 20,
                  color: "white",
                }}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Password Field */}
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
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  keyboardType="default"
                  style={{
                    borderBottomWidth: 2,
                    borderColor: "#4b5563",
                    width: (SCREEN_WIDTH * 0.9)-64,
                    fontSize: 20,
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

          {/* Sign Up Button */}
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
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlayText: {
    marginTop: 15,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
