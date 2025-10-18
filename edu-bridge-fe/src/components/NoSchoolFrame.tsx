import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

interface NoSchoolFrameProps {
  pageName: string;
  message: string;
  iconName?: keyof typeof Feather.glyphMap;
}

const NoSchoolFrame: React.FC<NoSchoolFrameProps> = ({
  pageName,
  message,
  iconName = "home",
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <Feather name={iconName} size={60} color="#666" />
      </View>
      <Text style={styles.title}>Not Connected to Any School</Text>
      <Text style={styles.subtitle}>{pageName}</Text>
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What's Next?</Text>
        <Text style={styles.infoText}>
          • Contact your school administrator to get added to your school
        </Text>
        <Text style={styles.infoText}>
          • Once added, you'll be able to access all features
        </Text>
        <Text style={styles.infoText}>
          • You'll receive notifications from teachers and school staff
        </Text>
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
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8EAED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C2C2C",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  messageContainer: {
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
    width: "100%",
  },
  message: {
    fontSize: 16,
    color: "#856404",
    lineHeight: 24,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 24,
    marginBottom: 8,
  },
});

export default NoSchoolFrame;
