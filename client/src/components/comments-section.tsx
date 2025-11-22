import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addComment, subscribeToComments, likeComment, Comment } from '@/lib/firestore-utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentsSectionProps {
  animeId: string;
  episodeId: string;
}

export default function CommentsSection({ animeId, episodeId }: CommentsSectionProps) {
  const { currentUser, userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const unsubscribe = subscribeToComments(animeId, episodeId, (updatedComments) => {
      setComments(updatedComments);
    });

    return () => unsubscribe();
  }, [animeId, episodeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile || !newComment.trim()) return;

    setLoading(true);
    try {
      await addComment(
        animeId,
        episodeId,
        currentUser.uid,
        userProfile.username,
        userProfile.avatarUrl,
        newComment,
        replyTo || undefined
      );
      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await likeComment(animeId, episodeId, commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>

      <div className="space-y-4">
        {comments.filter(comment => !mutedUsers.includes(comment.userId)).map((comment) => (
          <div
            key={comment.id}
            className={`p-4 rounded-lg bg-card border ${comment.replyTo ? 'ml-12' : ''}`}
          >
            <div className="flex items-start gap-3">
              <Avatar 
                className="h-8 w-8 cursor-pointer hover:ring-2 ring-primary transition-all"
                onClick={() => window.location.href = `/profile/${comment.username}`}
              >
                <AvatarImage src={comment.avatarUrl} />
                <AvatarFallback>{comment.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span 
                    className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
                    onClick={() => window.location.href = `/profile/${comment.username}`}
                  >
                    {comment.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comment.timestamp?.toDate?.() || new Date(), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-sm">{comment.text}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(comment.id)}
                    className="text-xs"
                  >
                    <Heart className="mr-1 h-3 w-3" />
                    {comment.likes}
                  </Button>
                  {currentUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyTo(comment.id)}
                      className="text-xs"
                    >
                      <Reply className="mr-1 h-3 w-3" />
                      Reply
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {replyTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Replying to comment
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={loading || !newComment.trim()}>
            {loading ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <div className="text-center py-8 text-muted-foreground mt-6">
          Please sign in to comment
        </div>
      )}
    </div>
  );
}