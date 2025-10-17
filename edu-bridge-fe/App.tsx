import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import MainLayout from "./src/components/MainLayout";
import LoginScreen from "./src/screens/LoginScreen";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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
      <Stack.Navigator>
        {isAuthenticated ? (
          // Authenticated screens - Use MainLayout
          <Stack.Screen
            name="Main"
            component={MainLayout}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          // Unauthenticated screens
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: "Login",
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
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
