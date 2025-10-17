import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { apiService, User, UsersResponse } from "../services/apiService";

type RootStackParamList = {
  Home: undefined;
  Hello: undefined;
  Users: undefined;
};

type UsersScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Users"
>;

interface Props {
  navigation: UsersScreenNavigationProp;
}

export default function UsersScreen({ navigation }: Props) {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getUsers();
      setData(response);
    } catch (err) {
      setError("Failed to fetch users from API");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserById = async (id: number) => {
    try {
      const response = await apiService.getUserById(id);
      Alert.alert(
        "User Details",
        `Name: ${response.user.name}\nEmail: ${response.user.email}\nRole: ${response.user.role}`,
        [{ text: "OK" }]
      );
    } catch (err) {
      Alert.alert("Error", "Failed to fetch user details");
      console.error("API Error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => fetchUserById(item.id)}
    >
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      <Text style={styles.userRole}>{item.role}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Users List</Text>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {data && !loading && (
          <View style={styles.dataContainer}>
            <Text style={styles.countText}>Total Users: {data.count}</Text>
            <FlatList
              data={data.users}
              renderItem={renderUser}
              keyExtractor={(item) => item.id.toString()}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchUsers}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  dataContainer: {
    flex: 1,
    marginBottom: 20,
  },
  countText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  list: {
    flex: 1,
  },
  userCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  userRole: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
  },
  refreshButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#8E8E93",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
