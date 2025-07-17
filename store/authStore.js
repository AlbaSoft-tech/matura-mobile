import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useAuthStore = create((set) => ({
  email: null,
  user: null,
  token: null,
  tokens: 0,
  testUnlocked: null,
  isLoading: false,
  isAuthorised: false,
  setIsAuthorised: (value) => set({ isAuthorised: value }),
  isSignUp: false,
  setIsSignUp: (value) => set({ isSignUp: value }),
  setToken: (value) => set({ token: value }),
  forgotPassword: false,
  setForgotPassword: (value) => set({ forgotPassword: value }),
  forgotPasswordToken: null,
  setForgotPasswordToken: (value) => set({ forgotPasswordToken: value }),
  completedTests: [],
  setCompletedTests: (value) => set({ completedTests: value }),


  signUp: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(
        "https://maturabackend.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      return {
        success: true,
      };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
  logIn: async (email, password) => {
    console.log(email, password);
    try {
      const response = await fetch(
        "https://maturabackend.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        alert("Wrong credentials");
        throw new Error(result.message || "something went wrong");
      }

      set({
        isAuthorised: true,
        token: result.token,
        user: result.user.username,
        email: result.user.email,
        tokens: result.user.tokens,
        testUnlocked: result.user.testUnlocked,
        completedTests: result.user.completedTests,
      });

      await AsyncStorage.setItem("user", JSON.stringify(result.user.username));
      await AsyncStorage.setItem("email", JSON.stringify(result.user.email));
      await AsyncStorage.setItem("token", result.token);
      await AsyncStorage.setItem("tokens", JSON.stringify(result.user.tokens));
      await AsyncStorage.setItem(
        "testUnlocked",
        JSON.stringify(result.user.testUnlocked)
      );
      return {
        success: true,
      };
    } catch (error) {}
  },

  checkToken: async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        const response = await fetch(
          "https://maturabackend.onrender.com/api/auth/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const user = await AsyncStorage.getItem("user");
          const email = await AsyncStorage.getItem("email");
          const token = await AsyncStorage.getItem("token");
          const tokens = await AsyncStorage.getItem("tokens");
          const testUnlocked = await AsyncStorage.getItem("testUnlocked");
          const result = await response.json();
          
          set({
            user: user,
            email: email,
            token: token,
            tokens: JSON.parse(tokens),
            isAuthorised: true,
            testUnlocked: JSON.parse(testUnlocked),
            completedTests: result.completedTests,
          });
          const data = await response.json();
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      throw new Error("Something went wrong while checking the token");
    }
  },
  logOut: async () => {
    set({ token: null, isAuthorised: false });
    await AsyncStorage.setItem("user", "");
    await AsyncStorage.setItem("token", "");
    await AsyncStorage.setItem("email", "");
  },
}));

export default useAuthStore;
