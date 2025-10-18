import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { apiService, Message } from "../services/apiService";

const ChatScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { threadId, participantName } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);
  const pollingRef = useRef<boolean>(false);
  const lastMessageTimeRef = useRef<Date>(new Date());

  useEffect(() => {
    fetchMessages();
    // Start long polling
    pollingRef.current = true;
    startLongPolling();

    return () => {
      // Stop polling when component unmounts
      pollingRef.current = false;
    };
  }, [threadId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getThreadMessages(threadId);
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

        // Mark messages as read
        markMessagesAsRead(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startLongPolling = async () => {
    while (pollingRef.current) {
      try {
        const response = await apiService.pollNewMessages(
          threadId,
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

          // Mark new messages as read
          markMessagesAsRead(newMessages);
        }
      } catch (error) {
        // Silently handle polling errors to avoid spam
        console.log("Polling error (will retry):", error);
      }

      // Small delay before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  const markMessagesAsRead = async (messagesToMark: Message[]) => {
    // Mark all messages not sent by current user as read
    const unreadMessages = messagesToMark.filter(
      (msg) => msg.senderId !== user?.id && !msg.message_read_status?.some((rs) => rs.userId === user?.id)
    );

    for (const message of unreadMessages) {
      try {
        await apiService.markMessageAsRead(message.id);
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    const textToSend = messageText.trim();
    const parentId = replyingTo?.id;

    setMessageText("");
    setReplyingTo(null);

    try {
      setIsSending(true);
      const response = await apiService.sendMessage(threadId, textToSend, parentId);
      if (response.success) {
        // If it's a reply, update the parent message's replies
        if (parentId) {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === parentId) {
                // Check if reply already exists
                const replyExists = msg.replies?.some(r => r.id === response.data.message.id);
                if (replyExists) {
                  return msg;
                }

                return {
                  ...msg,
                  replies: [...(msg.replies || []), response.data.message],
                  _count: {
                    replies: (msg._count?.replies || 0) + 1,
                  },
                };
              }
              return msg;
            })
          );
        } else {
          // Add the new message to the list only if it doesn't exist
          setMessages((prev) => {
            const exists = prev.some(m => m.id === response.data.message.id);
            if (exists) {
              return prev;
            }
            return [...prev, response.data.message];
          });
        }

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
      if (parentId) {
        const parentMessage = messages.find((m) => m.id === parentId);
        if (parentMessage) setReplyingTo(parentMessage);
      }
    } finally {
      setIsSending(false);
    }
  };

  const toggleThreadExpanded = (messageId: string) => {
    setExpandedThreads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageStatusIcon = (message: Message) => {
    if (message.senderId !== user?.id) return null;

    if (message.status === "SEEN") {
      return <Feather name="check-circle" size={14} color="rgba(255, 255, 255, 0.9)" />;
    } else {
      return <Feather name="check" size={14} color="rgba(255, 255, 255, 0.7)" />;
    }
  };

  const renderReply = (reply: Message, isMyMessage: boolean) => {
    return (
      <View
        key={reply.id}
        style={[
          styles.replyBubble,
          isMyMessage ? styles.myReplyBubble : styles.theirReplyBubble,
        ]}
      >
        <Text
          style={[
            styles.replyText,
            isMyMessage ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {reply.content}
        </Text>
        <View style={styles.replyFooter}>
          <Text
            style={[
              styles.replyTime,
              isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
            ]}
          >
            {formatMessageTime(reply.createdAt)}
          </Text>
          {isMyMessage && <View style={styles.statusIcon}>{getMessageStatusIcon(reply)}</View>}
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === user?.id;
    const hasReplies = (item._count?.replies || 0) > 0;
    const isExpanded = expandedThreads.has(item.id);

    // Debug logging
    console.log('Message:', {
      id: item.id,
      senderId: item.senderId,
      userId: user?.id,
      isMyMessage,
      content: item.content.substring(0, 20)
    });

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        <TouchableOpacity
          onLongPress={() => setReplyingTo(item)}
          activeOpacity={0.8}
        >
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
            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
                ]}
              >
                {formatMessageTime(item.createdAt)}
              </Text>
              {isMyMessage && <View style={styles.statusIcon}>{getMessageStatusIcon(item)}</View>}
            </View>
          </View>
        </TouchableOpacity>

        {/* Thread replies */}
        {hasReplies && (
          <View style={styles.threadContainer}>
            <TouchableOpacity
              style={styles.threadButton}
              onPress={() => toggleThreadExpanded(item.id)}
            >
              <Feather
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color="#666"
              />
              <Text style={styles.threadButtonText}>
                {item._count?.replies} {item._count?.replies === 1 ? "reply" : "replies"}
              </Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.repliesContainer}>
                {item.replies?.map((reply) => renderReply(reply, reply.senderId === user?.id))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderReplyingToBar = () => {
    if (!replyingTo) return null;

    return (
      <View style={styles.replyingToBar}>
        <View style={styles.replyingToContent}>
          <Feather name="corner-up-left" size={16} color="#666" />
          <View style={styles.replyingToText}>
            <Text style={styles.replyingToLabel}>Replying to</Text>
            <Text style={styles.replyingToMessage} numberOfLines={1}>
              {replyingTo.content}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setReplyingTo(null)}>
          <Feather name="x" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.fullscreen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#003366" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{participantName}</Text>
          </View>
        </View>

        {/* Messages List */}
        {isLoading ? (
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
              <View style={styles.emptyContainer}>
                <Feather name="message-circle" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>
                  Start the conversation by sending a message
                </Text>
              </View>
            }
          />
        )}

        {/* Replying To Bar */}
        {renderReplyingToBar()}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            placeholderTextColor="#999"
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
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 44,
    paddingBottom: Platform.OS === "android" ? 0 : 34,
  },
  container: {
    flex: 1,
    backgroundColor: "#E8EAED",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003366",
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
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
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
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  theirMessageTime: {
    color: "#999",
  },
  statusIcon: {
    marginLeft: 4,
  },
  threadContainer: {
    marginTop: 8,
    marginLeft: 12,
  },
  threadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  threadButtonText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  repliesContainer: {
    marginTop: 8,
    gap: 8,
  },
  replyBubble: {
    maxWidth: "90%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 3,
  },
  myReplyBubble: {
    backgroundColor: "#004080",
    borderLeftColor: "#0066cc",
  },
  theirReplyBubble: {
    backgroundColor: "#f5f5f5",
    borderLeftColor: "#ccc",
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  replyFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  replyTime: {
    fontSize: 10,
  },
  replyingToBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  replyingToContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  replyingToText: {
    flex: 1,
  },
  replyingToLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  replyingToMessage: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
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
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
});

export default ChatScreen;
