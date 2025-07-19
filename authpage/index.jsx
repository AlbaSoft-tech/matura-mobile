import { Image, Touchable, TouchableWithoutFeedback, View, Keyboard } from "react-native";
import { useState, useContext } from "react";
import LogIn from "./LogIn/index";
import SignUp from "./SignUp/index";
import useAuthStore, { authStore } from "../store/authStore";
import { Ionicons } from "@expo/vector-icons";

export default function Auth() {
  const { isSignUp, setIsSignUp } = useAuthStore();

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={{
          height: "40%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#343541",
        }}
      >
        <Ionicons name="school" size={250} color={"#3b82f6"} />
      </View>
      </TouchableWithoutFeedback>
      {isSignUp ? (
        <SignUp onAlreadyHaveAnAccount={() => setIsSignUp(false)} />
      ) : (
        <LogIn onCreateAnAccount={() => setIsSignUp(true)} />
      )}
    </View>
  );
}
