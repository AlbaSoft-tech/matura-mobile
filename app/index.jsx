import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Pressable,
  FlatList,
} from "react-native";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthPage from "../authpage/index";
import useAuthStore from "../store/authStore";
import * as FileSystem from "expo-file-system";
import Shop from "../appComponents//shopOrProfile/index";
import LearnPage from "../appComponents/learnPage/index";

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
export default function Index() {
  const { checkToken, isAuthorised, setIsAuthorised } = useAuthStore();

  useEffect(() => {
    const verify = async () => {
      const result = await checkToken();
      setIsAuthorised(result);
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

  const goToNextPage = () => {
    if (pagerViewRef.current) {
      pagerViewRef.current.setPage(pageIndex + 1);
    }
  };

  const goToPrevPage = () => {
    if (pagerViewRef.current) {
      pagerViewRef.current.setPage(pageIndex - 1);
    }
  };

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
      const { status: imagePickerStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      let finalCameraStatus = cameraStatus;
      let finalMediaStatus = mediaStatus;
      let finalImagePickerStatus = imagePickerStatus;

      if (cameraStatus !== "granted") {
        const { status } = await Camera.requestCameraPermissionsAsync();
        finalCameraStatus = status;
      }

      if (mediaStatus !== "granted") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        finalMediaStatus = status;
      }

      if (imagePickerStatus !== "granted") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalImagePickerStatus = status;
      }

      const allGranted =
        finalCameraStatus === "granted" &&
        finalMediaStatus === "granted" &&
        finalImagePickerStatus === "granted";
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
    console.log("starting");
    const performOCR = async (base64Image) => {
      const apiKey = "AIzaSyDaGkvpbiDV6s88WxmCznl8BslZqAVj0-o";

      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 1,
              },
            ],
            imageContext: {
              languageHints: ["sq"],
            },
          },
        ],
      };

      try {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();

        if (data.responses && data.responses[0].fullTextAnnotation) {
          const detectedText = data.responses[0].fullTextAnnotation.text;
          return detectedText;
        } else {
          console.error("No text detected");
          return null;
        }
      } catch (error) {
        console.error("Error during OCR:", error);
        return null;
      }
    };

    const ocrResults = await Promise.all(
      photoArray.map(async (uri) => {
        const base64 = await convertToBase64(uri);

        if (base64) {
          return performOCR(base64);
        } else {
          return "";
        }
      })
    );
    console.log("ocr is done");

    let prompt = "";
    for (let i = 0; i < ocrResults.length; ++i) {
      prompt += ocrResults[i];
    }
    console.log("fetching QARoute");

    const processedPrompt = await fetch(
      "https://maturabackend.onrender.com/api/processing/answer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt }),
      }
    );
    const parsedAnswer = await processedPrompt.json();
    setAnswers(parsedAnswer.answer);
    setWriting(true);
    setANswered(true);
    setPhotoArray([]);
  };

  const sendQuestion = async () => {
    setANswered(false);
    setAnswers(null);

    const processedPrompt = await fetch(
      "https://maturabackend.onrender.com/api/processing/answer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: question }),
      }
    );
    const parsedAnswer = await processedPrompt.json();
    setQuestion("");
    setAnswers(parsedAnswer.answer);
    setWriting(true);
    setANswered(true);
  };

  return isAuthorised ? (
    // SWIPE BAR ___________________________________
    <View style={{ flex: 1 }}>
      <View
        style={{
          width: 110,
          height: 35,
          position: "absolute",
          top: 60,
          left: width / 2,
          transform: [{ translateX: -55 }],
          backgroundColor: "white",
          borderRadius: 50,
          zIndex: 999,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          elevation: 0,
          shadowColor: "transparent",
        }}
      >
        <Pressable onPress={goToPrevPage} style={{}}>
          <Ionicons
            name="camera"
            size={30}
            color={pageIndex === 0 ? "dimgray" : "lightgray"}
          />
        </Pressable>

        <Pressable onPress={goToNextPage} style={{}}>
          <Ionicons
            name="school"
            size={30}
            color={pageIndex === 1 ? "dimgray" : "lightgray"}
          />
        </Pressable>

        <Pressable onPress={goToNextPage} style={{}}>
          <Ionicons
            name="cart"
            size={30}
            color={pageIndex === 2 ? "dimgray" : "lightgray"}
          />
        </Pressable>
      </View>
      <PagerView
        style={{ flex: 1 }}
        onPageSelected={(e) => setPageIndex(e.nativeEvent.position)}
        ref={pagerViewRef}
        initialPage={pageIndex}
      >
        {!writing && hasPermission ? ( // CAMERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
          <View style={{ flex: 1 }}>
            <CameraView
              ref={cameraRef}
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 50,
              }}
            >
              <View
                style={{
                  width: "100%",
                  alignItems: "flex-end",
                  marginTop: 60,
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <TouchableOpacity onPress={() => setWriting(true)}>
                  <Ionicons
                    name="create-outline"
                    size={50}
                    color="white"
                    style={{ marginLeft: 20 }}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => sendPhotoPrompt()}>
                  <Ionicons
                    name="checkmark"
                    size={50}
                    color="white"
                    style={{ marginRight: 20 }}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TouchableOpacity onPress={savePicture}>
                  <Ionicons name="download-outline" size={50} color="white" />
                </TouchableOpacity>
                <View style={{ flexDirection: "column", alignItems: "center" }}>
                  <Text style={{ color: "white", fontSize: 20 }}>
                    {photoArray.length}/3
                  </Text>
                  <TouchableOpacity onPress={takePicture}>
                    <Ionicons
                      name="radio-button-off"
                      size={100}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={pickImage}>
                  <Ionicons name="image-outline" size={50} color="white" />
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        ) : (
          <View // WRITIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIINGGGGG
            style={{
              flex: 1,
              backgroundColor: "#f4f4f4",
              paddingTop: insets.top,
            }}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => setWriting(false)}
                style={{ marginRight: 25 }}
              >
                <Ionicons name="camera-outline" size={50} color="dimgray" />
              </TouchableOpacity>
            </View>

            {answered && (
              <FlatList
                style={{ marginBottom: 64 }}
                data={answers}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      marginTop: 20,
                      backgroundColor: "#f4f4f4",
                      padding: 10,
                      borderRadius: 15,
                      marginVertical: 5,
                      maxWidth: "80%",
                      alignSelf: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 10,
                      elevation: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: "dimgray",
                        lineHeight: 20,
                        fontFamily:
                          Platform.OS === "ios"
                            ? "Avenir Next"
                            : "sans-serif-light",
                      }}
                    >
                      {index + 1 + ". " + item}
                    </Text>
                  </View>
                )}
              />
            )}

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  padding: 16,
                  backgroundColor: "#f4f4f4",
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 24,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 4,
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                    minHeight: 60,
                  }}
                >
                  <TextInput
                    style={{
                      fontSize: 20,
                      color: "#000",
                      flex: 1,
                      marginRight: 10,
                      textAlignVertical: "top",
                    }}
                    placeholder="Shkruaje pyetjen"
                    placeholderTextColor="#999"
                    value={question}
                    onChangeText={setQuestion}
                    multiline={true}
                    numberOfLines={4}
                    maxHeight={120}
                  />
                  <TouchableWithoutFeedback onPress={() => sendQuestion()}>
                    <Ionicons
                      name="arrow-up-circle"
                      size={40}
                      color="dimgray"
                    />
                  </TouchableWithoutFeedback>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        )}
        <LearnPage></LearnPage>
        <Shop></Shop>
      </PagerView>
    </View>
  ) : (
    <AuthPage></AuthPage>
  );
}
