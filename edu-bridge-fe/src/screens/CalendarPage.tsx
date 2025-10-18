import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSchool } from "../contexts/SchoolContext";
import NoSchoolFrame from "../components/NoSchoolFrame";
import { useLocalization } from "../contexts/LocalizationContext";

const CalendarPage: React.FC = () => {
  const { schools } = useSchool();
  const { t } = useLocalization();

  // Show NoSchoolFrame if user has no schools
  if (schools.length === 0) {
    return (
      <NoSchoolFrame
        pageName={t("footer.calendar")}
        iconName="calendar"
        message={t("noSchool.calendarMessage")}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t("calendar.title")}</Text>
        <Text style={styles.subtitle}>
          {t("calendar.subtitle")}
        </Text>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>{t("calendar.calendarViewsTitle")}</Text>
          <Text style={styles.cardContent}>
            {t("calendar.calendarViewsContent")}
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>{t("calendar.eventManagementTitle")}</Text>
          <Text style={styles.cardContent}>
            {t("calendar.eventManagementContent")}
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>{t("calendar.addEventsTitle")}</Text>
          <Text style={styles.cardContent}>
            {t("calendar.addEventsContent")}
          </Text>
        </View>
        <View style={styles.testCard}>
          <Text style={styles.cardTitle}>{t("calendar.eventIndicatorsTitle")}</Text>
          <Text style={styles.cardContent}>
            {t("calendar.eventIndicatorsContent")}
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

export default CalendarPage;
