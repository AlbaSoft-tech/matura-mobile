import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // You import this but don't use it.
import useAuthStore from "../../store/authStore"; // Ensure correct import for useAuthStore

function FullQuizPage() {
  const {
    testUnlocked,
    completedTests,
    setCompletedTests,
    token,
    fetchedTests,
  } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  const [language, setLanguage] = useState(null); // e.g., "Albanian", "English"
  const [selectedTestIndex, setSelectedTestIndex] = useState(null); // Index of the specific test selected (e.g., 0, 1, 2)
  // currentQuestionIndex is not used for navigating within a single test,
  // as all questions of a selected test are displayed at once.
  // If you plan to add a "next/previous question" feature, this state will be relevant.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Define languages array
  const languages = [
    { code: "sq", name: "Albanian" },
    { code: "tr", name: "Turkish" },
    { code: "mk", name: "Macedonian" },
    { code: "en", name: "English" },
  ];

  // Derived state: Get the tests array for the selected language
  // Ensure the key matches your fetchedTests object (e.g., 'albanian', 'english')
  const testsForSelectedLanguage = language
    ? fetchedTests[language.toLowerCase()] || []
    : [];

  // Derived state: Get the specific ARRAY of quiz objects (exercises) for the selected test set.
  // Renamed from 'quizData' to 'quizzesToDisplay' for better clarity.
  const quizzesToDisplay =
    selectedTestIndex !== null &&
    testsForSelectedLanguage.length > selectedTestIndex
      ? testsForSelectedLanguage[selectedTestIndex]
      : [];

  const handleSelectLanguage = (langName) => {
    setLanguage(langName);
    setSelectedTestIndex(null); // Reset selected test when language changes
    setCurrentQuestionIndex(0); // Reset question index
    setSelectedAnswers({});
    setApiResponse(null);
    setShowCorrectAnswers(false);
  };

  const handleSelectSpecificTest = (index) => {
    setSelectedTestIndex(index);
    setCurrentQuestionIndex(0); // Start from the first question of the selected test
    setSelectedAnswers({});
    setApiResponse(null);
    setShowCorrectAnswers(false);
    // console.log(quizzesToDisplay); // This will log the value from the *previous* render cycle
    // due to state update batching. It'll be correct on next render.
  };

  const handlePress = () => {
    if (selectedTestIndex !== null) {
      console.log(completedTests);
      setSelectedTestIndex(null);
      setApiResponse(null);
      // Go back to test selection
    } else if (language !== null) {
      setLanguage(null); // Go back to language selection
    } else {
      console.log("Navigating back to learning page...");
      // If this component is part of a React Navigation stack, you would use:
      // const navigation = useNavigation();
      // navigation.goBack();
      // 'propFunction' is not defined in the current scope.
      // if (propFunction) {
      //   propFunction();
      // }
    }
  };

  const handleAnswerSelect = (exerciseIndex, questionIndex, answer) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [exerciseIndex]: {
        ...(prevAnswers[exerciseIndex] || {}),
        [questionIndex]: answer,
      },
    }));
  };

  const handleSubmitQuiz = async () => {
    let userAnswerString = "";
    let actualAnswerString = "";
    let questionAndAnswerContext = "";
    let totalQuestions = 0; // Keep track of the total number of questions

    // Ensure quizzesToDisplay is an array and not empty before iterating
    if (!Array.isArray(quizzesToDisplay) || quizzesToDisplay.length === 0) {
      Alert.alert("Error", "No quiz data to submit.");
      return;
    }

    // Iterate over each 'exercise' (which is a quiz object) in quizzesToDisplay
    quizzesToDisplay.forEach((exercise, exerciseIndex) => {
      // Check if the current exercise has questions before iterating over them
      if (exercise.questions && Array.isArray(exercise.questions)) {
        exercise.questions.forEach((question, questionIndex) => {
          totalQuestions++; // Increment total questions for each question found
          // Correctly access user answers based on exerciseIndex and questionIndex
          const userAns = selectedAnswers[exerciseIndex]?.[questionIndex] || "";
          const actualAns = question.answer || "";

          // Format strings with exercise and question numbers for clarity in AI prompt
          userAnswerString += `E${exerciseIndex + 1}.Q${
            questionIndex + 1
          }: ${userAns}\n`;
          actualAnswerString += `E${exerciseIndex + 1}.A${
            questionIndex + 1
          }: ${actualAns}\n`;
          questionAndAnswerContext += `Exercise ${
            exerciseIndex + 1
          }, Question ${questionIndex + 1}: ${
            question.question
          }\nUser Answer: ${userAns}\nCorrect Answer: ${actualAns}\n\n`;
        });
      }
    });

    setLoadingAI(true);
    setApiResponse(null);
    setShowCorrectAnswers(false);

    console.log(language);

    try {
      const response = await fetch(
        "https://maturabackend.onrender.com/api/processing/compare-answers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            // Pass totalQuestions to the prompt for correct counting
            prompt: `You got ${totalQuestions} questions. Compare the user's answers to the actual answers for these Albanian language questions. Start your response with "Jeni përgjigjur sakt në X prej Y pyetjeve\\n" where X is the number of correct answers and Y is the total number of questions. Then, provide a simple feedback on each incorrect question, explaining why the user's answer was wrong, and offer suggestions for improvement for open-ended questions. All the answer should be in albanian.
User Answers:
${userAnswerString}
Correct Answers:
${actualAnswerString}`,
            index: selectedTestIndex,
            language: language.toLowerCase(),
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        console.log(result.message);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("success");
      const aiResult = await response.json();
      const cleanedApiResponse = (aiResult.answer || "").replace(/\*/g, "");
      setApiResponse(cleanedApiResponse || "No response from AI.");
      setShowCorrectAnswers(true);
      // Correctly update completedTests:
      setCompletedTests({
        ...completedTests,
        [language.toLowerCase()]: [
          ...(completedTests[language.toLowerCase()] || []),
          selectedTestIndex,
        ],
      });
    } catch (error) {
      console.error("Error sending data to AI API:", error);
      setApiResponse(`Error: ${error.message}`);
    } finally {
      setLoadingAI(false);
    }
  };

  // Main Return Statement
  return (
    <KeyboardAvoidingView
      style={[styles.keyboardAvoidingView, { paddingTop: insets.top + 70 }]} // Adjusted paddingTop
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {!testUnlocked ? (
        // 1. Show Unlock Tests Page
        <View style={styles.unlockContentContainer}>
          <Text style={styles.unlockTitle}>Unlock Tests</Text>
          <Text style={styles.unlockDescription}>
            Gain full access to all practice tests and elevate your learning
            experience! For just <Text style={styles.unlockPrice}>€4.99</Text>,
            you'll unlock:
          </Text>
          <View style={styles.unlockBulletPointsContainer}>
            <Text style={styles.unlockBulletPoint}>
              • Alot of tests to choose from
            </Text>
            <Text style={styles.unlockBulletPoint}>
              • Feedback on your answers
            </Text>
            <Text style={styles.unlockBulletPoint}>
              • Multiple language support: Macedonian, Albanian, English,
              Turkish
            </Text>
          </View>
          <Text style={styles.unlockCallToAction}>
            Start preparing for your final exam!
          </Text>
          <TouchableOpacity
            style={styles.unlockButton}
            onPress={() => console.log("Test Unlocked:", testUnlocked)} // Handle purchase logic here
          >
            <Text style={styles.unlockButtonText}>Unlock Now for €4.99</Text>
          </TouchableOpacity>
        </View>
      ) : !language ? (
        // 2. Show Language Selection Page
        <View style={styles.languageContentContainer}>
          <Text style={styles.languageTitle}>Choose Your Test Language</Text>
          <Text style={styles.languageDescription}>
            Select the language you wish to take the tests in:
          </Text>

          <View style={styles.languageButtonsContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  language === lang.name && styles.languageSelectedButton,
                ]}
                onPress={() => handleSelectLanguage(lang.name)} // Pass name directly
              >
                <Text style={styles.languageButtonText}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {language && (
            <Text style={styles.languageConfirmation}>
              You have selected:{" "}
              <Text style={styles.languageSelectedText}>{language}</Text>
            </Text>
          )}
        </View>
      ) : selectedTestIndex === null ? (
        <ScrollView contentContainerStyle={styles.testSelScrollViewContent}>
          <TouchableOpacity
            onPress={() => {
              setLanguage(null);
            }} // This now goes back to test selection
            style={{ ...styles.backButton, marginBottom: 30 }}
          >
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
          <Text style={styles.testSelHeader}>Select a Test</Text>

          <View style={styles.testSelButtonsContainer}>
            {testsForSelectedLanguage.map((testSet, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.testSelButton,
                  // THIS IS THE LINE FOR THE BLUE GLOW
                  completedTests[language.toLowerCase()]?.includes(index)
                    ? styles.testSelCompletedButton
                    : styles.testSelIncompleteButton,
                ]}
                onPress={() => handleSelectSpecificTest(index)}
              >
                <Text style={styles.testSelButtonText}>Test {index + 1}</Text>
                {/* THIS IS THE LINE FOR "Completed" TEXT */}
                {completedTests[language.toLowerCase()]?.includes(index) && (
                  <Text style={styles.testSelStatusText}>Completed</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        // 4. Show Actual Quiz Content
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.headerContainer}>
            {/* Displaying the selected test index as currentQuestionIndex is misleading
                since all exercises/questions for the test are shown. */}
            <Text style={styles.headerText}>
              Testi {selectedTestIndex !== null ? selectedTestIndex + 1 : ""}
            </Text>
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                onPress={handlePress} // This now goes back to test selection
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>BACK</Text>
              </TouchableOpacity>
            </View>
          </View>

          {Array.isArray(quizzesToDisplay) && quizzesToDisplay.length > 0 ? (
            quizzesToDisplay.map((exercise, exerciseIndex) => (
              <View key={exerciseIndex} style={styles.exerciseSection}>
                {exercise.title && (
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                )}
                {exercise.text && (
                  <Text style={styles.exerciseText}>{exercise.text}</Text>
                )}

                {/* Check if the current exercise has questions before mapping */}
                {exercise.questions &&
                  exercise.questions.map((q, questionIndex) => (
                    <View
                      key={`${exerciseIndex}-${questionIndex}`}
                      style={styles.questionBlock}
                    >
                      <Text style={styles.questionText}>{q.question}</Text>
                      {q.options ? (
                        <View style={styles.optionsContainer}>
                          {q.options.map((option, optionIndex) => (
                            <TouchableOpacity
                              key={`${exerciseIndex}-${questionIndex}-${optionIndex}`}
                              onPress={() =>
                                handleAnswerSelect(
                                  exerciseIndex,
                                  questionIndex,
                                  option
                                )
                              }
                              style={[
                                styles.optionButton,
                                selectedAnswers[exerciseIndex]?.[
                                  questionIndex
                                ] === option && styles.selectedOption,
                              ]}
                            >
                              <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : (
                        <TextInput
                          value={
                            selectedAnswers[exerciseIndex]?.[questionIndex] ||
                            ""
                          }
                          onChangeText={(text) =>
                            handleAnswerSelect(
                              exerciseIndex,
                              questionIndex,
                              text
                            )
                          }
                          placeholder="Shkruaj përgjigjen këtu..."
                          placeholderTextColor="#9ca3af"
                          multiline
                          numberOfLines={4}
                          style={styles.textArea}
                        />
                      )}

                      {showCorrectAnswers && (
                        <Text style={styles.correctAnswerText}>
                          **Përgjigja e saktë:** {q.answer}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            ))
          ) : (
            // Optional: Render a loading indicator or a message if quizData is not an array or is empty
            <Text>Loading quiz...</Text>
          )}

          {loadingAI ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Checking...</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={!apiResponse ? handleSubmitQuiz : handlePress}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>
                {!apiResponse ? "Check results" : "Return"}
              </Text>
            </TouchableOpacity>
          )}
          {apiResponse && !loadingAI && (
            <View style={styles.apiResponseContainer}>
              <Text style={styles.apiResponseText}>{apiResponse}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#343541",
    // Padding top handled by insets in the main view
  },
  // --- Common Styles for Quiz Content ---
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 10,
  },
  navButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#3b82f6",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  disabledButton: {
    opacity: 0.5,
  },
  exerciseSection: {
    backgroundColor: "#202123",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  exerciseText: {
    fontSize: 16,
    color: "#d1d5db",
    marginBottom: 20,
    lineHeight: 24,
  },
  questionBlock: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: "column",
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#2d3748",
    borderColor: "#4b5563",
    borderWidth: 1,
  },
  selectedOption: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  optionText: {
    fontSize: 16,
    color: "white",
    marginLeft: 10,
  },
  textArea: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#374151",
    color: "white",
    borderColor: "#4b5563",
    borderWidth: 1,
    textAlignVertical: "top",
    fontSize: 16,
  },
  correctAnswerText: {
    marginTop: 15,
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: "#10b981",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    alignSelf: "center",
  },
  submitButtonText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  loadingContainer: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
  apiResponseContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#202123",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
  },
  apiResponseText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#343541",
  },
  noDataText: {
    color: "white",
    padding: 20,
    fontSize: 18,
  },

  // --- Styles for Unlock Tests Page ---
  unlockContentContainer: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "#202123",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 20,
  },
  unlockTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  unlockDescription: {
    fontSize: 16,
    color: "#d1d5db",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 22,
  },
  unlockPrice: {
    fontWeight: "bold",
    color: "#4ade80",
    fontSize: 18,
  },
  unlockBulletPointsContainer: {
    alignSelf: "flex-start",
    marginBottom: 20,
    marginLeft: 10,
  },
  unlockBulletPoint: {
    fontSize: 15,
    color: "#d1d5db",
    marginBottom: 8,
  },
  unlockCallToAction: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#facc15",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  unlockButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unlockButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  // --- Styles for Language Selection Page ---
  languageContentContainer: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "#202123",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 20,
  },
  languageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  languageDescription: {
    fontSize: 16,
    color: "#d1d5db",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  languageButtonsContainer: {
    width: "100%",
    gap: 15,
    marginBottom: 20,
  },
  languageButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
  },
  languageSelectedButton: {
    backgroundColor: "#4ade80",
    borderColor: "#22c55e",
    borderWidth: 2,
  },
  languageButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  languageConfirmation: {
    fontSize: 16,
    color: "#d1d5db",
    marginTop: 10,
    textAlign: "center",
  },
  languageSelectedText: {
    fontWeight: "bold",
    color: "#facc15",
  },
  // Removed takeTestButton and takeTestButtonText as they are not used in this specific flow

  // --- Styles for Test Selection Section ---
  testSelScrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#343541",
  },
  testSelHeader: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
    textAlign: "center",
  },
  testSelButtonsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  testSelButton: {
    width: 120,
    height: 120,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
  },
  testSelCompletedButton: {
    backgroundColor: "#202123",
    borderColor: "#3b82f6", // Changed from aqua to blue
    shadowColor: "#3b82f6", // Changed from aqua to blue
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  testSelIncompleteButton: {
    backgroundColor: "#202123",
    borderColor: "#4b5563", // Example: a subtle grey for incomplete
  },
  testSelButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  testSelStatusText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
});

export default FullQuizPage;
