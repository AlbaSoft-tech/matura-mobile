import { Image, View } from "react-native";
import { useState, useContext } from "react";
import LogIn from "./LogIn/index";
import SignUp from "./SignUp/index";
import useAuthStore, { authStore } from "../store/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function Auth() {
  const { isSignUp, setIsSignUp } = useAuthStore();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          height: "40%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="school" size={250} color={"dimgray"} />
      </View>
      {isSignUp ? (
        <SignUp onAlreadyHaveAnAccount={() => setIsSignUp(false)} />
      ) : (
        <LogIn onCreateAnAccount={() => setIsSignUp(true)} />
      )}
    </View>
  );
}
