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
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore"; // Ensure correct import for useAuthStore

// Placeholder for your tests data.
// In a real React Native app, you would import this from a local JSON file
// e.g., import tests from '../../data/testeShqip.json';
// For demonstration, a small mock data set is provided.

function FullQuizPage() {
  const { testUnlocked, completedTests, setCompletedTests, token, fetchedTests } =
    useAuthStore();
  const insets = useSafeAreaInsets();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  const [language, setLanguage] = useState(null); // e.g., "Albanian", "English"
  const [selectedTestIndex, setSelectedTestIndex] = useState(null); // Index of the specific test selected (e.g., 0, 1, 2)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // This was currentTestIndex in your original code, now represents question index within a test

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

  // Derived state: Get the specific quiz data based on selectedTestIndex and currentQuestionIndex
  const quizData =
    selectedTestIndex !== null &&
    testsForSelectedLanguage.length > selectedTestIndex &&
    testsForSelectedLanguage[selectedTestIndex].length > currentQuestionIndex
      ? testsForSelectedLanguage[selectedTestIndex][currentQuestionIndex]
      : null;

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
  };

  const handlePress = () => {
    // This function seems to be for navigating back or resetting.
    // If it's meant to go back to language selection, reset language.
    // If it's meant to go back to test selection, reset selectedTestIndex.
    // For now, let's assume it goes back to language selection if a test is selected,
    // otherwise it would go back further (handled by propFunction if provided).
    if (selectedTestIndex !== null) {
      setSelectedTestIndex(null); // Go back to test selection
    } else if (language !== null) {
      setLanguage(null); // Go back to language selection
    } else {
      console.log("Navigating back to learning page...");
      if (propFunction) {
        propFunction();
      }
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

    // Ensure quizData is not null before iterating
    if (!quizData || !quizData.questions) {
      Alert.alert("Error", "No quiz data to submit.");
      return;
    }

    quizData.questions.forEach((question, questionIndex) => {
      // Iterate directly over questions
      const userAns = selectedAnswers[0]?.[questionIndex] || ""; // Assuming single exercise for simplicity
      const actualAns = question.answer || "";

      userAnswerString += `Q1.${questionIndex + 1}: ${userAns}\n`;
      actualAnswerString += `A1.${questionIndex + 1}: ${actualAns}\n`;
      questionAndAnswerContext += `Question 1.${questionIndex + 1}: ${
        question.question
      }\nUser Answer: ${userAns}\nCorrect Answer: ${actualAns}\n\n`;
    });

    console.log("User Answers String:\n", userAnswerString);
    console.log("Actual Answers String:\n", actualAnswerString);
    console.log("Full Context for AI:\n", questionAndAnswerContext);

    setLoadingAI(true);
    setApiResponse(null);
    setShowCorrectAnswers(false);

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
            prompt: `You got ${quizData.questions.length} questions. Compare the user's answers to the actual answers for these Albanian language questions. Start your response with "Jeni përgjigjur sakt në X prej Y pyetjeve\n" where X is the number of correct answers and Y is the total number of questions. Then, provide a simple feedback on each incorrect question, explaining why the user's answer was wrong, and offer suggestions for improvement for open-ended questions. All the answer should be in albanian.
User Answers:
${userAnswerString}
Correct Answers:
${actualAnswerString}`,
            index: selectedTestIndex,
            language: language,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiResult = await response.json();
      const cleanedApiResponse = (aiResult.answer || "").replace(/\*/g, "");
      setApiResponse(cleanedApiResponse || "No response from AI.");
      setShowCorrectAnswers(true);
      setCompletedTests([...completedTests, index]);
    } catch (error) {
      console.error("Error sending data to AI API:", error);
      setApiResponse(`Error: ${error.message}`);
      Alert.alert(
        "Error",
        "Failed to get AI results. Check console for details."
      );
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
            onPress={() => console.log(testUnlocked)} // Handle purchase logic here
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
          {/* No "Take Test" button here, selection directly leads to test list */}
        </View>
      ) : selectedTestIndex === null ? (
        // 3. Show Test Selection Page (for the chosen language)
        <ScrollView contentContainerStyle={styles.testSelScrollViewContent}>
          <Text style={styles.testSelHeader}>Select a Test</Text>
          <View style={styles.testSelButtonsContainer}>
            {testsForSelectedLanguage.map((testSet, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.testSelButton,
                  completedTests.includes(index)
                    ? styles.testSelCompletedButton
                    : styles.testSelIncompleteButton,
                ]}
                onPress={() => handleSelectSpecificTest(index)}
              >
                <Text style={styles.testSelButtonText}>Test {index + 1}</Text>
                {completedTests.includes(index) && (
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
            <Text style={styles.headerText}>
              Testi {currentQuestionIndex + 1}
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

          {quizData &&
            quizData.questions && ( // Ensure quizData and its questions exist
              <View style={styles.exerciseSection}>
                {quizData.title && (
                  <Text style={styles.exerciseTitle}>{quizData.title}</Text>
                )}
                {quizData.text && (
                  <Text style={styles.exerciseText}>{quizData.text}</Text>
                )}

                {quizData.questions.map((q, questionIndex) => (
                  <View
                    key={questionIndex} // Key can be just questionIndex here since it's one exercise
                    style={styles.questionBlock}
                  >
                    <Text style={styles.questionText}>{q.question}</Text>
                    {q.options ? (
                      <View style={styles.optionsContainer}>
                        {q.options.map((option, optionIndex) => (
                          <TouchableOpacity
                            key={optionIndex}
                            onPress={() =>
                              handleAnswerSelect(
                                0, // Assuming a single exercise for simplicity in selectedAnswers mapping
                                questionIndex,
                                option
                              )
                            }
                            style={[
                              styles.optionButton,
                              selectedAnswers[0]?.[questionIndex] === option &&
                                styles.selectedOption,
                            ]}
                          >
                            <Text style={styles.optionText}>{option}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <TextInput
                        value={selectedAnswers[0]?.[questionIndex] || ""}
                        onChangeText={(text) =>
                          handleAnswerSelect(0, questionIndex, text)
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
            )}
          <TouchableOpacity
            onPress={handleSubmitQuiz()}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Check results</Text>
          </TouchableOpacity>

          {loadingAI && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Duke kontrolluar testin...</Text>
            </View>
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
