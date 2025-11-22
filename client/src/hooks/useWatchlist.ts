import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getWatchlist,
  WatchlistItem
} from '@/lib/firestore-utils';

export function useWatchlist() {
  const { currentUser } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadWatchlist();
    } else {
      setWatchlist([]);
      setLoading(false);
    }
  }, [currentUser]);

  const loadWatchlist = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const items = await getWatchlist(currentUser.uid);
      setWatchlist(items);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAnime = async (animeId: string, title: string, posterUrl: string) => {
    if (!currentUser) throw new Error('Must be logged in');
    
    await addToWatchlist(currentUser.uid, animeId, title, posterUrl);
    await loadWatchlist();
  };

  const removeAnime = async (animeId: string) => {
    if (!currentUser) throw new Error('Must be logged in');
    
    await removeFromWatchlist(currentUser.uid, animeId);
    await loadWatchlist();
  };

  const checkInWatchlist = async (animeId: string): Promise<boolean> => {
    if (!currentUser) return false;
    return await isInWatchlist(currentUser.uid, animeId);
  };

  return {
    watchlist,
    loading,
    addAnime,
    removeAnime,
    checkInWatchlist,
    refresh: loadWatchlist
  };
}
