import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

interface School {
  id: string;
  name: string;
}

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSchoolSelector, setShowSchoolSelector] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School>({
    id: "1",
    name: "St. Peter's School",
  });

  // Mock schools data
  const schools: School[] = [
    { id: "1", name: "St. Peter's School" },
    { id: "2", name: "St. Anderson's" },
    { id: "3", name: "Lincoln High School" },
  ];

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    setShowSchoolSelector(false);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
  };

  return (
    <View style={styles.container}>
      {/* School Selector */}
      <TouchableOpacity
        style={styles.schoolSelector}
        onPress={() => setShowSchoolSelector(true)}
      >
        <Text style={styles.schoolIcon}>🎓</Text>
        <Text style={styles.schoolName}>{selectedSchool.name}</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {/* Profile Icon */}
      <TouchableOpacity
        style={styles.profileIcon}
        onPress={() => setShowProfileMenu(!showProfileMenu)}
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

      {/* School Selector Dropdown */}
      <Modal
        visible={showSchoolSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSchoolSelector(false)}
      >
        <TouchableOpacity
          style={styles.transparentOverlay}
          activeOpacity={1}
          onPress={() => setShowSchoolSelector(false)}
        >
          <View style={styles.schoolSelectorDropdown}>
            <FlatList
              data={schools}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.schoolItem,
                    selectedSchool.id === item.id &&
                      styles.schoolItemSelected,
                  ]}
                  onPress={() => handleSchoolSelect(item)}
                >
                  <Text style={styles.schoolItemIcon}>🎓</Text>
                  <Text
                    style={[
                      styles.schoolItemText,
                      selectedSchool.id === item.id &&
                        styles.schoolItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedSchool.id === item.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    flex: 1,
  },
  schoolIcon: {
    fontSize: 20,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  dropdownIcon: {
    fontSize: 10,
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
  transparentOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 60,
    paddingLeft: 16,
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
  schoolSelectorDropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    minWidth: 250,
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  schoolItemIcon: {
    fontSize: 20,
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
  checkmark: {
    fontSize: 20,
    color: "#007AFF",
  },
});

export default AppHeader;
