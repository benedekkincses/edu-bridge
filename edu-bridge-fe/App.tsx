import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import HelloScreen from "./src/screens/HelloScreen";
import UsersScreen from "./src/screens/UsersScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Edu Bridge" }}
        />
        <Stack.Screen
          name="Hello"
          component={HelloScreen}
          options={{ title: "Hello API" }}
        />
        <Stack.Screen
          name="Users"
          component={UsersScreen}
          options={{ title: "Users" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
