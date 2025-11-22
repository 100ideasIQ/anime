import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addReview, getReviews, likeReview, Review } from '@/lib/firestore-utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewsSectionProps {
  animeId: string;
  animeTitle: string;
}

export default function ReviewsSection({ animeId, animeTitle }: ReviewsSectionProps) {
  const { currentUser, userProfile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [animeId]);

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

  const loadReviews = async () => {
    try {
      const fetchedReviews = await getReviews(animeId);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile || !reviewText.trim()) return;

    setLoading(true);
    try {
      await addReview(
        animeId,
        currentUser.uid,
        userProfile.username,
        userProfile.avatarUrl,
        rating,
        reviewText
      );
      setReviewText('');
      setRating(5);
      setShowForm(false);
      await loadReviews();
    } catch (error) {
      console.error('Error posting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    try {
      await likeReview(animeId, reviewId);
      await loadReviews();
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} average rating
              </span>
            </div>
          )}
        </div>
        {currentUser && !showForm && (
          <Button onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      <div className="space-y-4">
        {reviews.filter(review => !mutedUsers.includes(review.userId)).map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Avatar 
                  className="h-12 w-12 cursor-pointer hover:ring-2 ring-primary transition-all"
                  onClick={() => window.location.href = `/profile/${review.username}`}
                >
                  <AvatarImage src={review.avatarUrl} />
                  <AvatarFallback>{review.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span 
                        className="font-semibold cursor-pointer hover:text-primary transition-colors"
                        onClick={() => window.location.href = `/profile/${review.username}`}
                      >
                        {review.username}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating / 2 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.rating}/10</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {review.createdAt && formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-3 text-sm">{review.reviewText}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(review.id)}
                    className="mt-2"
                  >
                    <Heart className="mr-1 h-4 w-4" />
                    {review.likes} helpful
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && currentUser && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Write a Review for {animeTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className={`h-10 w-10 rounded-full ${
                        i < rating ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Share your thoughts about this anime..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[150px]"
                required
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !reviewText.trim()}>
                  {loading ? 'Posting...' : 'Post Review'}
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
          Please sign in to write a review
        </div>
      )}
    </div>
  );
}