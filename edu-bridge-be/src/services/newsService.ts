import { PrismaClient, NewsPostType } from "@prisma/client";

const prisma = new PrismaClient();

export const newsService = {
  /**
   * Get news posts for a school
   */
  async getSchoolNews(schoolId: string, userId: string) {
    // Get news posts for the school, ordered by publishedAt (most recent first)
    const newsPosts = await prisma.news_posts.findMany({
      where: {
        scope: "school",
        schoolId,
      },
      include: {
        news_likes: {
          select: {
            userId: true,
          },
        },
        poll_options: {
          include: {
            poll_votes: {
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                poll_votes: true,
              },
            },
          },
        },
        _count: {
          select: {
            news_likes: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    return newsPosts.map((post) => ({
      id: post.id,
      authorId: post.authorId,
      type: post.type,
      title: post.title,
      content: post.content,
      attachments: post.attachments,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      likeCount: post._count.news_likes,
      isLikedByUser: post.news_likes.some((like) => like.userId === userId),
      pollOptions:
        post.type === "poll"
          ? post.poll_options.map((option) => ({
              id: option.id,
              optionText: option.optionText,
              voteCount: option._count.poll_votes,
              hasVoted: option.poll_votes.some((vote) => vote.userId === userId),
            }))
          : undefined,
    }));
  },

  /**
   * Get news posts for a class
   */
  async getClassNews(classId: string, userId: string) {
    // Get news posts for the class, ordered by publishedAt (most recent first)
    const newsPosts = await prisma.news_posts.findMany({
      where: {
        scope: "class",
        classId,
      },
      include: {
        news_likes: {
          select: {
            userId: true,
          },
        },
        poll_options: {
          include: {
            poll_votes: {
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                poll_votes: true,
              },
            },
          },
        },
        _count: {
          select: {
            news_likes: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    return newsPosts.map((post) => ({
      id: post.id,
      authorId: post.authorId,
      type: post.type,
      title: post.title,
      content: post.content,
      attachments: post.attachments,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      likeCount: post._count.news_likes,
      isLikedByUser: post.news_likes.some((like) => like.userId === userId),
      pollOptions:
        post.type === "poll"
          ? post.poll_options.map((option) => ({
              id: option.id,
              optionText: option.optionText,
              voteCount: option._count.poll_votes,
              hasVoted: option.poll_votes.some((vote) => vote.userId === userId),
            }))
          : undefined,
    }));
  },

  /**
   * Create a news post (announcement or poll)
   */
  async createNewsPost(
    userId: string,
    scope: "school" | "class",
    schoolId: string | undefined,
    classId: string | undefined,
    type: NewsPostType,
    title: string,
    content: string,
    pollOptions?: string[],
    attachments?: any[]
  ) {
    // Validation
    if (scope === "school" && !schoolId) {
      throw new Error("School ID is required for school-scoped news");
    }
    if (scope === "class" && !classId) {
      throw new Error("Class ID is required for class-scoped news");
    }
    if (type === "poll" && (!pollOptions || pollOptions.length < 2)) {
      throw new Error("Polls must have at least 2 options");
    }

    const now = new Date();
    const newsPost = await prisma.news_posts.create({
      data: {
        id: generateId(),
        authorId: userId,
        scope,
        schoolId,
        classId,
        type,
        title,
        content,
        attachments: attachments || [],
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        ...(type === "poll" && pollOptions
          ? {
              poll_options: {
                create: pollOptions.map((optionText) => ({
                  id: generateId(),
                  optionText,
                  createdAt: now,
                })),
              },
            }
          : {}),
      },
      include: {
        poll_options: true,
      },
    });

    return {
      id: newsPost.id,
      authorId: newsPost.authorId,
      type: newsPost.type,
      title: newsPost.title,
      content: newsPost.content,
      attachments: newsPost.attachments,
      publishedAt: newsPost.publishedAt,
      createdAt: newsPost.createdAt,
      pollOptions:
        newsPost.type === "poll"
          ? newsPost.poll_options.map((option) => ({
              id: option.id,
              optionText: option.optionText,
              voteCount: 0,
              hasVoted: false,
            }))
          : undefined,
      likeCount: 0,
      isLikedByUser: false,
    };
  },

  /**
   * Toggle like on a news post
   */
  async toggleLike(newsPostId: string, userId: string) {
    // Check if news post exists
    const newsPost = await prisma.news_posts.findUnique({
      where: { id: newsPostId },
    });

    if (!newsPost) {
      throw new Error("News post not found");
    }

    // Check if user has already liked the post
    const existingLike = await prisma.news_likes.findUnique({
      where: {
        newsPostId_userId: {
          newsPostId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.news_likes.delete({
        where: {
          id: existingLike.id,
        },
      });
      return { liked: false };
    } else {
      // Like
      await prisma.news_likes.create({
        data: {
          id: generateId(),
          newsPostId,
          userId,
          createdAt: new Date(),
        },
      });
      return { liked: true };
    }
  },

  /**
   * Vote on a poll option
   */
  async voteOnPoll(pollOptionId: string, userId: string) {
    // Get the poll option and news post
    const pollOption = await prisma.poll_options.findUnique({
      where: { id: pollOptionId },
      include: {
        news_posts: {
          select: {
            id: true,
            type: true,
          },
        },
      },
    });

    if (!pollOption) {
      throw new Error("Poll option not found");
    }

    if (pollOption.news_posts.type !== "poll") {
      throw new Error("This news post is not a poll");
    }

    // Check if user has already voted on any option in this poll
    const existingVote = await prisma.poll_votes.findFirst({
      where: {
        poll_options: {
          newsPostId: pollOption.newsPostId,
        },
        userId,
      },
      include: {
        poll_options: true,
      },
    });

    if (existingVote) {
      // If voting for the same option, remove the vote
      if (existingVote.pollOptionId === pollOptionId) {
        await prisma.poll_votes.delete({
          where: { id: existingVote.id },
        });
        return { voted: false, message: "Vote removed" };
      } else {
        // Change vote to new option
        await prisma.poll_votes.update({
          where: { id: existingVote.id },
          data: {
            pollOptionId,
          },
        });
        return { voted: true, message: "Vote changed" };
      }
    } else {
      // Create new vote
      await prisma.poll_votes.create({
        data: {
          id: generateId(),
          pollOptionId,
          userId,
          createdAt: new Date(),
        },
      });
      return { voted: true, message: "Vote recorded" };
    }
  },

  /**
   * Delete a news post
   */
  async deleteNewsPost(newsPostId: string, userId: string) {
    const newsPost = await prisma.news_posts.findUnique({
      where: { id: newsPostId },
    });

    if (!newsPost) {
      throw new Error("News post not found");
    }

    // Only the author can delete their post
    if (newsPost.authorId !== userId) {
      throw new Error("You can only delete your own news posts");
    }

    await prisma.news_posts.delete({
      where: { id: newsPostId },
    });

    return { success: true, message: "News post deleted successfully" };
  },

  /**
   * Check if user can post news to a school
   */
  async canPostToSchool(userId: string, schoolId: string): Promise<boolean> {
    // Check if user is a school admin
    const isAdmin = await prisma.school_admins.findFirst({
      where: {
        userId,
        schoolId,
      },
    });

    if (isAdmin) return true;

    // Check for post_news permission in school_permissions
    const hasPermission = await prisma.school_permissions.findFirst({
      where: {
        userId,
        schoolId,
        permission: "post_news",
      },
    });

    return !!hasPermission;
  },

  /**
   * Check if user can post news to a class
   */
  async canPostToClass(userId: string, classId: string): Promise<boolean> {
    // Check class membership
    const membership = await prisma.class_memberships.findFirst({
      where: {
        userId,
        classId,
      },
    });

    if (!membership) return false;

    // Check if user has canPostNews flag (legacy)
    if (membership.canPostNews) return true;

    // Check for post_news permission in class_permissions
    const hasPermission = await prisma.class_permissions.findFirst({
      where: {
        userId,
        classId,
        permission: "post_news",
      },
    });

    return !!hasPermission;
  },
};

// Helper function to generate IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
