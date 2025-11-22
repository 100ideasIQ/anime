
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { getContinueWatching, ProgressItem } from '@/lib/firestore-utils';
import { Play, Clock } from 'lucide-react';

export function ContinueWatchingSection() {
  const { currentUser } = useAuth();
  const [continueWatching, setContinueWatching] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContinueWatching = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const items = await getContinueWatching(currentUser.uid);
        // Filter out completed and items without required data
        const activeItems = items.filter(
          item => !item.isCompleted && item.title && item.posterUrl && item.lastEpisodeId
        );
        setContinueWatching(activeItems);
      } catch (error) {
        console.error('Error loading continue watching:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContinueWatching();
  }, [currentUser]);

  if (!currentUser || loading || continueWatching.length === 0) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="mb-8 md:mb-12" data-testid="section-continue-watching">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Continue Watching</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {continueWatching.map((item) => (
          <Link 
            key={item.animeId} 
            href={`/watch/${item.animeId}?ep=${item.lastEpisodeId}`}
          >
            <div className="group relative aspect-[2/3] overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              />
              
              {/* Low opacity black overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
              
              {/* Gradient overlay - always visible */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
              
              {/* Episode info - top right */}
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-black/60 backdrop-blur-sm border border-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow-md">
                  EP {item.lastEpisode}
                </div>
              </div>
              
              {/* Play button - small, center on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-full p-3 shadow-2xl hover:scale-110 transition-transform duration-200">
                  <Play className="w-6 h-6 text-black fill-current" />
                </div>
              </div>

              {/* Title and progress - bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <h3 className="text-white font-bold text-sm line-clamp-2 drop-shadow-2xl tracking-tight leading-tight mb-2">
                  {item.title}
                </h3>
                
                {/* Progress indicator */}
                <div className="w-full bg-white/20 h-1 rounded-full mb-1">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-300" 
                    style={{ width: '30%' }}
                  />
                </div>
                
                <div className="flex items-center gap-1 text-xs text-white/80">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(item.lastTimestamp)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
