import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalization } from "../contexts/LocalizationContext";

export type AppRoute = "News" | "Class" | "Messages" | "Calendar";

interface AppFooterProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

type MenuItem = {
  route: AppRoute;
  iconName: keyof typeof Feather.glyphMap;
  label: string;
};

const AppFooter: React.FC<AppFooterProps> = ({ currentRoute, onNavigate }) => {
  const { t } = useLocalization();

  const menuItems: MenuItem[] = [
    { route: "News", iconName: "file-text", label: t("footer.news") },
    { route: "Class", iconName: "book-open", label: t("footer.class") },
    { route: "Messages", iconName: "message-circle", label: t("footer.messages") },
    { route: "Calendar", iconName: "calendar", label: t("footer.calendar") },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item) => {
        const isActive = currentRoute === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.menuItem}
            onPress={() => onNavigate(item.route)}
          >
            <Feather
              name={item.iconName}
              size={24}
              color={isActive ? "#003366" : "#999"}
              style={styles.menuIcon}
            />
            <Text
              style={[
                styles.menuLabel,
                isActive && styles.menuLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#E8EAED",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingBottom: 20,
    paddingTop: 8,
    justifyContent: "space-around",
  },
  menuItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
  },
  menuIcon: {
    marginBottom: 4,
  },
  menuLabel: {
    fontSize: 12,
    color: "#666",
  },
  menuLabelActive: {
    color: "#003366",
    fontWeight: "600",
  },
});

export default AppFooter;
