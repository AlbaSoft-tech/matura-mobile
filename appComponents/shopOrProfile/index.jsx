import React, { useState } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";

export default function ShopScreen() {
  const { user, email, logOut } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [shop, setShop] = useState(true);

  const { width, height } = Dimensions.get("window");
  const tokens = [
    { amount: 10, price: 200 },
    { amount: 50, price: 900 },
    { amount: 100, price: 1600 },
  ];

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f4f4f4", paddingTop: insets.top }}
    >
      <View
        style={{
          width: "100vw",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
            marginLeft: 20,
            width: 90,
            height: 40,
            justifyContent: "space-between",
          }}
        >
          <Ionicons
            name="cash-outline"
            size={26}
            color="dimgray"
            style={{ marginRight: 6 }}
          />
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#374151" }}>
            14
          </Text>
        </View>
        <TouchableWithoutFeedback onPress={() => setShop(!shop)}>
          <Ionicons
            name={shop ? "person-circle" : "cart"}
            size={60}
            color="dimgray"
            style={{ marginRight: 20 }}
          />
        </TouchableWithoutFeedback>
      </View>
      {shop ? (
        <View
          style={{
            flex: 1,
            backgroundColor: "#f3f4f6",
            justifyContent: "space-evenly",
            alignItems: "center",
            paddingVertical: 16,
            flexDirection: "column",
          }}
        >
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 50 }}>1 </Text>
              <Ionicons name="cash-outline" size={40} color="dimgray" />
              <Text style={{ fontSize: 50 }}> = 20MKD</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 50 }}>1 </Text>
              <Ionicons name="camera" size={45} color="dimgray" />
              <Text style={{ fontSize: 50 }}> = 10</Text>
              <Ionicons name="cash-outline" size={40} color="dimgray" />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 50 }}>1</Text>
              <Ionicons name="help" size={45} color="dimgray" />
              <Text style={{ fontSize: 50 }}>= 1</Text>
              <Ionicons name="cash-outline" size={40} color="dimgray" />
            </View>
          </View>
          <View style={{ gap: 20 }}>
            {tokens.map((item, index) => (
              <View
                key={index}
                style={{
                  width: width * 0.9,
                  height: 90,
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                  flexDirection: "row",
                  padding: 24,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "row", gap: 20 }}>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "bold",
                      color: "dimgray",
                    }}
                  >
                    {item.amount}
                  </Text>

                  <Ionicons name="cash-outline" size={40} color="dimgray" />
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "bold",
                      color: "dimgray",
                    }}
                  >
                    = ${item.price}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: "dimgray",
                    paddingVertical: 10,
                    paddingHorizontal: 32,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
                  >
                    Buy
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#f4f4f4",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: 20,
          }}
        >
          {/* Profile Picture */}
          <Ionicons
            name={"person-circle"}
            size={200}
            color="dimgray"
            style={{ marginRight: 20 }}
          />

          {/* Name */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#333",
              marginBottom: 10,
            }}
          >
            Username
          </Text>

          {/* Bio */}
          <Text
            style={{
              fontSize: 16,
              color: "#777",
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            {user || "John Doe"}
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#333",
              marginBottom: 10,
            }}
          >
            Email
          </Text>

          {/* Bio */}
          <Text
            style={{
              fontSize: 16,
              color: "#777",
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            {email || "JohnDoe@example.com"}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "dimgray",
              paddingVertical: 10,
              paddingHorizontal: 40,
              borderRadius: 30,
            }}
            onPress={() => logOut()}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
