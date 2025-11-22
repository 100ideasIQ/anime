import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import {
  getForumPost,
  getForumReplies,
  incrementForumPostViews,
  likeForumPost,
  reactToForumPost,
  addForumReply,
  likeForumReply,
  reactToForumReply,
  ForumPost,
  ForumReply
} from '@/lib/firestore-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Heart, MessageSquare, Eye, ThumbsUp, Send, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '🤔', '😮', '🔥', '💯'];

const CATEGORIES = [
  { id: 'discussions', name: 'Discussions', color: 'bg-blue-500', textColor: 'text-blue-500' },
  { id: 'bug-reports', name: 'Bug Reports', color: 'bg-red-500', textColor: 'text-red-500' },
  { id: 'suggestions', name: 'Suggestions', color: 'bg-green-500', textColor: 'text-green-500' },
  { id: 'feedbacks', name: 'Feedbacks', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  { id: 'off-topic', name: 'Off Topic', color: 'bg-purple-500', textColor: 'text-purple-500' },
  { id: 'help', name: 'Help', color: 'bg-orange-500', textColor: 'text-orange-500' }
];

export default function ForumPostPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { currentUser, userProfile } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [likedByUser, setLikedByUser] = useState(false);
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      loadPost();
    } else {
      setError('No post ID provided');
      setLoading(false);
    }
  }, [id]);

  const loadPost = async () => {
    if (!id) {
      setError('Invalid post ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchedPost = await getForumPost(id);

      if (fetchedPost) {
        setPost(fetchedPost);
        
        // Check if current user has liked the post
        if (currentUser && fetchedPost.likedBy) {
          setLikedByUser(fetchedPost.likedBy.includes(currentUser.uid));
        }
        
        await incrementForumPostViews(id);
        const fetchedReplies = await getForumReplies(id);
        setReplies(fetchedReplies);
        
        // Track which replies the user has liked
        if (currentUser) {
          const userLikedReplies = new Set<string>();
          fetchedReplies.forEach(reply => {
            if (reply.likedBy && reply.likedBy.includes(currentUser.uid)) {
              userLikedReplies.add(reply.id);
            }
          });
          setLikedReplies(userLikedReplies);
        }
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async () => {
    if (!id || !currentUser) return;
    
    // Optimistically update UI
    setLikedByUser(!likedByUser);
    
    await likeForumPost(id, currentUser.uid);
    await loadPost();
  };

  const handleReactToPost = async (emoji: string) => {
    if (!id || !currentUser) return;
    await reactToForumPost(id, currentUser.uid, emoji);
    setShowReactions(null);
    await loadPost();
  };

  const handleAddReply = async () => {
    if (!id || !currentUser || !userProfile || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      await addForumReply(id, currentUser.uid, userProfile.username, userProfile.avatarUrl, replyContent);
      setReplyContent('');
      await loadPost();
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReply = async (replyId: string) => {
    if (!id || !currentUser) return;
    
    // Optimistically update UI
    setLikedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
      }
      return newSet;
    });
    
    await likeForumReply(id, replyId, currentUser.uid);
    await loadPost();
  };

  const handleReactToReply = async (replyId: string, emoji: string) => {
    if (!id || !currentUser) return;
    await reactToForumReply(id, replyId, currentUser.uid, emoji);
    setShowReactions(null);
    await loadPost();
  };

  const getCategoryColor = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId)?.color || 'bg-gray-500';
  };

  const getCategoryName = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground text-lg font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {error ? 'Error Loading Post' : 'Post Not Found'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {error || 'This post may have been deleted or the link is incorrect.'}
              </p>
            </div>
            <Button onClick={() => setLocation('/forum')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forum
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/forum')} 
          className="mb-6 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forum
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Main Post Card */}
          <Card className="mb-8 overflow-hidden border-2 shadow-lg">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b">
                <div className="flex items-start gap-4">
                  <Avatar 
                    className="h-14 w-14 flex-shrink-0 cursor-pointer ring-2 ring-primary/20 transition-all hover:ring-primary/40" 
                    onClick={() => setLocation(`/profile/${post.username}`)}
                  >
                    <AvatarImage src={post.avatarUrl} />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {post.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge 
                        className={`${getCategoryColor(post.category)} text-white border-0 px-3 py-1`}
                      >
                        {getCategoryName(post.category)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        by{' '}
                        <span 
                          className="font-semibold cursor-pointer hover:underline hover:text-primary transition-colors" 
                          onClick={() => setLocation(`/profile/${post.username}`)}
                        >
                          {post.username}
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {post.createdAt && formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
                      </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                      {post.title}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap mb-6">
                  {post.content}
                </p>

                <Separator className="my-6" />

                {/* Post Stats and Actions */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{post.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.replies || 0}</span>
                  </div>

                  {currentUser && (
                    <>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant={likedByUser ? "default" : "outline"} 
                          size="sm" 
                          onClick={handleLikePost} 
                          className="gap-2"
                        >
                          <Heart className={`w-4 h-4 ${likedByUser ? 'fill-current' : ''}`} />
                          {post.likes || 0}
                        </Button>
                      </motion.div>

                      <div className="relative">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReactions(showReactions === 'post' ? null : 'post');
                          }}
                          className="gap-2"
                        >
                          React
                        </Button>
                        <AnimatePresence>
                          {showReactions === 'post' && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="fixed md:absolute top-1/2 left-1/2 md:top-full md:left-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 md:mt-2 bg-popover border border-border rounded-xl p-3 shadow-2xl z-[9999] flex gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {REACTION_EMOJIS.map(emoji => (
                                <motion.button
                                  key={emoji}
                                  whileHover={{ scale: 1.3 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReactToPost(emoji);
                                  }}
                                  className="text-2xl hover:bg-accent rounded-lg p-2 transition-colors"
                                >
                                  {emoji}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}

                  {post.reactions && Object.keys(post.reactions).length > 0 && (
                    <div className="flex items-center gap-2 ml-auto flex-wrap">
                      {Object.entries(post.reactions).map(([emoji, users]) => (
                        <span 
                          key={emoji} 
                          className="text-sm bg-secondary/50 backdrop-blur px-3 py-1.5 rounded-full font-medium border border-border/50"
                        >
                          {emoji} {(users as string[]).length}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Replies Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
              </h2>
            </div>

            {replies.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No replies yet. Be the first to share your thoughts!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {replies.map((reply, index) => (
                  <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow border">
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          <Avatar 
                            className="h-10 w-10 flex-shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all" 
                            onClick={() => setLocation(`/profile/${reply.username}`)}
                          >
                            <AvatarImage src={reply.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {reply.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span 
                                className="font-semibold cursor-pointer hover:underline hover:text-primary transition-colors" 
                                onClick={() => setLocation(`/profile/${reply.username}`)}
                              >
                                {reply.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {reply.createdAt && formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true })}
                              </span>
                            </div>

                            <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-3">
                              {reply.content}
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                              {currentUser && (
                                <>
                                  <motion.div whileTap={{ scale: 0.95 }}>
                                    <Button 
                                      variant={likedReplies.has(reply.id) ? "default" : "ghost"}
                                      size="sm" 
                                      onClick={() => handleLikeReply(reply.id)} 
                                      className="gap-1.5 h-8 text-xs"
                                    >
                                      <ThumbsUp className={`w-3.5 h-3.5 ${likedReplies.has(reply.id) ? 'fill-current' : ''}`} />
                                      {reply.likes || 0}
                                    </Button>
                                  </motion.div>

                                  <div className="relative">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowReactions(showReactions === reply.id ? null : reply.id);
                                      }}
                                      className="h-8 text-xs"
                                    >
                                      React
                                    </Button>
                                    <AnimatePresence>
                                      {showReactions === reply.id && (
                                        <motion.div 
                                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                          transition={{ duration: 0.2 }}
                                          className="fixed md:absolute top-1/2 left-1/2 md:top-full md:left-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 md:mt-2 bg-popover border border-border rounded-xl p-2 shadow-2xl z-[9999] flex gap-1"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {REACTION_EMOJIS.map(emoji => (
                                            <motion.button
                                              key={emoji}
                                              whileHover={{ scale: 1.25 }}
                                              whileTap={{ scale: 0.9 }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleReactToReply(reply.id, emoji);
                                              }}
                                              className="text-xl hover:bg-accent rounded-lg p-1.5 transition-colors"
                                            >
                                              {emoji}
                                            </motion.button>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </>
                              )}

                              {reply.reactions && Object.keys(reply.reactions).length > 0 && (
                                <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                                  {Object.entries(reply.reactions).map(([emoji, users]) => (
                                    <span 
                                      key={emoji} 
                                      className="text-xs bg-secondary/50 px-2 py-1 rounded-full font-medium"
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

          {/* Reply Form */}
          {currentUser ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="shadow-lg border-2">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    Add Your Reply
                  </h3>
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={replyContent}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value.includes('http://') && !value.includes('https://')) {
                        setReplyContent(value);
                      }
                    }}
                    className="mb-4 min-h-[140px] resize-none focus:ring-2 focus:ring-primary/20"
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {replyContent.length}/2000 characters
                    </span>
                    <Button 
                      onClick={handleAddReply}
                      disabled={submitting || !replyContent.trim()}
                      className="gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent"></div>
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Post Reply
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="shadow-lg border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Join the Discussion</h3>
                <p className="text-muted-foreground mb-6">
                  Sign in to reply to this post and engage with the community
                </p>
                <Button onClick={() => setLocation('/auth/login')} size="lg" className="gap-2">
                  Sign In to Reply
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}