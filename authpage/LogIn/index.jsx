import {
  Text,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore, { authStore } from "../../store/authStore";
import ForgotPassword from "../ForgotPassword/index";

export default function LogIn({ onCreateAnAccount }) {
  const { logIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { forgotPassword, setForgotPassword } = useAuthStore();

  const handleLogIn = async () => {
    const result = await logIn(email, password);
    return;
  };

  return !forgotPassword ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
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
              <Text style={{ color: "gray" /* Tailwind gray-200 */ }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="default"
                style={{
                  borderBottomWidth: 2,
                  borderColor: "dimgray",
                  width: 384, // w-96
                  fontSize: 20, // text-xl
                  height: 40, // h-10
                  color: "dimgray",
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
              <Text style={{ color: "gray" }}>Password</Text>
              <View style={{ flexDirection: "row" }}>
                <TextInput
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="oneTimeCode"
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  keyboardType={
                    Platform.OS === "ios" ? "ascii-capable" : "visible-password"
                  }
                  style={{
                    borderBottomWidth: 2,
                    borderColor: "dimgray",
                    width: 320, // w-80
                    fontSize: 20,
                    height: 40,
                    color: "dimgray",
                  }}
                />
                <TouchableWithoutFeedback
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <View
                    style={{
                      borderBottomWidth: 2,
                      borderColor: "dimgray",
                      width: 64, // w-16
                      alignItems: "flex-end",
                    }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={30}
                      color="dimgray"
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
            <TouchableWithoutFeedback onPress={() => setForgotPassword(true)}>
              <Text style={{ color: "gray" }}>Forgot Password</Text>
            </TouchableWithoutFeedback>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogIn}
            style={{
              backgroundColor: "dimgray",
              width: 192, // w-48
              height: 56, // h-14
              borderRadius: 9999, // rounded-full
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "white", // Tailwind green-500
              }}
            >
              Log In
            </Text>
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
          <Text style={{ color: "gray" }}>Don't have an account?</Text>
          <TouchableOpacity onPress={onCreateAnAccount}>
            <Text style={{ color: "dimgray", fontSize: 24 }}>
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
