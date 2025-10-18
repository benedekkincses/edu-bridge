import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { School } from "../services/apiService";
import { useLocalization } from "../contexts/LocalizationContext";

interface SchoolSelectorScreenProps {
  schools: School[];
  isLoading: boolean;
  onSelectSchool: (school: School) => void;
}

const SchoolSelectorScreen: React.FC<SchoolSelectorScreenProps> = ({
  schools,
  isLoading,
  onSelectSchool,
}) => {
  const { t } = useLocalization();
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>{t("schoolSelector.loadingSchools")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t("schoolSelector.title")}</Text>
        <Text style={styles.subtitle}>
          {t("schoolSelector.subtitle")}
        </Text>

        <View style={styles.schoolsContainer}>
          {schools.map((school) => (
            <TouchableOpacity
              key={school.id}
              style={styles.schoolCard}
              onPress={() => onSelectSchool(school)}
              activeOpacity={0.7}
            >
              <View style={styles.schoolIconContainer}>
                {school.logo ? (
                  <Text style={styles.schoolIcon}>🏫</Text>
                ) : (
                  <Text style={styles.schoolIcon}>🏫</Text>
                )}
              </View>
              <View style={styles.schoolInfo}>
                <Text style={styles.schoolName}>{school.name}</Text>
                {school.address && (
                  <Text style={styles.schoolAddress}>{school.address}</Text>
                )}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8EAED",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  schoolsContainer: {
    gap: 16,
  },
  schoolCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  schoolIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D5D9DE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  schoolIcon: {
    fontSize: 30,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 14,
    color: "#666",
  },
  chevron: {
    fontSize: 32,
    color: "#003366",
    fontWeight: "300",
  },
});

export default SchoolSelectorScreen;
