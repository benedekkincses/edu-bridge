import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalization } from "../contexts/LocalizationContext";

interface CreateNewsModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (
    type: "announcement" | "poll",
    title: string,
    content: string,
    pollOptions?: string[]
  ) => Promise<void>;
}

const CreateNewsModal: React.FC<CreateNewsModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const { t } = useLocalization();
  const [newsType, setNewsType] = useState<"announcement" | "poll" | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(1000);
    }
  }, [visible]);

  const handleClose = () => {
    setNewsType(null);
    setTitle("");
    setContent("");
    setPollOptions(["", ""]);
    setIsSubmitting(false);
    onClose();
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleCreate = async () => {
    if (!newsType) {
      Alert.alert("Error", t("news.selectNewsType"));
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (newsType === "announcement" && !content.trim()) {
      Alert.alert("Error", "Please enter content");
      return;
    }

    if (newsType === "poll") {
      const validOptions = pollOptions.filter((opt) => opt.trim() !== "");
      if (validOptions.length < 2) {
        Alert.alert("Error", t("news.atLeastTwoOptions"));
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const validOptions =
        newsType === "poll"
          ? pollOptions.filter((opt) => opt.trim() !== "")
          : undefined;
      await onCreate(newsType, title, content, validOptions);
      handleClose();
    } catch (error) {
      console.error("Error creating news:", error);
      Alert.alert("Error", t("news.createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("news.createNews")}</Text>
            <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Type Selection */}
            {!newsType ? (
              <View style={styles.typeSelection}>
                <Text style={styles.sectionTitle}>
                  {t("news.selectNewsType")}
                </Text>
                <TouchableOpacity
                  style={styles.typeOption}
                  onPress={() => setNewsType("announcement")}
                >
                  <View style={[styles.typeIcon, styles.announcementIcon]}>
                    <Feather name="bell" size={24} color="#3498db" />
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeTitle}>
                      {t("news.announcement")}
                    </Text>
                    <Text style={styles.typeDescription}>
                      Share important updates and news
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.typeOption}
                  onPress={() => setNewsType("poll")}
                >
                  <View style={[styles.typeIcon, styles.pollIcon]}>
                    <Feather name="bar-chart-2" size={24} color="#9b59b6" />
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeTitle}>{t("news.poll")}</Text>
                    <Text style={styles.typeDescription}>
                      Create a poll to gather opinions
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Back Button */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setNewsType(null)}
                  disabled={isSubmitting}
                >
                  <Feather name="arrow-left" size={20} color="#3498db" />
                  <Text style={styles.backText}>Change type</Text>
                </TouchableOpacity>

                {/* Title Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {newsType === "announcement"
                      ? t("news.announcementTitle")
                      : t("news.pollTitle")}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter title..."
                    placeholderTextColor="#999"
                    editable={!isSubmitting}
                  />
                </View>

                {/* Content Input */}
                {newsType === "announcement" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      {t("news.announcementContent")}
                    </Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={content}
                      onChangeText={setContent}
                      placeholder="Enter content..."
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                      editable={!isSubmitting}
                    />
                  </View>
                )}

                {/* Poll Description */}
                {newsType === "poll" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      {t("news.pollDescription")}
                    </Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={content}
                      onChangeText={setContent}
                      placeholder="Optional description..."
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      editable={!isSubmitting}
                    />
                  </View>
                )}

                {/* Poll Options */}
                {newsType === "poll" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Options</Text>
                    {pollOptions.map((option, index) => (
                      <View key={index} style={styles.pollOptionInput}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          value={option}
                          onChangeText={(value) =>
                            updatePollOption(index, value)
                          }
                          placeholder={`${t("news.pollOption")} ${index + 1}`}
                          placeholderTextColor="#999"
                          editable={!isSubmitting}
                        />
                        {pollOptions.length > 2 && (
                          <TouchableOpacity
                            onPress={() => removePollOption(index)}
                            style={styles.removeOptionButton}
                            disabled={isSubmitting}
                          >
                            <Feather name="x-circle" size={20} color="#e74c3c" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.addOptionButton}
                      onPress={addPollOption}
                      disabled={isSubmitting}
                    >
                      <Feather name="plus-circle" size={20} color="#3498db" />
                      <Text style={styles.addOptionText}>
                        {t("news.addOption")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer Actions */}
          {newsType && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>
                  {t("news.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.publishButton,
                  isSubmitting && styles.disabledButton,
                ]}
                onPress={handleCreate}
                disabled={isSubmitting}
              >
                <Text style={styles.publishButtonText}>
                  {isSubmitting ? "Publishing..." : t("news.publish")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  scrollContent: {
    padding: 16,
  },
  typeSelection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    gap: 12,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  announcementIcon: {
    backgroundColor: "#e3f2fd",
  },
  pollIcon: {
    backgroundColor: "#f3e5f9",
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: "#666",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    minHeight: 100,
  },
  pollOptionInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  removeOptionButton: {
    padding: 4,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    marginTop: 8,
  },
  addOptionText: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  publishButton: {
    backgroundColor: "#3498db",
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default CreateNewsModal;
