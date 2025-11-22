import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useLocation } from "wouter";

interface AnimeCardProps {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  episodes?: {
    sub: number;
    dub: number;
  };
  type?: string;
  rating?: string;
  duration?: string;
  rank?: number;
  className?: string;
}

export function AnimeCard({
  id,
  name,
  jname,
  poster,
  episodes,
  type,
  rank,
  className = "",
}: AnimeCardProps) {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { addAnime, removeAnime, checkInWatchlist } = useWatchlist();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (currentUser) {
      checkStatus();
    }
  }, [currentUser, id]);

  const checkStatus = async () => {
    const status = await checkInWatchlist(id);
    setInWatchlist(status);
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      setLocation('/auth/login');
      return;
    }

    setLoading(true);
    try {
      if (inWatchlist) {
        await removeAnime(id);
        setInWatchlist(false);
      } else {
        await addAnime(id, name, poster);
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={`/anime/${id}`}>
      <div
        className={`group relative aspect-[2/3] overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 ${className}`}
        data-testid={`card-anime-${id}`}
      >
        <img
          src={poster}
          alt={name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
        />

        {/* Low opacity black overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

        {/* Gradient overlay - always visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

        {/* Watchlist button - only visible on hover, top left */}
        <button
          onClick={handleWatchlistToggle}
          disabled={loading}
          className="absolute top-2 left-2 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-primary/80 hover:border-primary/50 hover:scale-110 active:scale-95 disabled:opacity-50"
        >
          {inWatchlist ? (
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          ) : (
            <Plus className="w-4 h-4 text-white" strokeWidth={3} />
          )}
        </button>

        {/* Rank badge - top right */}
        {rank && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-gradient-to-br from-primary/90 to-primary/70 backdrop-blur-sm border border-white/20 text-white font-bold text-xs px-2 py-0.5 rounded-md shadow-lg">
              #{rank}
            </div>
          </div>
        )}

        {/* Episode chips - small and compact */}
        {episodes && !rank && (
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            {episodes.sub > 0 && (
              <div className="bg-black/60 backdrop-blur-sm border border-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow-md">
                SUB {episodes.sub}
              </div>
            )}
            {episodes.dub > 0 && (
              <div className="bg-primary/70 backdrop-blur-sm border border-white/30 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow-md">
                DUB {episodes.dub}
              </div>
            )}
          </div>
        )}

        {/* Type chip - small */}
        {type && !episodes && !rank && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-black/60 backdrop-blur-sm border border-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow-md">
              {type}
            </div>
          </div>
        )}

        {/* Play button - small, center on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-full p-3 shadow-2xl hover:scale-110 transition-transform duration-200">
            <Play className="w-6 h-6 text-black fill-current" />
          </div>
        </div>

        {/* Title with unique design - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="text-white font-bold text-sm line-clamp-2 drop-shadow-2xl tracking-tight leading-tight" data-testid={`text-anime-title-${id}`}>
            {language === 'jp' && jname ? jname : name}
          </h3>
        </div>
      </div>
    </Link>
  );
}