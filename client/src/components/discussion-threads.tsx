import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addThread, getThreads, voteThread, getUserThreadVote, addThreadReply, getThreadReplies, Thread, ThreadReply } from '@/lib/firestore-utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DiscussionThreadsProps {
  animeId: string;
  animeTitle: string;
}

interface ThreadWithReplies extends Thread {
  replies: ThreadReply[];
  userVote: 'up' | 'down' | null;
  showReplies: boolean;
}

export default function DiscussionThreads({ animeId, animeTitle }: DiscussionThreadsProps) {
  const { currentUser, userProfile } = useAuth();
  const [threads, setThreads] = useState<ThreadWithReplies[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
  }, [animeId, currentUser]);

  const [mutedUsers, setMutedUsers] = useState<string[]>([]);

  useEffect(() => {
    const loadMutedUsers = async () => {
      if (currentUser) {
        const { getMutedUsers } = await import('@/lib/firestore-utils');
        const muted = await getMutedUsers(currentUser.uid);
        setMutedUsers(muted);
      }
    };
    loadMutedUsers();
  }, [currentUser]);

  const loadThreads = async () => {
    try {
      const fetchedThreads = await getThreads(animeId);

      // Load replies and user votes for each thread
      const threadsWithData = await Promise.all(
        fetchedThreads.map(async (thread) => {
          const replies = await getThreadReplies(animeId, thread.id);
          const userVote = currentUser
            ? await getUserThreadVote(animeId, thread.id, currentUser.uid)
            : null;

          return {
            ...thread,
            replies,
            userVote,
            showReplies: false
          };
        })
      );

      setThreads(threadsWithData);
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile || !title.trim() || !body.trim()) return;

    setLoading(true);
    try {
      await addThread(
        animeId,
        currentUser.uid,
        userProfile.username,
        userProfile.avatarUrl,
        title,
        body
      );
      setTitle('');
      setBody('');
      setShowForm(false);
      await loadThreads();
    } catch (error) {
      console.error('Error creating thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (threadId: string, voteType: 'up' | 'down') => {
    if (!currentUser) return;

    try {
      await voteThread(animeId, threadId, currentUser.uid, voteType);
      await loadThreads();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleReply = async (threadId: string) => {
    if (!currentUser || !userProfile || !replyText[threadId]?.trim()) return;

    try {
      await addThreadReply(
        animeId,
        threadId,
        currentUser.uid,
        userProfile.username,
        userProfile.avatarUrl,
        replyText[threadId]
      );

      setReplyText({ ...replyText, [threadId]: '' });
      setReplyingTo(null);
      await loadThreads();
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const toggleReplies = (threadId: string) => {
    setThreads(threads.map(thread =>
      thread.id === threadId
        ? { ...thread, showReplies: !thread.showReplies }
        : thread
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Discussions ({threads.length})</h2>
        {currentUser && !showForm && (
          <Button onClick={() => setShowForm(true)}>Start Discussion</Button>
        )}
      </div>

      <div className="space-y-4">
        {threads.filter(thread => !mutedUsers.includes(thread.userId)).map((thread) => (
          <Card key={thread.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant={thread.userVote === 'up' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleVote(thread.id, 'up')}
                    className="h-8 w-8 p-0"
                    disabled={!currentUser}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-bold">{thread.upvotes - thread.downvotes}</span>
                  <Button
                    variant={thread.userVote === 'down' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleVote(thread.id, 'down')}
                    className="h-8 w-8 p-0"
                    disabled={!currentUser}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{thread.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{thread.body}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar
                        className="cursor-pointer hover:ring-2 ring-primary transition-all"
                        onClick={() => window.location.href = `/profile/${thread.username}`}
                      >
                        <AvatarImage src={thread.avatarUrl} />
                        <AvatarFallback>{thread.username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p
                          className="font-medium cursor-pointer hover:text-primary transition-colors"
                          onClick={() => window.location.href = `/profile/${thread.username}`}
                        >
                          {thread.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {thread.createdAt && formatDistanceToNow(thread.createdAt.toDate(), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplies(thread.id)}
                      className="text-xs ml-auto"
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
                    </Button>
                  </div>

                  {thread.showReplies && (
                    <div className="space-y-3 mt-4 pl-4 border-l-2 border-muted">
                      {thread.replies.map((reply) => (
                        <div key={reply.id} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.avatarUrl} />
                              <AvatarFallback>{reply.username[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{reply.username}</span>
                                <span className="text-xs text-muted-foreground">
                                  {reply.createdAt && formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{reply.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {currentUser && (
                        <div className="flex gap-2 mt-3">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyText[thread.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [thread.id]: e.target.value })}
                            className="min-h-[80px]"
                          />
                          <Button
                            onClick={() => handleReply(thread.id)}
                            disabled={!replyText[thread.id]?.trim()}
                            size="sm"
                          >
                            Reply
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {!thread.showReplies && currentUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toggleReplies(thread.id);
                        setReplyingTo(thread.id);
                      }}
                      className="text-xs"
                    >
                      Reply to discussion
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && currentUser && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Start a Discussion about {animeTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Discussion title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="What's on your mind?"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[150px]"
                required
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !title.trim() || !body.trim()}>
                  {loading ? 'Posting...' : 'Post Discussion'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!currentUser && !showForm && (
        <div className="text-center py-8 text-muted-foreground mt-6">
          Please sign in to start a discussion
        </div>
      )}
    </div>
  );
}