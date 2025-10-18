import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useSchool } from "../contexts/SchoolContext";
import { useLocalization } from "../contexts/LocalizationContext";
import { Language } from "../locales";

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { schools, selectedSchool, selectSchool } = useSchool();
  const { language, setLanguage, t } = useLocalization();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSchoolSelector, setShowSchoolSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const slideAnim = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    if (showSchoolSelector) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
      }).start();
    } else {
      slideAnim.setValue(1000);
    }
  }, [showSchoolSelector]);

  const handleSchoolSelect = (school: any) => {
    selectSchool(school);
    setShowSchoolSelector(false);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
  };

  // Only show school selector dropdown if there are multiple schools
  const showSchoolDropdown = schools.length > 1;

  return (
    <View style={styles.container}>
      {/* School Selector */}
      <TouchableOpacity
        style={styles.schoolSelector}
        onPress={() => showSchoolDropdown && setShowSchoolSelector(true)}
        activeOpacity={showSchoolDropdown ? 0.6 : 1}
        disabled={!showSchoolDropdown}
      >
        <Feather name="home" size={20} color="#003366" style={styles.schoolIcon} />
        <Text style={styles.schoolName}>
          {selectedSchool?.name || t("common.noSchool")}
        </Text>
        {showSchoolDropdown && (
          <Feather name="chevron-down" size={16} color="#003366" />
        )}
      </TouchableOpacity>

      {/* Profile Icon */}
      <TouchableOpacity
        style={styles.profileIcon}
        onPress={() => setShowProfileMenu(!showProfileMenu)}
        activeOpacity={1}
      >
        <Text style={styles.profileIconText}>
          {user?.firstName?.[0] || user?.username?.[0] || "U"}
        </Text>
      </TouchableOpacity>

      {/* Profile Dropdown Menu */}
      <Modal
        visible={showProfileMenu}
        transparent
        animationType="none"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={styles.profileMenu}>
            <View style={styles.profileMenuHeader}>
              <Text style={styles.profileMenuName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileMenuEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setShowProfileMenu(false);
                setShowLanguageSelector(true);
              }}
            >
              <Feather name="globe" size={20} color="#003366" style={styles.profileMenuIcon} />
              <Text style={styles.profileMenuItemTextNormal}>{t("profile.language")}</Text>
              <Text style={styles.profileMenuItemValue}>
                {t(`languages.${language}`)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.profileMenuItem, styles.profileMenuItemLast]}
              onPress={handleLogout}
            >
              <Feather name="log-out" size={20} color="#FF3B30" style={styles.profileMenuIcon} />
              <Text style={styles.profileMenuItemText}>{t("common.logout")}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* School Selector Bottom Sheet */}
      {showSchoolSelector && (
        <Modal
          visible={showSchoolSelector}
          transparent
          animationType="none"
          onRequestClose={() => setShowSchoolSelector(false)}
        >
          <View style={styles.bottomSheetOverlay}>
            <TouchableOpacity
              style={styles.overlayTouchable}
              activeOpacity={1}
              onPress={() => setShowSchoolSelector(false)}
            />
            <Animated.View
              style={[
                styles.schoolSelectorBottomSheet,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>{t("common.selectSchool")}</Text>
              <TouchableOpacity onPress={() => setShowSchoolSelector(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.bottomSheetScroll}>
              {schools.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.schoolItem,
                    selectedSchool?.id === item.id &&
                      styles.schoolItemSelected,
                  ]}
                  onPress={() => handleSchoolSelect(item)}
                >
                  <Feather name="home" size={20} color="#666" />
                  <Text
                    style={[
                      styles.schoolItemText,
                      selectedSchool?.id === item.id &&
                        styles.schoolItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedSchool?.id === item.id && (
                    <Feather name="check" size={20} color="#003366" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <Modal
          visible={showLanguageSelector}
          transparent
          animationType="none"
          onRequestClose={() => setShowLanguageSelector(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowLanguageSelector(false)}
          >
            <View style={styles.languageSelectorModal}>
              <View style={styles.languageSelectorHeader}>
                <Text style={styles.languageSelectorTitle}>{t("login.selectLanguage")}</Text>
                <TouchableOpacity onPress={() => setShowLanguageSelector(false)}>
                  <Feather name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              {[
                { code: "en" as Language, name: t("languages.en") },
                { code: "hu" as Language, name: t("languages.hu") },
              ].map((lang, index, array) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    language === lang.code && styles.languageOptionSelected,
                    index === array.length - 1 && styles.languageOptionLast,
                  ]}
                  onPress={async () => {
                    await setLanguage(lang.code);
                    setShowLanguageSelector(false);
                  }}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      language === lang.code && styles.languageOptionTextSelected,
                    ]}
                  >
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <Feather name="check" size={20} color="#003366" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#E8EAED",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  schoolSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  schoolIcon: {
    marginRight: 4,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 16,
  },
  profileMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 200,
  },
  profileMenuHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileMenuName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  profileMenuEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileMenuIcon: {
    marginRight: 12,
  },
  profileMenuItemText: {
    fontSize: 16,
    color: "#FF3B30",
    flex: 1,
  },
  profileMenuItemTextNormal: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  profileMenuItemValue: {
    fontSize: 14,
    color: "#666",
  },
  profileMenuItemLast: {
    borderBottomWidth: 0,
  },
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayTouchable: {
    flex: 1,
  },
  schoolSelectorBottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  bottomSheetScroll: {
    maxHeight: "100%",
  },
  schoolItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  schoolItemSelected: {
    backgroundColor: "#E8F4FF",
  },
  schoolItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  schoolItemTextSelected: {
    color: "#003366",
    fontWeight: "600",
  },
  languageSelectorModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    minWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  languageSelectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  languageSelectorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  languageOptionSelected: {
    backgroundColor: "#E8F4FF",
  },
  languageOptionText: {
    fontSize: 16,
    color: "#333",
  },
  languageOptionTextSelected: {
    color: "#003366",
    fontWeight: "600",
  },
  languageOptionLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});

export default AppHeader;
