import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  updateProgress,
  getProgress,
  getContinueWatching,
  ProgressItem
} from '@/lib/firestore-utils';

// Add title and posterUrl to ProgressItem type
export interface ProgressItem {
  animeId: string;
  lastEpisode: number;
  lastTimestamp: number;
  isCompleted: boolean;
  completedEpisodes: number[];
  updatedAt: any;
  title?: string;
  posterUrl?: string;
}


export function useProgress() {
  const { currentUser } = useAuth();
  const [continueWatching, setContinueWatching] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadContinueWatching();
    } else {
      setContinueWatching([]);
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch full anime data for continue watching
  const loadContinueWatching = useCallback(async () => {
    if (!currentUser) {
      setContinueWatching([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const items = await getContinueWatching(currentUser.uid);

      // Fetch anime details for each item
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          try {
            const response = await fetch(`/api/anime/${item.animeId}`);
            if (response.ok) {
              const data = await response.json();
              return {
                ...item,
                title: data.data.anime.info.name,
                posterUrl: data.data.anime.info.poster
              };
            }
          } catch (error) {
            console.error(`Error fetching anime ${item.animeId}:`, error);
          }
          return item;
        })
      );

      setContinueWatching(itemsWithDetails);
    } catch (error) {
      console.error('Error loading continue watching:', error);
      setContinueWatching([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const saveProgress = async (
    animeId: string,
    episodeNumber: number,
    timestamp: number,
    isCompleted: boolean = false
  ) => {
    if (!currentUser) return;

    await updateProgress(
      currentUser.uid,
      animeId,
      episodeNumber,
      timestamp,
      isCompleted
    );
    await loadContinueWatching();
  };

  const getAnimeProgress = async (animeId: string): Promise<ProgressItem | null> => {
    if (!currentUser) return null;
    return await getProgress(currentUser.uid, animeId);
  };

  return {
    continueWatching,
    loading,
    saveProgress,
    getAnimeProgress,
    refresh: loadContinueWatching
  };
}