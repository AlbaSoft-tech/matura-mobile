import React, { useState } from "react";
import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import Lessons from "../../data/dataPageInfo.json";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions } from "react-native";

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
