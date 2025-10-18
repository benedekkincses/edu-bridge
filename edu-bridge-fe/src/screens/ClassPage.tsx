import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSchool } from "../contexts/SchoolContext";
import { useClass, Channel } from "../contexts/ClassContext";
import NoSchoolFrame from "../components/NoSchoolFrame";
import { useLocalization } from "../contexts/LocalizationContext";

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
  } = useClass();
  const { t } = useLocalization();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

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

  const getChannelIcon = (type: Channel["type"]) => {
    switch (type) {
      case "news":
        return "rss";
      case "general":
        return "hash";
      case "assignments":
        return "clipboard";
      case "exams":
        return "file-text";
      case "extracurricular":
        return "activity";
      case "meetings":
        return "calendar";
      default:
        return "hash";
    }
  };

  const renderChannelItem = ({ item }: { item: Channel }) => {
    const isSelected = selectedChannel?.id === item.id;
    const isNewsFeed = item.type === "news";

    return (
      <TouchableOpacity
        style={[
          styles.channelItem,
          isSelected && styles.channelItemSelected,
          isNewsFeed && styles.newsFeedItem,
        ]}
        onPress={() => handleChannelSelect(item)}
      >
        <Feather
          name={getChannelIcon(item.type)}
          size={isNewsFeed ? 22 : 20}
          color={isSelected ? "#003366" : "#666"}
          style={styles.channelIcon}
        />
        <Text
          style={[
            styles.channelName,
            isSelected && styles.channelNameSelected,
            isNewsFeed && styles.newsFeedName,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
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
        <FlatList
          data={[]}
          keyExtractor={(item, index) => index.toString()}
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

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("class.typeMessage")}
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Feather name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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

        {/* News Feed (Special Channel) */}
        {selectedClass?.channels && (
          <View style={styles.channelSection}>
            {selectedClass.channels
              .filter((c) => c.type === "news")
              .map((channel) => (
                <View key={channel.id}>
                  {renderChannelItem({ item: channel })}
                </View>
              ))}
          </View>
        )}

        {/* Channels Header */}
        <View style={styles.channelSectionHeader}>
          <Text style={styles.channelSectionTitle}>{t("class.channels")}</Text>
        </View>

        {/* Channel List */}
        <FlatList
          data={selectedClass?.channels.filter((c) => c.type !== "news") || []}
          keyExtractor={(item) => item.id}
          renderItem={renderChannelItem}
          contentContainerStyle={styles.channelList}
          ListEmptyComponent={
            <View style={styles.emptyChannelsContainer}>
              <Text style={styles.emptyChannelsText}>
                {t("class.noChannelsAvailable")}
              </Text>
            </View>
          }
        />
      </Animated.View>
    </View>
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
  channelSection: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  channelSectionHeader: {
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
  newsFeedItem: {
    backgroundColor: "#f0f8ff",
  },
  channelIcon: {
    marginRight: 12,
  },
  channelName: {
    fontSize: 16,
    color: "#666",
  },
  channelNameSelected: {
    fontWeight: "600",
    color: "#003366",
  },
  newsFeedName: {
    fontWeight: "600",
    fontSize: 16,
  },
  emptyChannelsContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyChannelsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default ClassPage;
