import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from "../../store/authStore"; // Assuming this path is correct

export default function ShopScreen() {
  const {
    user,
    email,
    logOut,
    tokens,
    deleteAccount,
    amend,
    setUser,
    sendEmailCode,
  } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [shop, setShop] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toggleamendPassword, setToggleAmendPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [toggleamendUsername, setToggleAmendUsername] = useState(false);
  const [toggleamendEmail, setToggleAmendEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [firstStep, setFirstStep] = useState(true);
  const [code, setCode] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
  };

  const handlePasswordPress = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in both fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }
    setIsChangingPassword(true);
    const info = {
      type: "password",
      newPassword: newPassword,
      oldPassword: oldPassword,
    };

    await amend(info);
    setIsChangingPassword(false);
    setToggleAmendPassword(false);
    setNewPassword("");
    setOldPassword("");
    setConfirmPassword("");
  };

  const handleEmailPress = async () => {
    if (!newEmail) {
      Alert.alert("Error", "Please fill in the email field");
      return;
    }

    const info = {
      type: "email",
      value: newEmail,
    };

    const response = await amend(info);
    setFirstStep(false);
    setNewEmail("");
  };
  const handleEmailCode = async () => {
    if (!code) {
      Alert.alert("Error", "Please fill in the code field");
      return;
    }
    const response = await sendEmailCode(code);

    if (response.ok) {
      setToggleAmendEmail(false);
      setFirstStep(true);
      setCode("");
    }
    setCode("");
  };
  const handleUserPress = async () => {
    if (!newUsername) {
      Alert.alert("Error", "Please fill in the username field");
      return;
    }

    const info = {
      type: "username",
      username: newUsername,
    };
    console.log(newUsername);

    const response = await amend(info);
    if (response.ok) {
      setUser(newUsername);
      setToggleAmendUsername(false);
      setNewUsername("");
      return;
    }
    setNewUsername("");
    setToggleAmendUsername(false);
    return;
  };

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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, alignItems: "center", width: "100%" }}>
              <Ionicons
                name={"person-circle"}
                size={150} // Adjusted size
                color="white" // White icon
                style={{ marginBottom: 20 }} // Space below picture
              />
              {!toggleamendUsername ? (
                <View style={{ alignItems: "center", marginBottom: 30 }}>
                  {/* Row for Username and edit icon */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      Username
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setToggleAmendUsername(true);
                        setToggleAmendEmail(false);
                        setToggleAmendPassword(false);
                      }}
                    >
                      <Ionicons
                        name={"create-outline"}
                        size={24} // Smaller, more appropriate size
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Text below for the username value */}
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#d1d5db",
                      textAlign: "center",
                      marginTop: 10, // Add space from the top
                    }}
                  >
                    {user || "Përdoruesi"}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 30,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderBottomWidth: 2,
                      borderBottomColor: "#3b82f6",
                      paddingBottom: 5,
                      width: "80%", // A fixed width to make it appear shorter
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setToggleAmendUsername(false)}
                      style={{ marginRight: 10 }}
                    >
                      <Ionicons name={"close"} size={30} color="#3b82f6" />
                    </TouchableOpacity>
                    <TextInput
                      style={{
                        flex: 1, // Takes up remaining space
                        height: 44,
                        padding: 10,
                        fontSize: 16,
                        color: "white",
                      }}
                      placeholderTextColor="#9ca3af"
                      value={newUsername}
                      onChangeText={setNewUsername}
                    />
                    <TouchableOpacity onPress={handleUserPress}>
                      <Ionicons name={"checkmark"} size={30} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {!toggleamendEmail ? (
                <View style={{ alignItems: "center", marginBottom: 30 }}>
                  {/* Row for Email and edit icon */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20, // Adjusted font size
                        fontWeight: "bold",
                        color: "white", // White text
                      }}
                    >
                      Email
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setToggleAmendEmail(true);
                        setToggleAmendPassword(false);
                        setToggleAmendUsername(false);
                        setFirstStep(true);
                      }}
                    >
                      <Ionicons
                        name={"create-outline"}
                        size={24} // Adjusted size
                        color="white" // White icon
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Text below for the email value */}
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#d1d5db", // Light gray text
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    {email || "user@example.com"}
                  </Text>
                </View>
              ) : firstStep ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 30,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderBottomWidth: 2,
                      borderBottomColor: "#3b82f6",
                      paddingBottom: 5,
                      width: "80%", // A fixed width to make it appear shorter
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setToggleAmendEmail(false)}
                      style={{ marginRight: 10 }}
                    >
                      <Ionicons
                        name={"close-circle-outline"}
                        size={30}
                        color="#3b82f6"
                      />
                    </TouchableOpacity>
                    <TextInput
                      style={{
                        flex: 1, // Takes up remaining space
                        height: 44,
                        padding: 10,
                        fontSize: 16,
                        color: "white",
                      }}
                      placeholderTextColor="#9ca3af"
                      value={newEmail}
                      onChangeText={setNewEmail}
                    />
                    <TouchableOpacity onPress={handleEmailPress}>
                      <Ionicons name={"checkmark"} size={30} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 30,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderBottomWidth: 2,
                      borderBottomColor: "#3b82f6",
                      paddingBottom: 5,
                      width: 180, // Reduced the container width for a compact look
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setToggleAmendEmail(false)}
                      style={{ marginRight: 10 }}
                    >
                      <Ionicons
                        name={"close-circle-outline"}
                        size={30}
                        color="#3b82f6"
                      />
                    </TouchableOpacity>
                    <TextInput
                      style={{
                        flex: 1,
                        height: 44,
                        padding: 10,
                        fontSize: 16,
                        color: "white",
                        textAlign: "center", // Center the code
                      }}
                      placeholder="6-digit code"
                      placeholderTextColor="#9ca3af"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad" // Use the number pad for easier entry
                      maxLength={6} // Limit input to 6 digits
                    />
                    <TouchableOpacity onPress={handleEmailCode}>
                      <Ionicons name={"checkmark"} size={30} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={{
                  backgroundColor: "#3b82f6", // Red accent
                  paddingVertical: 12, // Adjusted padding
                  width: "60%",
                  justifyContent: "center",
                  alignItems: "center",
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
                <Text
                  style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
                >
                  Logout
                </Text>
              </TouchableOpacity>
              {!toggleamendPassword ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#10b981", // Red accent
                    width: "60%",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 12, // Adjusted padding
                    borderRadius: 30, // Pill shape
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    marginTop: 30, // Space above logout button
                  }}
                  onPress={() => {
                    setToggleAmendPassword(true);
                    setToggleAmendUsername(false);
                    setToggleAmendEmail(false);
                  }} // Added onPress handler
                >
                  <Text
                    style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
                  >
                    Change Password
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 20,
                        marginTop: 30,
                      }}
                    >
                      {/* Old Password Input */}
                      <View style={{ marginBottom: 20, width: 250 }}>
                        <Text
                          style={{
                            color: "#9ca3af",
                            fontSize: 14,
                            marginBottom: 5,
                          }}
                        >
                          Old Password
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            borderBottomWidth: 2,
                            borderBottomColor: "#3b82f6",
                            paddingBottom: 5,
                          }}
                        >
                          <TextInput
                            style={{
                              flex: 1,
                              height: 44,
                              padding: 10,
                              fontSize: 16,
                              color: "white",
                            }}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showOldPassword}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                          />
                          <TouchableOpacity
                            onPress={() => setShowOldPassword(!showOldPassword)}
                          >
                            <Ionicons
                              name={showOldPassword ? "eye-off" : "eye"}
                              size={24}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* New Password Input */}
                      <View style={{ marginBottom: 20, width: 250 }}>
                        <Text
                          style={{
                            color: "#9ca3af",
                            fontSize: 14,
                            marginBottom: 5,
                          }}
                        >
                          New Password
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            borderBottomWidth: 2,
                            borderBottomColor: "#3b82f6",
                            paddingBottom: 5,
                          }}
                        >
                          <TextInput
                            style={{
                              flex: 1,
                              height: 44,
                              padding: 10,
                              fontSize: 16,
                              color: "white",
                            }}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showPassword}
                            value={newPassword}
                            onChangeText={setNewPassword}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                          >
                            <Ionicons
                              name={showPassword ? "eye-off" : "eye"}
                              size={24}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Confirm Password Input */}
                      <View style={{ marginBottom: 40, width: 250 }}>
                        <Text
                          style={{
                            color: "#9ca3af",
                            fontSize: 14,
                            marginBottom: 5,
                          }}
                        >
                          Confirm Password
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            borderBottomWidth: 2,
                            borderBottomColor: "#3b82f6",
                            paddingBottom: 5,
                          }}
                        >
                          <TextInput
                            style={{
                              flex: 1,
                              height: 44,
                              padding: 10,
                              fontSize: 16,
                              color: "white",
                            }}
                            placeholder="••••••••"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                          />
                          <TouchableOpacity
                            onPress={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            <Ionicons
                              name={showConfirmPassword ? "eye-off" : "eye"}
                              size={24}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Button Container */}
                      <View
                        style={{
                          flexDirection: "row",
                          width: 250,
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {/* The green button */}
                        <TouchableOpacity
                          onPress={handlePasswordPress}
                          style={{
                            backgroundColor: "#10b981",
                            paddingVertical: 12,
                            paddingHorizontal: 20,
                            borderRadius: 100,
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            flex: 1,
                            marginRight: 10,
                          }}
                        >
                          {isChangingPassword ? (
                            <ActivityIndicator color="white" />
                          ) : (
                            <Text
                              style={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: 16,
                              }}
                            >
                              Set Password
                            </Text>
                          )}
                        </TouchableOpacity>

                        {/* The new red cancel button with Ionicons */}
                        <TouchableOpacity
                          onPress={() => {
                            setToggleAmendPassword(false);
                            setNewPassword("");
                            setOldPassword("");
                            setConfirmPassword("");
                          }}
                          style={{
                            backgroundColor: "#ef4444",
                            padding: 12, // Adjusted padding for the icon
                            borderRadius: 100,
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                          }}
                        >
                          <Ionicons
                            name="close"
                            size={24}
                            color="white"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
              )}

              <TouchableOpacity
                style={{
                  width: "60%",
                  backgroundColor: "#dc2626", // Red accent
                  paddingVertical: 12, // Adjusted padding
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 30, // Pill shape
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  marginTop: 30, // Space above logout button
                }}
                onPress={handleDeleteAccount} // Added onPress handler
              >
                <Text
                  style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    "Delete Account"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#343541",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#202123",
    padding: 32,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#d1d5db",
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderColor: "#4b5563",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "white",
    backgroundColor: "#374151",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 12,
  },
});
