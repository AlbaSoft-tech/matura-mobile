import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const useAuthStore = create((set, get) => ({
  id: null,
  email: null,
  setEmail: (value) => set({ email: value }),
  user: null,
  setUser: (value) => set({ user: value }),
  token: null,
  tokens: 0,
  verifyAccount: false,
  setTokens: (value) => set({ tokens: value }),
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
  completedTests: {
    turkish: [],
    english: [],
    albanian: [],
    macedonian: [],
    montenegrin: [],
    serbian: [],
    bulgarian: [],
    bosnian: [],
  },
  setCompletedTests: (value) => set({ completedTests: value }),
  fetchedTests: null,
  signUpToken: null,
  changeEmailToknen: null,

  signUp: async (username, email, password) => {
    set({ isLoading: true });
    if (!email || !password || !username) {
      alert("Please fill in all fields.");
      set({ isLoading: false });
      return;
    }
    try {
      const response = await fetch(
        "https://matura-backend.onrender.com/api/auth/signup",
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
      if (!response.ok) {
        set({ isLoading: false });
        alert(data.message || "Something went wrong");
        throw new Error(data.message || "Something went wrong");
      }

      set({ isLoading: false, verifyAccount: true, signUpToken: data.token });
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
      set({ isLoading: true });
      if (!email || !password) {
        alert("Please fill in all fields.");
        set({ isLoading: false });
        return;
      }
      const response = await fetch(
        "https://matura-backend.onrender.com/api/auth/login",
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
        set({ isLoading: false });
        alert("Wrong credentials");
        throw new Error(result.message || "something went wrong");
      }

      set({
        isLoading: false,
        isAuthorised: true,
        token: result.token,
        user: result.user.username,
        email: result.user.email,
        tokens: result.user.tokens,
        completedTests: result.user.completedTests,
        fetchedTests: result.tests,
        id: result.user.id,
      });

      await AsyncStorage.setItem("user", JSON.stringify(result.user.username));
      await AsyncStorage.setItem("email", JSON.stringify(result.user.email));
      await AsyncStorage.setItem("token", result.token);
      await AsyncStorage.setItem("tests", JSON.stringify(result.tests));
      await AsyncStorage.setItem("id", result.user.id)
      return {
        success: true,
      };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },

  checkToken: async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        const response = await fetch(
          "https://matura-backend.onrender.com/api/auth/token",
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
          const result = await response.json();
          const tests = await AsyncStorage.getItem("tests");
          const tokens = result.tokens;
          const completedTests = result.completedTests;
          set({
            user: user.slice(1, -1),
            email: email.slice(1, -1),
            token: token,
            tokens: tokens,
            isAuthorised: true,
            completedTests: completedTests,
            fetchedTests: JSON.parse(tests),
            id: result.id
          });
          return true;
        } else {
          const result = await response.json();
          console.log(result.message);
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
    await AsyncStorage.clear();
  },
  deleteAccount: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        "https://matura-backend.onrender.com/api/auth/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        set({ isLoading: false });
        alert(data.message || "Something went wrong");
        throw new Error(data.message || "Something went wrong");
      }

      set({ isLoading: false, token: null, isAuthorised: false });
      await AsyncStorage.clear();
    } catch (error) {
      console.log(error);
    }
  },
  verifyAccountFunction: async (code) => {
    set({ isLoading: true });
    try {
      const signUpToken = get().signUpToken;
      const response = await fetch(
        "https://matura-backend.onrender.com/api/auth/verifyAccount",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${signUpToken}`,
          },
          body: JSON.stringify({
            code: code,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        set({
          isLoading: false,
        });
        alert(data.message || "Something went wrong");
        throw new Error(data.message || "Something went wrong");
      }

      set({
        isLoading: false,
        verifyAccount: false,
        signUpToken: null,
        isSignUp: false,
      });
      return {
        success: true,
      };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
  amend: async (info) => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        "https://matura-backend.onrender.com/api/auth/amend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ info: info }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Something went wrong");
        throw new Error(data.message || "Something went wrong");
      }

      if (info.type === "email") {
        await AsyncStorage.setItem("emailToken", data.emailToken);
        console.log(data.emailToken);
      }
      if (data.message === "Tester") {
        set({ email: info.value, token: data.token });
        await AsyncStorage.setItem("token", data.token);
      }
      set({ isLoading: false });
      return { ok: true, message: data.message };
    } catch (error) {
      console.log(error);
      set({ isLoading: false });
    }
  },
  sendEmailCode: async (code) => {
    try {
      set({ isLoading: true });
      const newEmailToken = await AsyncStorage.getItem("emailToken");
      console.log(newEmailToken);
      const response = await fetch(
        "https://matura-backend.onrender.com/api/auth/verifyNewAccount",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newEmailToken}`,
          },
          body: JSON.stringify({ code: code }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        set({ isLoading: false });
        alert(data.message || "Something went wrong");
        throw new Error(data.message || "Something went wrong");
      }

      set({ isLoading: false, token: data.token, email: data.email });
      await AsyncStorage.setItem("email", JSON.stringify(data.email));
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.removeItem("emailToken");

      return {
        ok: true,
      };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
  updateTokens: async () => {
    try {
      const response = await fetch("https://matura-backend.onrender.com/api/auth/getTokens", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${get().token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      set({ tokens: data.tokens });
      return { success: true };
    } catch (error) {
      console.log(error)
    }
  }
}));

export default useAuthStore;
