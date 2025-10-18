import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalization } from "../contexts/LocalizationContext";

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
  const { t } = useLocalization();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <Feather name={iconName} size={60} color="#003366" />
      </View>
      <Text style={styles.title}>{t("noSchool.title")}</Text>
      <Text style={styles.subtitle}>{pageName}</Text>
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>{t("noSchool.whatsNext")}</Text>
        <Text style={styles.infoText}>
          • {t("noSchool.step1")}
        </Text>
        <Text style={styles.infoText}>
          • {t("noSchool.step2")}
        </Text>
        <Text style={styles.infoText}>
          • {t("noSchool.step3")}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
