import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useLocation } from 'wouter';

interface WatchlistButtonProps {
  animeId: string;
  animeTitle: string;
  posterUrl: string;
}

export default function WatchlistButton({ animeId, animeTitle, posterUrl }: WatchlistButtonProps) {
  const { currentUser } = useAuth();
  const { addAnime, removeAnime, checkInWatchlist } = useWatchlist();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (currentUser) {
      checkStatus();
    }
  }, [currentUser, animeId]);

  const checkStatus = async () => {
    const status = await checkInWatchlist(animeId);
    setInWatchlist(status);
  };

  const handleToggle = async () => {
    if (!currentUser) {
      setLocation('/auth/login');
      return;
    }

    setLoading(true);
    try {
      if (inWatchlist) {
        await removeAnime(animeId);
        setInWatchlist(false);
      } else {
        await addAnime(animeId, animeTitle, posterUrl);
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant={inWatchlist ? 'default' : 'outline'}
    >
      {inWatchlist ? (
        <>
          <BookmarkCheck className="mr-2 h-4 w-4" />
          In Watchlist
        </>
      ) : (
        <>
          <Bookmark className="mr-2 h-4 w-4" />
          Add to Watchlist
        </>
      )}
    </Button>
  );
}
