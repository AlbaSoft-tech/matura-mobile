import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import useAuthStore from "../../store/authStore"; // Assuming useAuthStore is a named export
import ForgotPassword from "../ForgotPassword/index";

export default function LogIn({ onCreateAnAccount }) {
  const { logIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { forgotPassword, setForgotPassword, isLoading } = useAuthStore();
  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  const handleLogIn = async () => {
    const result = await logIn(email, password);
    return;
  };

  return !forgotPassword ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={{ flex: 1, backgroundColor: "#343541" /* Main background */ }}
      >
        {/* Top Form Section */}
        <View
          style={{
            height: 320, // h-80 (80 * 4)
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              height: 208, // h-52 (52 * 4)
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Email Field */}
            <View
              style={{
                height: 64, // h-16 (16 * 4)
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#d1d5db" /* Light gray text */ }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={{
                  borderBottomWidth: 2,
                  borderColor: "#4b5563" /* Subtle border color */,
                  width: SCREEN_WIDTH * 0.9,
                  fontSize: 20, // text-xl
                  color: "white" /* White text input */,
                }}
              />
            </View>

            {/* Password Field */}
            <View
              style={{
                height: 64, // h-16
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#d1d5db" /* Light gray text */ }}>
                Password
              </Text>
              <View style={{ flexDirection: "row" }}>
                <TextInput
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="oneTimeCode"
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  keyboardType="default"
                  style={{
                    borderBottomWidth: 2,
                    borderColor: "#4b5563" /* Subtle border color */,
                    width: SCREEN_WIDTH * 0.9 - 64,
                    fontSize: 20,
                    color: "white" /* White text input */,
                  }}
                />
                <TouchableWithoutFeedback
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <View
                    style={{
                      borderBottomWidth: 2,
                      borderColor: "#4b5563" /* Subtle border color */,
                      width: 64, // w-16
                      alignItems: "flex-end",
                    }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={30}
                      color="#9ca3af" /* Placeholder/icon color */
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
            <TouchableWithoutFeedback onPress={() => setForgotPassword(true)}>
              <Text style={{ color: "#3b82f6" /* Blue accent for link */ }}>
                Forgot Password
              </Text>
            </TouchableWithoutFeedback>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogIn}
            style={{
              backgroundColor:
                "#3b82f6" /* Blue accent for button background */,
              width: 192, // w-48
              height: 56, // h-14
              borderRadius: 9999, // rounded-full
              justifyContent: "center",
              alignItems: "center",
            }}
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
                Log In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Sign-Up Prompt */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Text style={{ color: "#d1d5db" /* Light gray text */ }}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={onCreateAnAccount}>
            <Text
              style={{
                color: "#3b82f6",
                fontSize: 24 /* Blue accent for link */,
              }}
            >
              Create an Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  ) : (
    <ForgotPassword></ForgotPassword>
  );
}
