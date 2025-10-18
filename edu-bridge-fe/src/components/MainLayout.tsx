import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import AppHeader from "./AppHeader";
import AppFooter, { AppRoute } from "./AppFooter";
import NewsPage from "../screens/NewsPage";
import ClassPage from "../screens/ClassPage";
import MessagesPage from "../screens/MessagesPage";
import CalendarPage from "../screens/CalendarPage";
import ProfilePage from "../screens/ProfilePage";

const Stack = createStackNavigator();

const MainContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>("News");

  const renderContent = () => {
    switch (currentRoute) {
      case "News":
        return <NewsPage />;
      case "Class":
        return <ClassPage />;
      case "Messages":
        return <MessagesPage />;
      case "Calendar":
        return <CalendarPage />;
      default:
        return <NewsPage />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppHeader />
        <View style={styles.mainContent}>{renderContent()}</View>
        <AppFooter currentRoute={currentRoute} onNavigate={setCurrentRoute} />
      </View>
    </SafeAreaView>
  );
};

const MainLayout: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainContent" component={MainContent} />
      <Stack.Screen name="Profile" component={ProfilePage} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});

export default MainLayout;
