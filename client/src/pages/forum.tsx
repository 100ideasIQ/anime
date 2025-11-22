import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { SEO } from "@/components/seo";
import {
  getForumPosts,
  searchForumPosts,
  createForumPost,
  ForumPost,
} from "@/lib/firestore-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  MessageSquare,
  Eye,
  Heart,
  TrendingUp,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const CATEGORIES = [
  {
    id: "all",
    name: "All Posts",
    color: "bg-gradient-to-r from-gray-500 to-gray-600",
    icon: "💬",
  },
  {
    id: "discussions",
    name: "Discussions",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    icon: "💭",
  },
  {
    id: "bug-reports",
    name: "Bug Reports",
    color: "bg-gradient-to-r from-red-500 to-red-600",
    icon: "🐛",
  },
  {
    id: "suggestions",
    name: "Suggestions",
    color: "bg-gradient-to-r from-green-500 to-green-600",
    icon: "💡",
  },
  {
    id: "feedbacks",
    name: "Feedbacks",
    color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    icon: "⭐",
  },
  {
    id: "off-topic",
    name: "Off Topic",
    color: "bg-gradient-to-r from-purple-500 to-purple-600",
    icon: "🎉",
  },
  {
    id: "help",
    name: "Help",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
    icon: "🆘",
  },
];

export default function Forum() {
  const { currentUser, userProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Create post form
  const [newPostCategory, setNewPostCategory] = useState("discussions");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedCategory, searchQuery]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await getForumPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = async () => {
    let filtered = posts;

    if (selectedCategory !== "all") {
      filtered = posts.filter((post) => post.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const searched = await searchForumPosts(searchQuery);
      const searchedIds = new Set(searched.map((p) => p.id));
      filtered = filtered.filter((post) => searchedIds.has(post.id));
    }

    setFilteredPosts(filtered);
  };

  const handleCreatePost = async () => {
    if (
      !currentUser ||
      !userProfile ||
      !newPostTitle.trim() ||
      !newPostContent.trim()
    )
      return;

    setSubmitting(true);
    try {
      await createForumPost(
        currentUser.uid,
        userProfile.username,
        userProfile.avatarUrl,
        newPostCategory,
        newPostTitle,
        newPostContent,
      );

      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("discussions");
      setShowCreateDialog(false);
      await loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.color || "bg-gray-500";
  };

  const getCategoryName = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Anime Forum - Anime Discussions & Updates"
        description="Join the AnimeBite community forum. Discuss anime, share recommendations, get help, and connect with fellow anime fans."
        keywords="anime forum, anime community, anime discussions, anime chat, anime recommendations"
        url="https://animebite.cc/forum"
      />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-3">
                  <MessagesSquare className="w-10 h-10 text-primary" />
                  Community Forum
                </h1>
                <p className="text-muted-foreground text-lg">
                  Share ideas, get help, and connect with fellow anime
                  enthusiasts
                </p>
              </motion.div>

              {currentUser && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Dialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="gap-2 shadow-lg hover:shadow-xl transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Create Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Post</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Category
                          </label>
                          <Select
                            value={newPostCategory}
                            onValueChange={setNewPostCategory}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.filter((c) => c.id !== "all").map(
                                (category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Title
                          </label>
                          <Input
                            placeholder="Enter post title..."
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                            maxLength={200}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Content
                          </label>
                          <Textarea
                            placeholder="Write your post content..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="min-h-[200px]"
                            maxLength={5000}
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                            disabled={submitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreatePost}
                            disabled={
                              submitting ||
                              !newPostTitle.trim() ||
                              !newPostContent.trim()
                            }
                          >
                            {submitting ? "Posting..." : "Post"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              )}
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="relative mb-8"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search posts by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base shadow-sm border-2 focus:border-primary/50 transition-all"
              />
            </motion.div>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {CATEGORIES.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                    selectedCategory === category.id
                      ? `${category.color} text-white shadow-lg scale-105`
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Posts */}
          {!currentUser && (
            <Card className="mb-6">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Sign in to create posts and participate in discussions
                </p>
                <Button onClick={() => setLocation("/auth/login")}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
              <p className="text-muted-foreground text-lg font-medium">
                Loading posts...
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center">
                <Sparkles className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Posts Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Be the first to start a discussion!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    onClick={() => {
                      setLocation(`/forum/post/${post.id}`);
                    }}
                    className="cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all duration-300 border-2 overflow-hidden group"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-5">
                        <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                          <AvatarImage src={post.avatarUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                            {post.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge
                              className={`${getCategoryColor(post.category)} text-white border-0 px-3 py-1 shadow-sm`}
                            >
                              {getCategoryName(post.category)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              by{" "}
                              <span className="font-semibold text-foreground hover:text-primary transition-colors">
                                {post.username}
                              </span>
                            </span>
                            <span className="text-sm text-muted-foreground">
                              •
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {post.createdAt &&
                                formatDistanceToNow(post.createdAt.toDate(), {
                                  addSuffix: true,
                                })}
                            </span>
                          </div>

                          <h3 className="text-xl md:text-2xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                            {post.content}
                          </p>

                          <Separator className="my-4" />

                          <div className="flex flex-wrap items-center gap-5 text-sm font-medium">
                            <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                              <Eye className="w-4 h-4" />
                              <span>{post.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                              <MessageSquare className="w-4 h-4" />
                              <span>{post.replies || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes || 0}</span>
                            </div>
                            {post.reactions &&
                              Object.keys(post.reactions).length > 0 && (
                                <div className="flex items-center gap-2 ml-auto">
                                  {Object.entries(post.reactions)
                                    .slice(0, 3)
                                    .map(([emoji, users]) => (
                                      <span
                                        key={emoji}
                                        className="text-base bg-secondary/50 px-2 py-1 rounded-full"
                                      >
                                        {emoji} {(users as string[]).length}
                                      </span>
                                    ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
