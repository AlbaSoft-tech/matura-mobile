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

import useAuthStore from "../../store/authStore";

import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function SignUp({ onAlreadyHaveAnAccount }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { user, isLoading, signUp, setIsSignUp } = useAuthStore();

  const handleSignUp = async () => {
    const result = await signUp(username, email, password);
    if (result.success) setIsSignUp(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        {/* Top Section */}
        <View
          style={{
            height: 384, // h-96
            flexDirection: "column",
            gap: 40,
            alignItems: "center",
          }}
        >
          <View
            style={{
              height: 224, // h-56
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Email Field */}
            <View
              style={{
                height: 64, // h-16
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "gray" }}>Email</Text>
              <TextInput
                onChangeText={setEmail}
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

            {/* Username Field */}
            <View
              style={{
                height: 64,
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "gray" }}>Username</Text>
              <TextInput
                onChangeText={setUsername}
                style={{
                  borderBottomWidth: 2,
                  borderColor: "dimgray",
                  width: 384,
                  fontSize: 20,
                  height: 40,
                  color: "dimgray",
                }}
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
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            style={{
              backgroundColor: "gray",
              width: 192, // w-48
              height: 56, // h-14
              borderRadius: 9999,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "white", // green-500
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
          <View
            style={{
              width: "100%",
              height: "100vh",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              marginTop: 40,
            }}
          >
            <Text style={{ color: "gray" }}>Already have an account?</Text>
            <TouchableOpacity onPress={onAlreadyHaveAnAccount}>
              <Text style={{ color: "dimgray", fontSize: 24 }}>
                Go to log in page
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Section */}
    </TouchableWithoutFeedback>
  );
}
