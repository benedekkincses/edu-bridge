import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLocalization } from "../contexts/LocalizationContext";

export interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  schoolName: string;
  studentCount?: number;
}

interface ClassSelectionScreenProps {
  classes: ClassInfo[];
  isLoading: boolean;
  onSelectClass: (classInfo: ClassInfo) => void;
}

const ClassSelectionScreen: React.FC<ClassSelectionScreenProps> = ({
  classes,
  isLoading,
  onSelectClass,
}) => {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = classes.filter((classInfo) => {
    const query = searchQuery.toLowerCase();
    return (
      classInfo.name.toLowerCase().includes(query) ||
      classInfo.grade.toLowerCase().includes(query) ||
      classInfo.schoolName.toLowerCase().includes(query)
    );
  });

  const handleSelectClass = (classInfo: ClassInfo) => {
    onSelectClass(classInfo);
  };

  const renderClassCard = ({ item }: { item: ClassInfo }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => handleSelectClass(item)}
      activeOpacity={0.7}
    >
      <View style={styles.classIconContainer}>
        <Feather name="book-open" size={32} color="#003366" />
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={styles.classGrade}>{item.grade}</Text>
        <Text style={styles.schoolName}>{item.schoolName}</Text>
        {item.studentCount && (
          <View style={styles.studentCount}>
            <Feather name="users" size={14} color="#666" />
            <Text style={styles.studentCountText}>
              {item.studentCount} students
            </Text>
          </View>
        )}
      </View>
      <Feather name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("class.selectClass")}</Text>
        <Text style={styles.subtitle}>{t("class.selectClassSubtitle")}</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("class.searchClasses")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Classes list */}
      <FlatList
        data={filteredClasses}
        keyExtractor={(item) => item.id}
        renderItem={renderClassCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No classes found</Text>
          </View>
        }
      />
    </View>
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
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  listContent: {
    padding: 16,
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  classIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F0F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  classGrade: {
    fontSize: 14,
    color: "#003366",
    fontWeight: "500",
    marginBottom: 2,
  },
  schoolName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  studentCount: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  studentCountText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
});

export default ClassSelectionScreen;
