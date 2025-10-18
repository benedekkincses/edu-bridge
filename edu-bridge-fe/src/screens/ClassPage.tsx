import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSchool } from "../contexts/SchoolContext";
import NoSchoolFrame from "../components/NoSchoolFrame";

const ClassPage: React.FC = () => {
  const { schools } = useSchool();

  // Show NoSchoolFrame if user has no schools
  if (schools.length === 0) {
    return (
      <NoSchoolFrame
        pageName="Class"
        iconName="book-open"
        message="Access your child's class information, assignments, and communicate with teachers. Connect to your school to view class channels, homework, and participate in class discussions."
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Class Page</Text>
        <Text style={styles.subtitle}>
          This is the Class page - Coming soon!
        </Text>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Group Channels</Text>
          <Text style={styles.cardContent}>
            This section will display various class channels like General,
            Assignments, Exams, Extracurricular, and Parent-Teacher Meetings.
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Class Posts</Text>
          <Text style={styles.cardContent}>
            Teachers can post announcements, homework reminders, and upcoming
            school trips with attachments.
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Channel Navigation</Text>
          <Text style={styles.cardContent}>
            Parents can navigate between different channels to see specific
            content relevant to each category.
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

export default ClassPage;
