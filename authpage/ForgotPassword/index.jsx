import React, { useState, useContext } from "react";
import useAuthStore, { authStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import FirstStep from "./firstStep/index";
import SecondStep from "./secondStep/index";
import ThirdStep from "./thirdStep/index";

export const Context = React.createContext();

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const goToSecondPage = () => setStep(2);
  const goToThirdPage = () => setStep(3);
  const [email, setEmail] = useState("");
  const goToPrevious = () => setStep(step - 1);

  return step === 1 ? (
    <Context.Provider value={[email, setEmail]}>
      <FirstStep onContinue={goToSecondPage} />
    </Context.Provider>
  ) : step === 2 ? (
    <Context.Provider value={[email, setEmail]}>
      <SecondStep onContinue={goToThirdPage} goPrev={goToPrevious} />
    </Context.Provider>
  ) : (
    <Context.Provider value={[email, setEmail]}>
      <ThirdStep />
    </Context.Provider>
  );
}
