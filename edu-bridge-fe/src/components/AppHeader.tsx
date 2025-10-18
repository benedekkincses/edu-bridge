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

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { schools, selectedSchool, selectSchool } = useSchool();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSchoolSelector, setShowSchoolSelector] = useState(false);
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
        <Feather name="home" size={20} color="#007AFF" style={styles.schoolIcon} />
        <Text style={styles.schoolName}>
          {selectedSchool?.name || "No School"}
        </Text>
        {showSchoolDropdown && (
          <Feather name="chevron-down" size={16} color="#007AFF" />
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
        animationType="fade"
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
              onPress={handleLogout}
            >
              <Text style={styles.profileMenuItemText}>Logout</Text>
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
              <Text style={styles.bottomSheetTitle}>Select School</Text>
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
                    <Feather name="check" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            </Animated.View>
          </View>
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
    backgroundColor: "#fff",
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
    color: "#007AFF",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
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
    padding: 16,
  },
  profileMenuItemText: {
    fontSize: 16,
    color: "#FF3B30",
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
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default AppHeader;
