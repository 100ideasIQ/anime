import { useState, useEffect } from 'react';
import { getActivityFeed, Activity } from '@/lib/firestore-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Play, CheckCircle, MessageSquare, Star } from 'lucide-react';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const fetchedActivities = await getActivityFeed(30);
      setActivities(fetchedActivities);
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'userStartedAnime':
        return <Play className="h-5 w-5 text-blue-500" />;
      case 'userCompletedAnime':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'userPostedComment':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'userPostedReview':
        return <Star className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'userStartedAnime':
        return `started watching ${activity.animeTitle}`;
      case 'userCompletedAnime':
        return `completed ${activity.animeTitle}`;
      case 'userPostedComment':
        return `commented on ${activity.animeTitle}`;
      case 'userPostedReview':
        return `reviewed ${activity.animeTitle}`;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading activity...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No recent activity
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.avatarUrl} />
                    <AvatarFallback>{activity.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <span className="text-sm">
                        <span className="font-semibold">{activity.username}</span>{' '}
                        {getActivityText(activity)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp && formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                    </span>
                  </div>
                  {activity.animePoster && (
                    <img
                      src={activity.animePoster}
                      alt={activity.animeTitle}
                      className="h-16 w-12 object-cover rounded"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
