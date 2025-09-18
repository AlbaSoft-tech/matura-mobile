import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import useAuthStore from "../store/authStore";

export default function RootLayout() {
  const { id, updateTokens } = useAuthStore();
  useEffect(() => {
    if (Platform.OS === "ios") {
      Purchases.configure({
        apiKey: "ios_api_key_here",
        appUserID: id,
      });
    } else if (Platform.OS === "android") {
      Purchases.configure({
        apiKey: "goog_hdxOoCZrPEFVhacBwlIqDAXaCrq",
        appUserID: id,
      });
    }
    getCustomerInfo();
    const listener = Purchases.addCustomerInfoUpdateListener(() => {
      try {
        const getTokens = async () => {
          await updateTokens();
        };
        getTokens();
      } catch (error) {
        console.log(error);
      }
    });

    return () => Purchases.removeCustomerInfoUpdateListener(listener);
  }, [id, updateTokens]);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log(customerInfo);
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
