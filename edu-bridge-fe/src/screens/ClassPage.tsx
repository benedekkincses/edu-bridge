import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSchool } from "../contexts/SchoolContext";
import { useClass, Channel } from "../contexts/ClassContext";
import NoSchoolFrame from "../components/NoSchoolFrame";
import { useLocalization } from "../contexts/LocalizationContext";
import { useAuth } from "../contexts/AuthContext";
import { apiService, Message } from "../services/apiService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;

const ClassPage: React.FC = () => {
  const { schools } = useSchool();
  const {
    classes,
    selectedClass,
    selectedChannel,
    selectChannel,
    clearClassSelection,
    refreshChannels,
  } = useClass();
  const { t } = useLocalization();
  const { user } = useAuth();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  // Create Channel Modal state
  const [isCreateChannelModalVisible, setIsCreateChannelModalVisible] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const createChannelSlideAnim = useRef(new Animated.Value(0)).current;

  // Invite Modal state
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [classMembers, setClassMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const inviteSlideAnim = useRef(new Animated.Value(0)).current;

  // Message-related state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const pollingRef = useRef<boolean>(false);
  const lastMessageTimeRef = useRef<Date>(new Date());

  // Fetch messages when channel changes
  useEffect(() => {
    if (selectedChannel && selectedClass) {
      initializeChannelThread();
    } else {
      // Clear messages when no channel selected
      setMessages([]);
      setThreadId(null);
      pollingRef.current = false;
    }

    return () => {
      // Stop polling when component unmounts or channel changes
      pollingRef.current = false;
    };
  }, [selectedChannel?.id, selectedClass?.id]);

  // Filter members based on search query
  useEffect(() => {
    if (!memberSearchQuery.trim()) {
      setFilteredMembers(classMembers);
      return;
    }

    const query = memberSearchQuery.toLowerCase();
    const filtered = classMembers.filter((member) => {
      const fullName = `${member.firstName || ""} ${member.lastName || ""}`.toLowerCase();
      const email = member.email?.toLowerCase() || "";
      return fullName.includes(query) || email.includes(query);
    });

    setFilteredMembers(filtered);
  }, [memberSearchQuery, classMembers]);

  const initializeChannelThread = async () => {
    if (!selectedChannel || !selectedClass) return;

    try {
      setIsLoadingMessages(true);
      setMessages([]);

      // Create or get thread (chat history) for this channel group
      const response = await apiService.createOrGetGroupThread(selectedChannel.id);

      if (response.success) {
        const channelThreadId = response.data.thread.id;
        setThreadId(channelThreadId);

        // Fetch existing messages
        await fetchMessages(channelThreadId);

        // Start polling for new messages
        pollingRef.current = true;
        startLongPolling(channelThreadId);
      }
    } catch (error) {
      console.error("Error initializing channel thread:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchMessages = async (channelThreadId: string) => {
    try {
      const response = await apiService.getThreadMessages(channelThreadId);
      if (response.success) {
        setMessages(response.data.messages);
        if (response.data.messages.length > 0) {
          const lastMsg = response.data.messages[response.data.messages.length - 1];
          lastMessageTimeRef.current = new Date(lastMsg.createdAt);
        }
        // Scroll to bottom after loading messages
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const startLongPolling = async (channelThreadId: string) => {
    while (pollingRef.current) {
      try {
        const response = await apiService.pollNewMessages(
          channelThreadId,
          lastMessageTimeRef.current,
          30000 // 30 second timeout
        );

        if (response.success && response.data.messages.length > 0) {
          const newMessages = response.data.messages;

          // Filter out messages that already exist in the state
          setMessages((prev) => {
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));

            if (uniqueNewMessages.length === 0) {
              return prev;
            }

            return [...prev, ...uniqueNewMessages];
          });

          // Update last message time
          const lastMsg = newMessages[newMessages.length - 1];
          lastMessageTimeRef.current = new Date(lastMsg.createdAt);

          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } catch (error) {
        // Silently handle polling errors to avoid spam
        console.log("Polling error (will retry):", error);
      }

      // Small delay before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending || !threadId) return;

    const textToSend = messageText.trim();

    setMessageText("");

    try {
      setIsSending(true);
      const response = await apiService.sendMessage(threadId, textToSend);
      if (response.success) {
        // Add the new message to the list only if it doesn't exist
        setMessages((prev) => {
          const exists = prev.some(m => m.id === response.data.message.id);
          if (exists) {
            return prev;
          }
          return [...prev, response.data.message];
        });

        // Update last message time
        lastMessageTimeRef.current = new Date(response.data.message.createdAt);

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore the message text if sending failed
      setMessageText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Show NoSchoolFrame if user has no schools
  if (schools.length === 0) {
    return (
      <NoSchoolFrame
        pageName={t("footer.class")}
        iconName="book-open"
        message={t("noSchool.classMessage")}
      />
    );
  }

  const toggleSidebar = () => {
    const toValue = sidebarVisible ? -SIDEBAR_WIDTH : 0;
    Animated.timing(sidebarAnim, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setSidebarVisible(!sidebarVisible);
  };

  const handleChannelSelect = (channel: Channel) => {
    selectChannel(channel);
    toggleSidebar();
  };

  const handleBackToClassSelection = async () => {
    toggleSidebar();
    // Clear the selected class to show the selection screen
    await clearClassSelection();
  };

  const openCreateChannelModal = () => {
    setIsCreateChannelModalVisible(true);
    createChannelSlideAnim.setValue(0);

    // Animate slide up
    Animated.timing(createChannelSlideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeCreateChannelModal = () => {
    Animated.timing(createChannelSlideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsCreateChannelModalVisible(false);
      setChannelName("");
      setChannelDescription("");
    });
  };

  const handleCreateChannel = async () => {
    if (!channelName.trim() || !selectedClass) return;

    try {
      setIsCreatingChannel(true);

      const response = await apiService.createGroup(
        selectedClass.id,
        channelName.trim(),
        channelDescription.trim() || undefined
      );

      if (response.success) {
        // Refresh channels to show the new one
        await refreshChannels();

        // Close modal
        closeCreateChannelModal();

        // Show success message (you can add a toast notification here if you have one)
        console.log(t("class.channelCreatedSuccess"));
      } else {
        console.error(t("class.channelCreatedError"));
      }
    } catch (error) {
      console.error("Error creating channel:", error);
    } finally {
      setIsCreatingChannel(false);
    }
  };

  const openInviteModal = async () => {
    if (!selectedClass || !selectedChannel) return;

    setIsInviteModalVisible(true);
    inviteSlideAnim.setValue(0);

    // Animate slide up
    Animated.timing(inviteSlideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIsLoadingMembers(true);

    try {
      // Fetch class members excluding those already in this channel
      const response = await apiService.getClassMembers(
        selectedClass.id,
        selectedChannel.id
      );
      if (response.success) {
        setClassMembers(response.data.members);
        setFilteredMembers(response.data.members);
      }
    } catch (error) {
      console.error("Error fetching class members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const closeInviteModal = () => {
    Animated.timing(inviteSlideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsInviteModalVisible(false);
      setMemberSearchQuery("");
      setClassMembers([]);
      setFilteredMembers([]);
    });
  };

  const handleAddMember = async (memberId: string) => {
    if (!selectedChannel) return;

    try {
      setAddingUserId(memberId);

      const response = await apiService.addUserToGroup(selectedChannel.id, memberId);

      if (response.success) {
        // Show success message
        console.log(t("class.memberAddedSuccess"));

        // Refresh the channel to update member count
        await refreshChannels();

        // Remove the added member from the list
        setClassMembers((prev) => prev.filter((m) => m.id !== memberId));
        setFilteredMembers((prev) => prev.filter((m) => m.id !== memberId));
      } else {
        console.error(t("class.memberAddedError"));
      }
    } catch (error: any) {
      console.error("Error adding member:", error);
      if (error.response?.data?.error) {
        console.error(error.response.data.error);
      }
    } finally {
      setAddingUserId(null);
    }
  };

  const renderChannelItem = ({ item }: { item: Channel }) => {
    const isSelected = selectedChannel?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.channelItem,
          isSelected && styles.channelItemSelected,
        ]}
        onPress={() => handleChannelSelect(item)}
      >
        <Feather
          name="hash"
          size={20}
          color={isSelected ? "#003366" : "#666"}
          style={styles.channelIcon}
        />
        <Text
          style={[
            styles.channelName,
            isSelected && styles.channelNameSelected,
          ]}
        >
          {item.name}
        </Text>
        <Text style={styles.memberCount}>
          {item.memberCount} {item.memberCount === 1 ? "member" : "members"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.senderId === user?.id;
    const senderName = item.sender
      ? `${item.sender.firstName || ""} ${item.sender.lastName || ""}`.trim()
      : "Unknown User";

    // Check if we should show the sender name
    // Show if: it's not my message AND (it's the first message OR sender changed OR more than 1 minute since last message)
    let showSenderName = !isMyMessage;

    if (!isMyMessage && index > 0) {
      const prevMessage = messages[index - 1];
      const isSameSender = prevMessage.senderId === item.senderId;
      const timeDiff = new Date(item.createdAt).getTime() - new Date(prevMessage.createdAt).getTime();
      const isWithinOneMinute = timeDiff < 60000; // 60000ms = 1 minute

      // Don't show sender name if same sender and within 1 minute
      if (isSameSender && isWithinOneMinute) {
        showSenderName = false;
      }
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {showSenderName && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
            ]}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderChannelContent = () => {
    if (!selectedChannel) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={60} color="#ccc" />
          <Text style={styles.emptyText}>{t("class.noChannelsAvailable")}</Text>
        </View>
      );
    }

    // Render different content based on channel type
    return (
      <View style={styles.channelContent}>
        {isLoadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#003366" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyMessagesContainer}>
                <Feather name="message-circle" size={60} color="#ccc" />
                <Text style={styles.emptyText}>{t("class.noMessagesYet")}</Text>
                <Text style={styles.emptySubtext}>
                  {selectedChannel.description}
                </Text>
              </View>
            }
          />
        )}

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("class.typeMessage")}
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.hamburgerButton}
            onPress={toggleSidebar}
          >
            <Feather name="menu" size={24} color="#003366" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {selectedChannel?.name || t("class.title")}
            </Text>
            {selectedChannel?.description && (
              <Text style={styles.headerSubtitle}>
                {selectedChannel.description}
              </Text>
            )}
          </View>
          {selectedChannel && (
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={openInviteModal}
            >
              <Feather name="user-plus" size={20} color="#003366" />
            </TouchableOpacity>
          )}
        </View>

        {/* Channel Content */}
        {renderChannelContent()}
      </View>

      {/* Sidebar Overlay */}
      {sidebarVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarAnim }],
          },
        ]}
      >
        {/* Sidebar Header */}
        <View style={styles.sidebarHeader}>
          {classes.length > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToClassSelection}
            >
              <Feather name="arrow-left" size={20} color="#003366" />
              <Text style={styles.backButtonText}>
                {t("class.backToClassSelection")}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.className}>{selectedClass?.name}</Text>
          <Text style={styles.classGrade}>{selectedClass?.grade}</Text>
        </View>

        {/* Channels Header */}
        <View style={styles.channelSectionHeader}>
          <Text style={styles.channelSectionTitle}>{t("class.channels")}</Text>
          {selectedClass?.permissions?.canCreateGroups && (
            <TouchableOpacity
              style={styles.addChannelButton}
              onPress={openCreateChannelModal}
            >
              <Feather name="plus" size={16} color="#003366" />
            </TouchableOpacity>
          )}
        </View>

        {/* Channel List */}
        <FlatList
          data={selectedClass?.channels || []}
          keyExtractor={(item) => item.id}
          renderItem={renderChannelItem}
          contentContainerStyle={styles.channelList}
          ListEmptyComponent={
            <View style={styles.emptyChannelsContainer}>
              <Text style={styles.emptyChannelsText}>
                {t("class.noChannelsAvailable")}
              </Text>
              <Text style={styles.emptyChannelsSubtext}>
                Only users with permission can create channels
              </Text>
            </View>
          }
        />
      </Animated.View>

      {/* Invite to Channel Modal */}
      <Modal
        visible={isInviteModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeInviteModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: inviteSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("class.inviteToChannel")}</Text>
              <TouchableOpacity onPress={closeInviteModal}>
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
                placeholder={t("class.searchMembers")}
                value={memberSearchQuery}
                onChangeText={setMemberSearchQuery}
                placeholderTextColor="#999"
              />
            </View>

            {isLoadingMembers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#003366" />
              </View>
            ) : (
              <FlatList
                data={filteredMembers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const initials = `${item.firstName?.charAt(0) || ""}${item.lastName?.charAt(0) || ""}`.toUpperCase();
                  const isAdding = addingUserId === item.id;

                  return (
                    <View style={styles.memberItem}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>
                          {item.firstName} {item.lastName}
                        </Text>
                        {item.email && (
                          <Text style={styles.memberEmail}>{item.email}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.inviteMemberButton,
                          isAdding && styles.inviteMemberButtonDisabled,
                        ]}
                        onPress={() => handleAddMember(item.id)}
                        disabled={isAdding}
                      >
                        {isAdding ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.inviteMemberButtonText}>
                            {t("class.inviteMember")}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Feather name="users" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>
                      {t("class.noMembersFound")}
                    </Text>
                  </View>
                }
                contentContainerStyle={
                  filteredMembers.length === 0
                    ? styles.emptyListContent
                    : undefined
                }
              />
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Create Channel Modal */}
      <Modal
        visible={isCreateChannelModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeCreateChannelModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: createChannelSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("class.createChannel")}</Text>
              <TouchableOpacity onPress={closeCreateChannelModal}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{t("class.channelName")}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder={t("class.channelNamePlaceholder")}
                placeholderTextColor="#999"
                value={channelName}
                onChangeText={setChannelName}
                autoFocus
              />

              <Text style={styles.inputLabel}>{t("class.channelDescription")}</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder={t("class.channelDescriptionPlaceholder")}
                placeholderTextColor="#999"
                value={channelDescription}
                onChangeText={setChannelDescription}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!channelName.trim() || isCreatingChannel) && styles.createButtonDisabled,
                ]}
                onPress={handleCreateChannel}
                disabled={!channelName.trim() || isCreatingChannel}
              >
                {isCreatingChannel ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>
                    {t("class.createChannelButton")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8EAED",
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  hamburgerButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  channelContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    color: "#333",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#fff",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  sidebarHeader: {
    padding: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: "#003366",
    marginLeft: 6,
  },
  className: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  classGrade: {
    fontSize: 14,
    color: "#666",
  },
  channelSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
  },
  channelSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  addChannelButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#E8F0F8",
  },
  channelList: {
    paddingVertical: 8,
  },
  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  channelItemSelected: {
    backgroundColor: "#E8F0F8",
  },
  channelIcon: {
    marginRight: 12,
  },
  channelName: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  channelNameSelected: {
    fontWeight: "600",
    color: "#003366",
  },
  memberCount: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  emptyChannelsContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyChannelsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyChannelsSubtext: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  theirMessageContainer: {
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: "#003366",
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  theirMessageTime: {
    color: "#999",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
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
    paddingTop: 20,
    maxHeight: "70%",
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
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  createButton: {
    backgroundColor: "#003366",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  createButtonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  inviteButton: {
    padding: 8,
    marginLeft: 8,
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: "#666",
  },
  inviteMemberButton: {
    backgroundColor: "#003366",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteMemberButtonDisabled: {
    backgroundColor: "#ccc",
  },
  inviteMemberButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyListContent: {
    flexGrow: 1,
  },
});

export default ClassPage;
