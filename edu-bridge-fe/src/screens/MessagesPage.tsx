import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSchool } from "../contexts/SchoolContext";
import NoSchoolFrame from "../components/NoSchoolFrame";

const MessagesPage: React.FC = () => {
  const { schools } = useSchool();

  // Show NoSchoolFrame if user has no schools
  if (schools.length === 0) {
    return (
      <NoSchoolFrame
        pageName="Messages"
        iconName="message-circle"
        message="Communicate directly with teachers, staff, and other parents. Once connected to your school, you'll be able to send and receive messages, share updates, and stay in touch with your child's education team."
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Direct Messages</Text>
        <Text style={styles.subtitle}>
          This is the Messages page - Coming soon!
        </Text>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>AI Chat Assistant</Text>
          <Text style={styles.cardContent}>
            Chat with Almee for instant answers and support. Get quick
            responses to common questions.
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Teacher Conversations</Text>
          <Text style={styles.cardContent}>
            Direct messaging with teachers like Mr. Smith (Math), Ms. Davis
            (Science), and other faculty members.
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Parent Network</Text>
          <Text style={styles.cardContent}>
            Connect with other parents like Jane Doe for project updates and
            school-related discussions.
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>School Administration</Text>
          <Text style={styles.cardContent}>
            Messages from Principal Thompson and other school administrators
            with important documents and announcements.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  testCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default MessagesPage;
