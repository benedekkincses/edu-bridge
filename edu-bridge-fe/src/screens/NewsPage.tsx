import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSchool } from "../contexts/SchoolContext";
import { useAuth } from "../contexts/AuthContext";
import NoSchoolFrame from "../components/NoSchoolFrame";
import NewsCard from "../components/NewsCard";
import CreateNewsModal from "../components/CreateNewsModal";
import { useLocalization } from "../contexts/LocalizationContext";
import { apiService } from "../services/apiService";

interface NewsPost {
  id: string;
  authorId: string;
  type: "announcement" | "poll";
  title: string;
  content: string;
  publishedAt: string;
  likeCount: number;
  isLikedByUser: boolean;
  pollOptions?: {
    id: string;
    optionText: string;
    voteCount: number;
    hasVoted: boolean;
  }[];
}

const NewsPage: React.FC = () => {
  const { schools, selectedSchool } = useSchool();
  const { user } = useAuth();
  const { t } = useLocalization();

  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canPostNews, setCanPostNews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show NoSchoolFrame if user has no schools
  if (schools.length === 0) {
    return (
      <NoSchoolFrame
        pageName={t("footer.news")}
        iconName="file-text"
        message={t("noSchool.newsFeedMessage")}
      />
    );
  }

  useEffect(() => {
    if (selectedSchool) {
      fetchNews();
      checkPostPermission();
    }
  }, [selectedSchool]);

  const fetchNews = async () => {
    if (!selectedSchool) return;

    try {
      setError(null);
      const response = await apiService.getSchoolNews(selectedSchool.id);
      if (response.success) {
        setNewsPosts(response.data);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError(t("news.error"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const checkPostPermission = async () => {
    if (!selectedSchool) return;

    try {
      const response = await apiService.checkSchoolPostPermission(selectedSchool.id);
      if (response.success) {
        setCanPostNews(response.data.canPost);
      }
    } catch (error) {
      console.error("Error checking post permission:", error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNews();
  };

  const handleCreateNews = async (
    type: "announcement" | "poll",
    title: string,
    content: string,
    pollOptions?: string[]
  ) => {
    if (!selectedSchool) return;

    try {
      const response = await apiService.createNews(
        "school",
        selectedSchool.id,
        undefined,
        type,
        title,
        content,
        pollOptions
      );

      if (response.success) {
        Alert.alert("Success", t("news.createSuccess"));
        fetchNews();
      }
    } catch (error) {
      console.error("Error creating news:", error);
      throw error;
    }
  };

  const handleLike = async (newsPostId: string) => {
    try {
      const response = await apiService.toggleNewsLike(newsPostId);
      if (response.success) {
        // Update the news post in the state
        setNewsPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === newsPostId) {
              return {
                ...post,
                isLikedByUser: response.data.liked,
                likeCount: response.data.liked
                  ? post.likeCount + 1
                  : post.likeCount - 1,
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", t("news.likeError"));
    }
  };

  const handleVote = async (pollOptionId: string) => {
    try {
      const response = await apiService.voteOnPoll(pollOptionId);
      if (response.success) {
        // Refresh news to get updated poll results
        fetchNews();
      }
    } catch (error) {
      console.error("Error voting on poll:", error);
      Alert.alert("Error", t("news.voteError"));
    }
  };

  const handleDelete = async (newsPostId: string) => {
    Alert.alert(
      t("news.deleteNews"),
      t("news.confirmDelete"),
      [
        {
          text: t("news.cancel"),
          style: "cancel",
        },
        {
          text: t("news.deleteNews"),
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiService.deleteNews(newsPostId);
              if (response.success) {
                Alert.alert("Success", t("news.deleteSuccess"));
                fetchNews();
              }
            } catch (error) {
              console.error("Error deleting news:", error);
              Alert.alert("Error", t("news.deleteError"));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t("news.title")}</Text>
              <Text style={styles.subtitle}>{t("news.subtitle")}</Text>
            </View>
          </View>

          {/* Create News Button */}
          {canPostNews && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Feather name="plus" size={20} color="#fff" />
              <Text style={styles.createButtonText}>{t("news.createNews")}</Text>
            </TouchableOpacity>
          )}

          {/* Loading State */}
          {isLoading && (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>{t("news.loading")}</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.centerContainer}>
              <Feather name="alert-circle" size={48} color="#e74c3c" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !error && newsPosts.length === 0 && (
            <View style={styles.centerContainer}>
              <Feather name="bell-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>{t("news.noNews")}</Text>
              {canPostNews && (
                <Text style={styles.emptySubtext}>
                  Be the first to share news!
                </Text>
              )}
            </View>
          )}

          {/* News Posts */}
          {!isLoading && !error && newsPosts.length > 0 && (
            <View style={styles.newsContainer}>
              {newsPosts.map((newsPost) => (
                <NewsCard
                  key={newsPost.id}
                  newsPost={newsPost}
                  onLike={handleLike}
                  onVote={handleVote}
                  onDelete={handleDelete}
                  canDelete={user?.sub === newsPost.authorId}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create News Modal */}
      <CreateNewsModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateNews}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8EAED",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    flexShrink: 1,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
  },
  newsContainer: {
    paddingBottom: 24,
  },
});

export default NewsPage;
