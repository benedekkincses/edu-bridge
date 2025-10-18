import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSchool } from "../contexts/SchoolContext";
import { useAuth } from "../contexts/AuthContext";
import NoSchoolFrame from "../components/NoSchoolFrame";
import { useLocalization } from "../contexts/LocalizationContext";
import { apiService, Thread, SchoolUser } from "../services/apiService";

const MessagesPage: React.FC = () => {
  const { schools, selectedSchool } = useSchool();
  const { user } = useAuth();
  const { t } = useLocalization();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [schoolUsers, setSchoolUsers] = useState<SchoolUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SchoolUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Show NoSchoolFrame if user has no schools
  if (schools.length === 0) {
    return (
      <NoSchoolFrame
        pageName={t("footer.messages")}
        iconName="message-circle"
        message={t("noSchool.messagesMessage")}
      />
    );
  }

  useEffect(() => {
    if (selectedSchool && user) {
      fetchThreads();
    }
  }, [selectedSchool, user]);

  useEffect(() => {
    filterThreads();
  }, [searchQuery, threads]);

  useEffect(() => {
    filterUsers();
  }, [userSearchQuery, schoolUsers]);

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUserThreads();
      if (response.success) {
        setThreads(response.data.threads);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterThreads = () => {
    if (!searchQuery.trim()) {
      setFilteredThreads(threads);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = threads.filter((thread) => {
      if (!thread.participant) return false;

      const fullName =
        `${thread.participant.firstName} ${thread.participant.lastName}`.toLowerCase();
      const email = thread.participant.email?.toLowerCase() || "";

      return fullName.includes(query) || email.includes(query);
    });

    setFilteredThreads(filtered);
  };

  const filterUsers = () => {
    if (!userSearchQuery.trim()) {
      setFilteredUsers(schoolUsers);
      return;
    }

    const query = userSearchQuery.toLowerCase();
    const filtered = schoolUsers.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const email = user.email?.toLowerCase() || "";

      return fullName.includes(query) || email.includes(query);
    });

    setFilteredUsers(filtered);
  };

  const openAddContactModal = async () => {
    if (!selectedSchool) return;

    setIsModalVisible(true);
    setIsLoadingUsers(true);

    try {
      const response = await apiService.getSchoolUsers(selectedSchool.id);
      if (response.success) {
        setSchoolUsers(response.data.users);
        setFilteredUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching school users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSelectUser = async (selectedUser: SchoolUser) => {
    try {
      setIsModalVisible(false);
      setIsLoading(true);

      // Create or get existing thread
      const response = await apiService.createOrGetThread(selectedUser.id);

      if (response.success) {
        // Refresh threads to include the new one
        await fetchThreads();
        // TODO: Navigate to chat view with this thread
        console.log("Thread created/retrieved:", response.data.thread);
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setIsLoading(false);
      setUserSearchQuery("");
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setUserSearchQuery("");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const renderAIAssistant = () => (
    <TouchableOpacity style={styles.threadItem} onPress={() => {}}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, styles.aiAvatar]}>
          <Feather name="cpu" size={24} color="#fff" />
        </View>
      </View>
      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <Text style={styles.threadName}>{t("messages.aiAssistant")}</Text>
          <Text style={styles.threadTime}></Text>
        </View>
        <Text style={styles.threadPreview} numberOfLines={1}>
          {t("messages.aiAssistantStatus")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderThread = ({ item }: { item: Thread }) => {
    if (!item.participant) return null;

    const initials = `${item.participant.firstName.charAt(0)}${item.participant.lastName.charAt(0)}`.toUpperCase();

    return (
      <TouchableOpacity style={styles.threadItem} onPress={() => {}}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {item.lastMessage && !item.lastMessage.isRead && (
            <View style={styles.unreadBadge} />
          )}
        </View>
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <Text style={styles.threadName}>
              {item.participant.firstName} {item.participant.lastName}
            </Text>
            {item.lastMessage && (
              <Text style={styles.threadTime}>
                {formatTime(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.threadPreview,
              item.lastMessage && !item.lastMessage.isRead && styles.unreadText,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage?.content || t("messages.noConversations")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }: { item: SchoolUser }) => {
    const initials = `${item.firstName?.charAt(0) || ""}${item.lastName?.charAt(0) || ""}`.toUpperCase();

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleSelectUser(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.firstName} {item.lastName}
          </Text>
          {item.email && <Text style={styles.userEmail}>{item.email}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("messages.searchPlaceholder")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Thread list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      ) : (
        <FlatList
          data={filteredThreads}
          keyExtractor={(item) => item.threadId}
          renderItem={renderThread}
          ListHeaderComponent={renderAIAssistant}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="message-circle" size={60} color="#ccc" />
              <Text style={styles.emptyText}>{t("messages.noConversations")}</Text>
              <Text style={styles.emptySubtext}>
                {t("messages.startConversation")}
              </Text>
            </View>
          }
          contentContainerStyle={
            filteredThreads.length === 0 ? styles.emptyListContent : undefined
          }
        />
      )}

      {/* Floating Add button */}
      <TouchableOpacity style={styles.fab} onPress={openAddContactModal}>
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Contact Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("messages.findPeople")}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Feather
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={t("messages.searchPeople")}
                value={userSearchQuery}
                onChangeText={setUserSearchQuery}
                placeholderTextColor="#999"
              />
            </View>

            {isLoadingUsers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#003366" />
              </View>
            ) : (
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                renderItem={renderUserItem}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Feather name="users" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>
                      {t("messages.noPeopleFound")}
                    </Text>
                  </View>
                }
                contentContainerStyle={
                  filteredUsers.length === 0
                    ? styles.emptyListContent
                    : undefined
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8EAED",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  threadItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
  },
  aiAvatar: {
    backgroundColor: "#7B68EE",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#fff",
  },
  threadContent: {
    flex: 1,
    justifyContent: "center",
  },
  threadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  threadName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  threadTime: {
    fontSize: 12,
    color: "#999",
  },
  threadPreview: {
    fontSize: 14,
    color: "#666",
  },
  unreadText: {
    fontWeight: "600",
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  modalSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 44,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
});

export default MessagesPage;
