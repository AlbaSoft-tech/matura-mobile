import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

export default function RootLayout() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: "still not available" });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: "goog_hdxOoCZrPEFVhacBwlIqDAXaCrq" });
    }

    Purchases.getOfferings().then(console.log())

    getCustomerInfo()
  }, []);

  async function getCustomerInfo () {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log(customerInfo)
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
