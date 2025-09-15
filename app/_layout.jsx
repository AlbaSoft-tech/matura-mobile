import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import useAuthStore from "../store/authStore";

export default function RootLayout() {
  const { id } = useAuthStore();
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

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
  }, [id]);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log(customerInfo);
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
