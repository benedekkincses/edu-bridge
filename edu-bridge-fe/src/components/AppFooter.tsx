import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export type AppRoute = "News" | "Class" | "Messages" | "Calendar";

interface AppFooterProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const AppFooter: React.FC<AppFooterProps> = ({ currentRoute, onNavigate }) => {
  const menuItems: { route: AppRoute; icon: string; label: string }[] = [
    { route: "News", icon: "📰", label: "News" },
    { route: "Class", icon: "🎓", label: "Class" },
    { route: "Messages", icon: "💬", label: "Messages" },
    { route: "Calendar", icon: "📅", label: "Calendar" },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.menuItem}
          onPress={() => onNavigate(item.route)}
        >
          <Text
            style={[
              styles.menuIcon,
              currentRoute === item.route && styles.menuIconActive,
            ]}
          >
            {item.icon}
          </Text>
          <Text
            style={[
              styles.menuLabel,
              currentRoute === item.route && styles.menuLabelActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
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
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  menuIconActive: {
    opacity: 1,
  },
  menuLabel: {
    fontSize: 12,
    color: "#666",
  },
  menuLabelActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default AppFooter;
