import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Shop from "../appComponents//shopOrProfile/index";
import LearnPage from "../appComponents/learnPage/index";
import AuthPage from "../authpage/index";
import useAuthStore from "../store/authStore";

const { MLKitModule } = NativeModules;

const convertToBase64 = async (fileUri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
};

/*
async function getFileSize(uri) {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    const fileSizeMB = (info.size / (1024 * 1024)).toFixed(2);
    return fileSizeMB;
  } catch (err) {
    console.error("Failed to get file info", err);
    return null;
  }
}

const compressImage = async (uri, magnitude) => {
  try {
    const manipulatedImage = await manipulateAsync(uri, [], {
      compress: magnitude, //choose whatever you want
      format: SaveFormat.JPEG,
    });

    return manipulatedImage.uri;
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
};
*/
export default function Index() {
  const {
    checkToken,
    isAuthorised,
    setIsAuthorised,
    tokens,
    setTokens,
    token,
  } = useAuthStore();
  const [loadingAuthorization, setLoadingAuthorization] = useState(true);
  useEffect(() => {
    setLoadingAuthorization(true);
    const verify = async () => {
      try {
        const result = await Promise.race([
          checkToken(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 5000)
          ),
        ]);
        setIsAuthorised(result);
      } catch (err) {
        console.error("Auth check failed", err);
        setIsAuthorised(false);
      } finally {
        setLoadingAuthorization(false);
      }
    };
    verify();
  }, []);

  const { width } = useWindowDimensions();
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const [photoArray, setPhotoArray] = useState([]);
  const [writing, setWriting] = useState(false);
  const [question, setQuestion] = useState("");
  const insets = useSafeAreaInsets();
  const [pageIndex, setPageIndex] = useState(0);
  const pagerViewRef = useRef(null);
  const [paid, setPaid] = useState(true);
  const [answers, setAnswers] = useState(null);
  const [answered, setANswered] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const goToPage = (targetPageIndex) => {
    if (pagerViewRef.current) {
      pagerViewRef.current.setPage(targetPageIndex);
    }
  };

  useEffect(() => {
    (async () => {
      const permissionsToRequest = [
        {
          name: "camera",
          get: Camera.getCameraPermissionsAsync,
          request: Camera.requestCameraPermissionsAsync,
        },
        {
          name: "mediaLibrary",
          get: MediaLibrary.getPermissionsAsync,
          request: MediaLibrary.requestPermissionsAsync,
        },
        {
          name: "imagePicker",
          get: ImagePicker.getMediaLibraryPermissionsAsync,
          request: ImagePicker.requestMediaLibraryPermissionsAsync,
        },
      ];

      let allGranted = true;
      for (const perm of permissionsToRequest) {
        let { status } = await perm.get();
        if (status !== "granted") {
          ({ status } = await perm.request());
        }
        if (status !== "granted") {
          allGranted = false;
          break; // No need to check further if one permission is denied
        }
      }
      setHasPermission(allGranted);
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && photoArray.length < 3) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoArray((prev) => [...prev, photo.uri]);
    }
  };

  const savePicture = async () => {
    for (let i = 0; i < photoArray.length; ++i) {
      await MediaLibrary.saveToLibraryAsync(photoArray[i]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && photoArray.length < 3) {
      setPhotoArray((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const sendPhotoPrompt = async () => {
    setANswered(false);
    setAnswers([]);
    if (!photoArray || photoArray.length === 0) {
      console.warn("No images to process.");
      return;
    }

    setLoadingProgress(20);
    setLoading(true);
    const performOCR = async (image) => {
      if (Platform.OS === "android") {
        try {
          const result = await MLKitModule.recognizeText(image);
          console.log("Recognized text:", result);
          return result; // important to return for Promise.all
        } catch (err) {
          console.error("Text recognition error:", err);
          return ""; // return empty string on failure
        }
      } else {
        return ""; // non-Android: return empty
      }
    };
    const ocrResults = await Promise.all(
      photoArray.map(async (uri) => {
        if (uri) {
          return performOCR(uri);
        } else {
          return "";
        }
      })
    );
    console.log(ocrResults);
    setLoadingProgress(50);

    let prompt = "";
    for (let i = 0; i < ocrResults.length; ++i) {
      prompt += ocrResults[i];
    }
    console.log("fetching QARoute");
    const userToken = useAuthStore.getState().token;
    try {
      const processedPrompt = await fetch(
        "https://matura-backend.onrender.com/api/processing/answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ prompt: prompt, type: "photo" }),
        }
      );
      if (!processedPrompt.ok) {
        setLoadingProgress(0);
        setLoading(false);
        const errorData = await processedPrompt.json();
        alert(errorData.message || "Failed to process images.");
        return;
      }
      setLoadingProgress(100);
      setLoading(false);
      const parsedAnswer = await processedPrompt.json();
      setAnswers(parsedAnswer.answer);
      console.log("parsed answer:", parsedAnswer);
      setWriting(true);
      setANswered(true);
      setPhotoArray([]);
      setTokens(tokens - 3);
    } catch (error) {
      console.error("Error fetching QARoute:", error);
      setLoading(false);
      setPhotoArray([]);
      setLoadingProgress(0);
    }
  };

  const sendQuestion = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setANswered(false);
    setAnswers(null);
    console.log("sending question:", question);
    const userToken = useAuthStore.getState().token;
    console.log("user token:", userToken);
    const processedPrompt = await fetch(
      "https://matura-backend.onrender.com/api/processing/answer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ prompt: question, type: "question" }),
      }
    );
    if (!processedPrompt.ok) {
      const errorData = await processedPrompt.json();
      setLoading(false);
      alert(errorData.message || "Failed to process images.");
      return;
    }
    const parsedAnswer = await processedPrompt.json();
    console.log("parsed answer:", parsedAnswer);
    setTokens(tokens - 1);
    setQuestion("");
    setLoading(false);
    setAnswers(parsedAnswer.answer);

    setANswered(true);
  };

  if (loadingAuthorization) {
    return (
      <View
        style={[
          loadingStyles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  return isAuthorised ? (
    // SWIPE BAR ___________________________________
    <View style={{ flex: 1 }}>
      <View
        style={{
          width: 150,
          height: 50,
          position: "absolute",
          top: insets.top + 10,
          left: width / 2,
          transform: [{ translateX: -75 }],
          backgroundColor: "#202123",
          borderRadius: 25,
          zIndex: 999,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          paddingHorizontal: 10,
        }}
      >
        {/* Camera icon for page 0 */}
        <TouchableOpacity onPress={() => goToPage(0)} style={{ padding: 5 }}>
          <Ionicons
            name="camera"
            size={30}
            color={pageIndex === 0 ? "#3b82f6" : "white"}
          />
        </TouchableOpacity>

        {/* School icon for page 1 */}
        <TouchableOpacity onPress={() => goToPage(1)} style={{ padding: 5 }}>
          <Ionicons
            name="school"
            size={30}
            color={pageIndex === 1 ? "#3b82f6" : "white"}
          />
        </TouchableOpacity>

        {/* Cart icon for page 2 */}
        <TouchableOpacity onPress={() => goToPage(2)} style={{ padding: 5 }}>
          <Ionicons
            name="cart"
            size={30}
            color={pageIndex === 2 ? "#3b82f6" : "white"}
          />
        </TouchableOpacity>
      </View>
      <PagerView
        style={{ flex: 1 }}
        onPageSelected={(e) => {
          setPageIndex(e.nativeEvent.position);
          if (writing) {
            setWriting(false);
          }
        }}
        ref={pagerViewRef}
        initialPage={pageIndex}
      >
        {!writing && hasPermission ? ( // CAMERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
          <View style={{ flex: 1 }}>
            <CameraView
              ref={cameraRef}
              style={{
                flex: 1,
              }}
            />

            <View
              style={{
                position: "absolute",
                top: 60,
                left: 20,
                right: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 1, // Ensure the top bar is above other content
              }}
            >
              <TouchableOpacity onPress={() => setWriting(true)}>
                <Ionicons name="create-outline" size={50} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={sendPhotoPrompt}>
                <Ionicons name="checkmark" size={50} color="white" />
              </TouchableOpacity>
            </View>

            {loadingProgress > 0 && loadingProgress < 100 && (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text
                  style={{
                    marginTop: 10,
                    color: "white",
                    fontSize: 20,
                  }}
                >
                  {loadingProgress}%
                </Text>
              </View>
            )}

            <View
              style={{
                position: "absolute",
                bottom: 50,
                left: 0,
                right: 0,
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <TouchableOpacity onPress={savePicture}>
                <Ionicons name="download-outline" size={50} color="white" />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 20,
                    }}
                  >
                    {photoArray.length}/3
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newArray = photoArray.slice(0, -1);
                      setPhotoArray(newArray);
                    }}
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={25}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={takePicture}>
                  <Ionicons name="radio-button-off" size={100} color="white" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={pickImage}>
                <Ionicons name="image-outline" size={50} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              style={{ flex: 1, backgroundColor: "#343541", margin: 0 }}
              behavior={Platform.OS === "ios" ? "padding" : "undefined"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
              <View
                style={{
                  flex: 1,
                  paddingTop: insets.top,
                  justifyContent: "space-between",
                  margin: 0,
                }}
              >
                {/* Camera button */}
                <View style={styles.cameraButtonContainer}>
                  <TouchableOpacity
                    onPress={() => setWriting(false)}
                    style={styles.cameraButton}
                  >
                    <Ionicons name="camera-outline" size={50} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Answers scroll area */}
                {answered && answers && (
                  <ScrollView
                    style={{ flex: 1, paddingHorizontal: 20 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  >
                    <TouchableWithoutFeedback>
                      <View style={styles.answerItem}>
                        <Text style={styles.answerText}>{answers}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </ScrollView>
                )}

                {/* Loading overlay */}
                {loading && (
                  <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                  </View>
                )}

                {/* Input bar at the bottom */}
                <View
                  style={[
                    styles.inputContainer,
                    { margin: 0, paddingBottom: insets.bottom + 10 },
                  ]}
                >
                  <TextInput
                    style={styles.textInput}
                    placeholder="Shkruaje pyetjen"
                    placeholderTextColor="#9ca3af"
                    value={question}
                    onChangeText={setQuestion}
                    multiline
                    numberOfLines={4}
                    maxHeight={120}
                  />
                  <TouchableOpacity onPress={sendQuestion}>
                    <Ionicons
                      name="arrow-up-circle"
                      size={40}
                      color="#3b82f6"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        )}
        <LearnPage></LearnPage>
        <Shop></Shop>
      </PagerView>
    </View>
  ) : (
    <AuthPage></AuthPage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // The main container should still take full height
    backgroundColor: "#343541",
    // Remove justifyContent and alignItems from here, as the input bar will be absolute
  },
  cameraButtonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  cameraButton: {
    marginRight: 0,
  },
  answersScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  answerItem: {
    marginTop: 20,
    marginBottom: 40, // Keep this if you want space below the last answer item within the scrollview
    backgroundColor: "#202123",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "90%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  answerText: {
    fontSize: 16,
    color: "white",
    lineHeight: 22,
  },
  inputContainer: {
    backgroundColor: "#202123",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "row",
    width: "100%", // Already correct
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 0, // Ensure no margin below it
    minHeight: 80,
  },
  textInput: {
    fontSize: 20,
    color: "white",
    flex: 1,
    marginRight: 10,
    textAlignVertical: "top",
    // Remove extra padding at bottom
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlayText: {
    marginTop: 15,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#343541", // Dark background color from your existing style
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
  },
});
