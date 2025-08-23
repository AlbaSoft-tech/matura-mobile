import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from "../../store/authStore"; // Assuming this path is correct

export default function ShopScreen() {
  const { user, email, logOut, tokens, deleteAccount, isLoading } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [shop, setShop] = useState(true);

  const { width, height } = Dimensions.get("window");
  const priceIntokens = [
    { amount: 10, price: 1.65 },
    { amount: 50, price: 8.15 },
    { amount: 100, price: 16.25 },
  ];

  // Mock functions for demonstration
  const handleBuyTokens = (item) => {
    console.log(`Buying ${item.amount} tokens for ${item.price}MKD`);
    // Implement actual payment logic here
  };

  const handleLogout = () => {
    console.log("Logging out...");
    if (logOut) logOut();
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#343541", paddingTop: insets.top }}
    >
      <View
        style={{
          width: "100%", // Changed from "100vw" to "100%" for React Native
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20, // Added horizontal padding
          paddingVertical: 15, // Added vertical padding
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#202123", // Darker background
            paddingHorizontal: 15, // Adjusted padding
            paddingVertical: 8, // Adjusted padding
            borderRadius: 25, // Pill shape
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 }, // Consistent shadow
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            marginLeft: 0, // Removed marginLeft as padding is on header
            minWidth: 90, // Ensure it has a minimum width
            justifyContent: "center", // Center content
          }}
        >
          <Ionicons
            name="cash-outline"
            size={26}
            color="white" // White icon
            style={{ marginRight: 8 }} // Adjusted margin
          />
          <Text style={{ fontSize: 20, fontWeight: "600", color: "white" }}>
            {tokens}
          </Text>
        </View>

        <TouchableWithoutFeedback onPress={() => setShop(!shop)}>
          <View style={{ backgroundColor: "transparent" }}>
            <Ionicons
              name={shop ? "person-circle" : "cart"}
              size={40} // Adjusted size
              color="white" // White icon
              style={{ marginRight: 20 }}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>

      {shop ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1, // Allows content to grow and scroll
            justifyContent: "space-evenly",
            alignItems: "center",
            paddingVertical: 20,
            flexDirection: "column",
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#202123", // Darker background
              padding: 20, // Consistent padding
              borderRadius: 15, // Rounded corners
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              width: "90%", // Limit width for better appearance
              marginBottom: 30, // Space below this section
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{ fontSize: 30, fontWeight: "bold", color: "white" }}
              >
                1{" "}
              </Text>
              <Ionicons name="camera" size={35} color="white" />
              <Text
                style={{ fontSize: 30, fontWeight: "bold", color: "white" }}
              >
                {" "}
                = 3
              </Text>
              <Ionicons name="cash-outline" size={30} color="white" />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{ fontSize: 30, fontWeight: "bold", color: "white" }}
              >
                1
              </Text>
              <Ionicons name="help-circle" size={35} color="white" />
              <Text
                style={{ fontSize: 30, fontWeight: "bold", color: "white" }}
              >
                = 1
              </Text>
              <Ionicons name="cash-outline" size={30} color="white" />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{ fontSize: 30, fontWeight: "bold", color: "white" }}
              >
                1
              </Text>
              <Ionicons name="create" size={35} color="white" />
              <Text
                style={{ fontSize: 30, fontWeight: "bold", color: "white" }}
              >
                = 1
              </Text>
              <Ionicons name="cash-outline" size={30} color="white" />
            </View>
          </View>

          <View style={{ gap: 15, width: "100%", alignItems: "center" }}>
            {priceIntokens.map((item, index) => (
              <View
                key={index}
                style={{
                  width: width * 0.9,
                  height: 90,
                  backgroundColor: "#202123", // Darker background
                  borderRadius: 30, // More rounded
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                  flexDirection: "row",
                  paddingHorizontal: 20, // Adjusted padding
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 15,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24, // Adjusted font size
                      fontWeight: "bold",
                      color: "white", // White text
                    }}
                  >
                    {item.amount}
                  </Text>

                  <Ionicons name="cash-outline" size={30} color="white" />
                  <Text
                    style={{
                      fontSize: 24, // Adjusted font size
                      fontWeight: "bold",
                      color: "white", // White text
                    }}
                  >
                    = €{item.price}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#3b82f6", // Blue accent
                    paddingVertical: 12, // Adjusted padding
                    paddingHorizontal: 35, // Adjusted padding
                    borderRadius: 30, // Pill shape
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                  onPress={() => handleBuyTokens(item)} // Added onPress handler
                >
                  <Text
                    style={{ color: "white", fontSize: 18, fontWeight: "bold" }} // White text
                  >
                    Buy
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: "#343541", // Main dark background
            alignItems: "center",
            justifyContent: "flex-start", // Align content to the top
            padding: 20,
          }}
        >
          <Ionicons
            name={"person-circle"}
            size={150} // Adjusted size
            color="white" // White icon
            style={{ marginBottom: 20 }} // Space below picture
          />

          <Text
            style={{
              fontSize: 20, // Adjusted font size
              fontWeight: "bold",
              color: "white", // White text
              marginBottom: 5,
              marginTop: 15, // Space above label
            }}
          >
            Username
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#d1d5db", // Light gray text
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {user || "Përdoruesi"}
          </Text>
          <Text
            style={{
              fontSize: 20, // Adjusted font size
              fontWeight: "bold",
              color: "white", // White text
              marginBottom: 5,
              marginTop: 15, // Space above label
            }}
          >
            Email
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: "#d1d5db", // Light gray text
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            {email || "user@example.com"}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#dc2626", // Red accent
              paddingVertical: 12, // Adjusted padding
              paddingHorizontal: 45, // Adjusted padding
              borderRadius: 30, // Pill shape
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              marginTop: 30, // Space above logout button
            }}
            onPress={handleLogout} // Added onPress handler
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
              Logout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "#dc2626", // Red accent
              paddingVertical: 12, // Adjusted padding
              paddingHorizontal: 45, // Adjusted padding
              borderRadius: 30, // Pill shape
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              marginTop: 30, // Space above logout button
            }}
            onPress={deleteAccount} // Added onPress handler
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>

              {isLoading ? <ActivityIndicator color="white" /> : "Delete Account"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
