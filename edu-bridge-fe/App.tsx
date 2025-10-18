import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { SchoolProvider, useSchool } from "./src/contexts/SchoolContext";
import MainLayout from "./src/components/MainLayout";
import LoginScreen from "./src/screens/LoginScreen";
import SchoolSelectorScreen from "./src/screens/SchoolSelectorScreen";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    schools,
    selectedSchool,
    isLoadingSchools,
    selectSchool,
  } = useSchool();

  if (isAuthLoading || (isAuthenticated && isLoadingSchools)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login" }}
          />
        ) : schools.length > 1 && !selectedSchool ? (
          <Stack.Screen
            name="SchoolSelector"
            options={{ title: "Select School" }}
          >
            {() => (
              <SchoolSelectorScreen
                schools={schools}
                isLoading={isLoadingSchools}
                onSelectSchool={selectSchool}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen
            name="Main"
            component={MainLayout}
            options={{ title: "Main" }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <AppNavigator />
      </SchoolProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
