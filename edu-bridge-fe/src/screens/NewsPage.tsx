import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSchool } from "../contexts/SchoolContext";
import NoSchoolFrame from "../components/NoSchoolFrame";

const NewsPage: React.FC = () => {
  const { schools } = useSchool();

  // Show NoSchoolFrame if user has no schools
  if (schools.length === 0) {
    return (
      <NoSchoolFrame
        pageName="News Feed"
        iconName="file-text"
        message="Stay updated with the latest news, announcements, and events from your school. Once you're connected to a school, all important updates will appear here."
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>School News Feed</Text>
        <Text style={styles.subtitle}>
          This is the News page - Coming soon!
        </Text>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Test Card 1</Text>
          <Text style={styles.cardContent}>
            This page will display school news, announcements, events, and
            sports updates.
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Test Card 2</Text>
          <Text style={styles.cardContent}>
            Features will include filtering by category (All, Events,
            Announcements, Sports) and search functionality.
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Test Card 3</Text>
          <Text style={styles.cardContent}>
            Each news item will show date, title, preview text, and a "Read
            More" button.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8EAED",
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

export default NewsPage;
