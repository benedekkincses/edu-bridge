import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalization } from "../contexts/LocalizationContext";
import { Language } from "../locales";

interface LanguageSelectorProps {
  style?: any;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { language, setLanguage, t } = useLocalization();
  const [showModal, setShowModal] = useState(false);

  const languages: { code: Language; name: string }[] = [
    { code: "en", name: t("languages.en") },
    { code: "hu", name: t("languages.hu") },
  ];

  const handleLanguageSelect = async (lang: Language) => {
    await setLanguage(lang);
    setShowModal(false);
  };

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowModal(true)}
      >
        <Feather name="globe" size={20} color="#003366" />
        <Text style={styles.selectorText}>
          {languages.find((l) => l.code === language)?.name}
        </Text>
        <Feather name="chevron-down" size={16} color="#003366" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("login.selectLanguage")}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {languages.map((lang, index, array) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.languageOptionSelected,
                  index === array.length - 1 && styles.languageOptionLast,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectorText: {
    fontSize: 16,
    color: "#003366",
    fontWeight: "500",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
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

export default LanguageSelector;
