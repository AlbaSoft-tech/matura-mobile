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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
// Placeholder for your tests data.
// In a real React Native app, you would import this from a local JSON file
// e.g., import tests from '../../data/testeShqip.json';
// For demonstration, a small mock data set is provided.

const tests = [
  [
    {
      title: "Ushtrimi 1: Gramatika",
      text: "Lexoni fjalitë dhe zgjidhni formën e duhur të foljes.",
      questions: [
        {
          question: "Unë ____ (lexoj) një libër.",
          options: ["lexoj", "lexon", "lexojmë"],
          answer: "lexoj",
        },
        {
          question: "Ata ____ (shkruaj) një letër.",
          options: ["shkruajnë", "shkruan", "shkruajmë"],
          answer: "shkruajnë",
        },
      ],
    },
    {
      title: "Ushtrimi 2: Përgjigje e Lirë",
      text: "Përgjigjuni pyetjes me një fjali të plotë.",
      questions: [
        {
          question: "Cili është kryeqyteti i Shqipërisë?",
          answer: "Tirana",
        },
      ],
    },
  ],
  [
    {
      title: "Ushtrimi 3: Fjalori",
      text: "Zgjidhni fjalën e duhur për përkufizimin e dhënë.",
      questions: [
        {
          question: "Mjet transporti me dy rrota dhe pedale.",
          options: ["makinë", "bicikletë", "autobus"],
          answer: "bicikletë",
        },
      ],
    },
  ],
];

function FullQuizPage({ propFunction }) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [apiResponse, setApiResponse] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  // Use currentTestIndex to select the quiz data
  const quizData = tests[currentTestIndex];

  const handlePress = () => {
    console.log("Navigating back to learning page...");
    if (propFunction) {
      propFunction();
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

    quizData.forEach((exercise, exerciseIndex) => {
      exercise.questions.forEach((question, questionIndex) => {
        const userAns = selectedAnswers[exerciseIndex]?.[questionIndex] || "";
        const actualAns = question.answer || "";

        userAnswerString += `Q${exerciseIndex + 1}.${
          questionIndex + 1
        }: ${userAns}\n`;
        actualAnswerString += `A${exerciseIndex + 1}.${
          questionIndex + 1
        }: ${actualAns}\n`;
        questionAndAnswerContext += `Question ${exerciseIndex + 1}.${
          questionIndex + 1
        }: ${
          question.question
        }\nUser Answer: ${userAns}\nCorrect Answer: ${actualAns}\n\n`;
      });
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
          },
          body: JSON.stringify({
            prompt: `You got ${quizData.reduce(
              (acc, exercise) => acc + exercise.questions.length,
              0
            )} questions. Compare the user's answers to the actual answers for these Albanian language questions. Start your response with "Jeni përgjigjur sakt në X prej Y pyetjeve\n" where X is the number of correct answers and Y is the total number of questions. Then, provide a simple feedback on each incorrect question, explaining why the user's answer was wrong, and offer suggestions for improvement for open-ended questions. All the answer should be in albanian.
User Answers:
${userAnswerString}
Correct Answers:
${actualAnswerString}`,
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
    } catch (error) {
      console.error("Error sending data to AI API:", error);
      setApiResponse(`Error: ${error.message}`);
      // Using Alert.alert for user feedback in React Native
      Alert.alert(
        "Error",
        "Failed to get AI results. Check console for details."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const handlePreviousTest = () => {
    setCurrentTestIndex((prevIndex) => Math.max(0, prevIndex - 1));
    setSelectedAnswers({}); // Clear answers when changing test
    setApiResponse(null); // Clear AI response
    setShowCorrectAnswers(false); // Hide correct answers
  };

  const handleNextTest = () => {
    setCurrentTestIndex((prevIndex) =>
      Math.min(tests.length - 1, prevIndex + 1)
    );
    setSelectedAnswers({}); // Clear answers when changing test
    setApiResponse(null); // Clear AI response
    setShowCorrectAnswers(false); // Hide correct answers
  };

  if (!quizData) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>Loading quiz data.</Text>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: "#343541",
        padding: 20,
        paddingTop: insets.top + 100,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
            Testi ({currentTestIndex + 1} / {tests.length})
          </Text>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              onPress={handlePreviousTest}
              disabled={currentTestIndex === 0}
              style={[
                styles.navButton,
                currentTestIndex === 0 && styles.disabledButton,
              ]}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNextTest}
              disabled={currentTestIndex === tests.length - 1}
              style={[
                styles.navButton,
                currentTestIndex === tests.length - 1 && styles.disabledButton,
              ]}
            >
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePress} style={styles.backButton}>
              <Text style={styles.backButtonText}>BACK</Text>
            </TouchableOpacity>
          </View>
        </View>

        {quizData.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseSection}>
            {exercise.title && (
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
            )}
            {exercise.text && (
              <Text style={styles.exerciseText}>{exercise.text}</Text>
            )}

            {exercise.questions.map((q, questionIndex) => (
              <View
                key={`${exerciseIndex}-${questionIndex}`}
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
                            exerciseIndex,
                            questionIndex,
                            option
                          )
                        }
                        style={[
                          styles.optionButton,
                          selectedAnswers[exerciseIndex]?.[questionIndex] ===
                            option && styles.selectedOption,
                        ]}
                      >
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <TextInput
                    value={
                      selectedAnswers[exerciseIndex]?.[questionIndex] || ""
                    }
                    onChangeText={(text) =>
                      handleAnswerSelect(exerciseIndex, questionIndex, text)
                    }
                    placeholder="Shkruaj përgjigjen këtu..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                  />
                )}

                {/* Display Correct Answer */}
                {showCorrectAnswers && (
                  <Text style={styles.correctAnswerText}>
                    **Përgjigja e saktë:** {q.answer}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
        <TouchableOpacity
          onPress={handleSubmitQuiz}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Dorëzo Testin</Text>
        </TouchableOpacity>

        {/* Display AI Response / Score */}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {},
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add some padding at the bottom
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
    gap: 10, // Replaces space-x-4
  },
  navButton: {
    width: 45, // Set a fixed width
    height: 45, // Set a fixed height, equal to width
    borderRadius: 22.5, // Half of width/height to make it a perfect circle
    backgroundColor: "#3b82f6", // blue-600
    justifyContent: "center", // Center the icon horizontally
    alignItems: "center", // Center the icon vertically
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
    backgroundColor: "#dc2626", // blue-600
    borderRadius: 25, // rounded-full
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
    color: "#d1d5db", // gray-300
    marginBottom: 20,
    lineHeight: 24,
  },
  questionBlock: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#374151", // gray-700
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: "column",
    gap: 8, // space-y-2
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#2d3748", // Equivalent to hover:bg-gray-700, but applied by default for better visibility
    borderColor: "#4b5563", // gray-600
    borderWidth: 1,
  },
  selectedOption: {
    backgroundColor: "#3b82f6", // blue-500, to indicate selection
    borderColor: "#3b82f6",
  },
  optionText: {
    fontSize: 16,
    color: "white",
    marginLeft: 10, // For spacing if a custom radio button is added
  },
  textArea: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#374151", // gray-700
    color: "white",
    borderColor: "#4b5563", // gray-600
    borderWidth: 1,
    textAlignVertical: "top", // For multiline TextInput on Android
    fontSize: 16,
  },
  correctAnswerText: {
    marginTop: 15,
    color: "#4ade80", // green-400
    fontSize: 14,
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: "#10b981", // green-600
    borderRadius: 30, // rounded-full
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
});

export default FullQuizPage;

/* this was supposed to be the learning page
export default function LearnPage() {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [search, setSearch] = useState("");
  let Lectures = Lessons;

  if (search.trim() !== "") {
    Lectures = Lessons.filter((lecture) =>
      lecture.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  }

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderItem = ({ item, index }) => (
    <View style={{ marginBottom: 12 }}>
      <Pressable
        onPress={() => toggleExpand(index)}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 20,
          backgroundColor: "#e0e0e0",
          borderRadius: 25,
          alignSelf: "flex-start",
          flexDirection: "row",
          maxWidth: screenWidth - 40,
          alignItems: "center",
        }}
      >
        <Ionicons
          name={expandedIndex === index ? "chevron-down" : "chevron-forward"}
          size={26}
          color="dimgray"
          style={{ marginRight: 6 }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
          {item.title}
        </Text>
      </Pressable>

      {expandedIndex === index && (
        <View style={{ marginTop: 10, paddingLeft: 10 }}>
          {item.subtitles.map((sub, idx) => (
            <View key={idx} style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: "600", fontSize: 20 }}>
                {sub.subtitle}
              </Text>
              <Text style={{ fontSize: 14, color: "#555", marginTop: 2 }}>
                {sub.context}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={{ paddingTop: insets.top }}>
      <TextInput
        placeholder="Search lectures..."
        placeholderTextColor="#888"
        style={{
          padding: 12,
          backgroundColor: "#fff", // slightly brighter
          borderRadius: 100,
          fontSize: 20,
          borderWidth: 1,
          borderColor: "#ddd",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3, // for Android shadow
          width: screenWidth - 40,
          alignSelf: "center",
          marginTop: 60,
        }}
        onChangeText={setSearch}
      />
      <FlatList
        data={Lectures}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}
*/
