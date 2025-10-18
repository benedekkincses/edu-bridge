import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSchool } from "../contexts/SchoolContext";
import NoSchoolFrame from "../components/NoSchoolFrame";

const CalendarPage: React.FC = () => {
  const { schools } = useSchool();

  // Show NoSchoolFrame if user has no schools
  if (schools.length === 0) {
    return (
      <NoSchoolFrame
        pageName="Calendar"
        icon="📅"
        message="Keep track of important school events, parent-teacher conferences, holidays, and your child's activities. Once you're connected to a school, all scheduled events will appear in your personalized calendar."
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>
          This is the Calendar page - Coming soon!
        </Text>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Calendar Views</Text>
          <Text style={styles.cardContent}>
            Switch between Day, Week, and Month views to see school events and
            schedules at different levels of detail.
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Event Management</Text>
          <Text style={styles.cardContent}>
            View all scheduled events, parent-teacher conferences, school
            holidays, field trips, and important dates.
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Add Events</Text>
          <Text style={styles.cardContent}>
            Add personal reminders and mark important dates for your child's
            school activities.
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>Event Indicators</Text>
          <Text style={styles.cardContent}>
            Different colored dots on calendar dates indicate various event
            types (blue for regular events, red for important dates).
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

export default CalendarPage;
