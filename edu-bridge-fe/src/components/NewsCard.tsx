import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalization } from "../contexts/LocalizationContext";

interface PollOption {
  id: string;
  optionText: string;
  voteCount: number;
  hasVoted: boolean;
}

interface NewsPost {
  id: string;
  authorId: string;
  type: "announcement" | "poll";
  title: string;
  content: string;
  publishedAt: string;
  likeCount: number;
  isLikedByUser: boolean;
  pollOptions?: PollOption[];
}

interface NewsCardProps {
  newsPost: NewsPost;
  onLike: (newsPostId: string) => void;
  onVote: (pollOptionId: string) => void;
  onDelete?: (newsPostId: string) => void;
  canDelete?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({
  newsPost,
  onLike,
  onVote,
  onDelete,
  canDelete,
}) => {
  const { t } = useLocalization();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTotalVotes = () => {
    if (!newsPost.pollOptions) return 0;
    return newsPost.pollOptions.reduce((sum, option) => sum + option.voteCount, 0);
  };

  const getVotePercentage = (voteCount: number) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round((voteCount / total) * 100);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <View
            style={[
              styles.typeBadge,
              newsPost.type === "announcement"
                ? styles.announcementBadge
                : styles.pollBadge,
            ]}
          >
            <Feather
              name={newsPost.type === "announcement" ? "bell" : "bar-chart-2"}
              size={14}
              color="#fff"
            />
            <Text style={styles.typeText}>
              {newsPost.type === "announcement"
                ? t("news.announcement")
                : t("news.poll")}
            </Text>
          </View>
          <Text style={styles.timestamp}>{formatDate(newsPost.publishedAt)}</Text>
        </View>
        {canDelete && onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(newsPost.id)}
            style={styles.deleteButton}
          >
            <Feather name="trash-2" size={18} color="#e74c3c" />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{newsPost.title}</Text>

      {/* Content */}
      {newsPost.type === "announcement" && (
        <Text style={styles.content}>{newsPost.content}</Text>
      )}

      {/* Poll Options */}
      {newsPost.type === "poll" && newsPost.pollOptions && (
        <View style={styles.pollContainer}>
          {newsPost.content && (
            <Text style={styles.pollDescription}>{newsPost.content}</Text>
          )}
          {newsPost.pollOptions.map((option) => {
            const percentage = getVotePercentage(option.voteCount);
            const hasVoted = option.hasVoted;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.pollOption,
                  hasVoted && styles.pollOptionVoted,
                ]}
                onPress={() => onVote(option.id)}
              >
                <View style={styles.pollOptionContent}>
                  <Text
                    style={[
                      styles.pollOptionText,
                      hasVoted && styles.pollOptionTextVoted,
                    ]}
                  >
                    {option.optionText}
                  </Text>
                  <Text style={styles.pollPercentage}>{percentage}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[styles.progressBar, { width: `${percentage}%` }]}
                  />
                </View>
                <Text style={styles.pollVoteCount}>
                  {option.voteCount} {t("news.votes")}
                </Text>
              </TouchableOpacity>
            );
          })}
          <Text style={styles.totalVotes}>
            {getTotalVotes()} {t("news.votes")} total
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, newsPost.isLikedByUser && styles.liked]}
          onPress={() => onLike(newsPost.id)}
        >
          <Feather
            name="heart"
            size={20}
            color={newsPost.isLikedByUser ? "#e74c3c" : "#666"}
            style={newsPost.isLikedByUser ? { fill: "#e74c3c" } : {}}
          />
          <Text
            style={[
              styles.actionText,
              newsPost.isLikedByUser && styles.likedText,
            ]}
          >
            {newsPost.likeCount} {t("news.likes")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  announcementBadge: {
    backgroundColor: "#3498db",
  },
  pollBadge: {
    backgroundColor: "#9b59b6",
  },
  typeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  pollContainer: {
    marginTop: 8,
  },
  pollDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  pollOption: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pollOptionVoted: {
    borderColor: "#9b59b6",
    backgroundColor: "#f3e5f9",
  },
  pollOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  pollOptionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  pollOptionTextVoted: {
    fontWeight: "700",
    color: "#9b59b6",
  },
  pollPercentage: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9b59b6",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#9b59b6",
  },
  pollVoteCount: {
    fontSize: 11,
    color: "#999",
  },
  totalVotes: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liked: {},
  actionText: {
    fontSize: 14,
    color: "#666",
  },
  likedText: {
    color: "#e74c3c",
    fontWeight: "600",
  },
});

export default NewsCard;
