import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useAuth } from "../contexts/AuthContext";
import { useLocalization } from "../contexts/LocalizationContext";
import { useNavigation } from "@react-navigation/native";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocalization();
  const navigation = useNavigation();
  const [copied, setCopied] = useState(false);

  const handleCopyUserId = async () => {
    if (user?.id) {
      await Clipboard.setStringAsync(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0] || user?.username?.[0] || "U"}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* User Information Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.accountDetails")}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="user" size={20} color="#003366" style={styles.infoIcon} />
                <Text style={styles.infoLabelText}>{t("profile.fullName")}</Text>
              </View>
              <Text style={styles.infoValue}>
                {user?.firstName} {user?.lastName}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="mail" size={20} color="#003366" style={styles.infoIcon} />
                <Text style={styles.infoLabelText}>{t("profile.email")}</Text>
              </View>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Feather name="at-sign" size={20} color="#003366" style={styles.infoIcon} />
                <Text style={styles.infoLabelText}>{t("profile.username")}</Text>
              </View>
              <Text style={styles.infoValue}>{user?.username}</Text>
            </View>
          </View>
        </View>

        {/* User ID Section - Most Important */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.technicalInfo")}</Text>

          <View style={styles.userIdCard}>
            <View style={styles.userIdHeader}>
              <Feather name="hash" size={24} color="#003366" />
              <Text style={styles.userIdTitle}>{t("profile.userId")}</Text>
            </View>
            <View style={styles.userIdContainer}>
              <Text style={styles.userIdValue}>{user?.id}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyUserId}
              >
                <Feather
                  name={copied ? "check" : "copy"}
                  size={20}
                  color={copied ? "#4CAF50" : "#003366"}
                />
                <Text style={[styles.copyButtonText, copied && styles.copiedText]}>
                  {copied ? t("profile.copied") : t("profile.copy")}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.userIdDescription}>
              {t("profile.userIdDescription")}
            </Text>
          </View>
        </View>

        {/* Additional Information */}
        {user?.emailVerified !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("profile.verification")}</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabel}>
                  <Feather
                    name={user.emailVerified ? "check-circle" : "alert-circle"}
                    size={20}
                    color={user.emailVerified ? "#4CAF50" : "#FF9800"}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoLabelText}>{t("profile.emailVerified")}</Text>
                </View>
                <Text
                  style={[
                    styles.infoValue,
                    user.emailVerified ? styles.verified : styles.unverified
                  ]}
                >
                  {user.emailVerified ? t("profile.yes") : t("profile.no")}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8EAED",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#003366",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#2C2C2C",
    paddingLeft: 28,
  },
  userIdCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#003366",
  },
  userIdHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userIdTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
    marginLeft: 12,
  },
  userIdContainer: {
    marginBottom: 12,
  },
  userIdValue: {
    fontSize: 16,
    fontFamily: "monospace",
    color: "#2C2C2C",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F4FF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#003366",
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginLeft: 8,
  },
  copiedText: {
    color: "#4CAF50",
  },
  userIdDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  verified: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  unverified: {
    color: "#FF9800",
    fontWeight: "600",
  },
});

export default ProfilePage;
