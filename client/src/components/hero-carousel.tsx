import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tv,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { AnimeSpotlight, AnimeEpisodes } from "@shared/schema";

interface HeroCarouselProps {
  spotlights: AnimeSpotlight[];
  onAnimeChange?: (anime: AnimeSpotlight) => void;
}

export function HeroCarousel({ spotlights, onAnimeChange }: HeroCarouselProps) {
  const [location] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || spotlights.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlights.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, spotlights.length]);

  if (!spotlights || spotlights.length === 0) {
    return null;
  }

  const currentAnime = spotlights[currentIndex];

  useEffect(() => {
    if (onAnimeChange && currentAnime) {
      onAnimeChange(currentAnime);
    }
  }, [currentAnime, onAnimeChange]);

  const { data: episodesData } = useQuery<AnimeEpisodes>({
    queryKey: ["/api/anime", currentAnime.id, "episodes"],
    enabled: !!currentAnime.id,
  });

  const firstEpisodeId = episodesData?.data?.episodes?.[0]?.episodeId;

  const goToPrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + spotlights.length) % spotlights.length,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % spotlights.length);
  };

  // Truncate description to max 150 characters
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  // Smart title truncation - keeps important parts visible
  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;

    // Try to truncate at a word boundary
    const truncated = title.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace > maxLength * 0.7) {
      // If we can find a space in the last 30% of the string, use it
      return truncated.slice(0, lastSpace) + "...";
    }

    return truncated + "...";
  };

  return (
    <div
      className="relative w-full h-[45vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="section-hero-carousel"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentAnime.poster}
          alt={currentAnime.name}
          className="w-full h-full object-cover object-[center_20%] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent md:from-background/95 md:via-background/80 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-8 h-full flex items-end pb-16 sm:pb-18 md:pb-20 lg:pb-24">
        <div className="max-w-xl md:max-w-2xl space-y-2 sm:space-y-2.5 md:space-y-3">
          {/* Status Badge & Info */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Badge className="bg-gradient-to-r from-purple-600 to-purple-500 text-white border-0 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide shadow-lg shadow-purple-500/30">
              #{currentAnime.rank} SPOTLIGHT
            </Badge>
            {currentAnime.otherInfo?.[0] && (
              <span className="text-[10px] sm:text-xs text-foreground/70 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {currentAnime.otherInfo[0]}
              </span>
            )}
            {currentAnime.otherInfo?.[1] && (
              <span className="text-[10px] sm:text-xs text-foreground/70 font-medium flex items-center gap-1">
                <Tv className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {currentAnime.otherInfo[1]}
              </span>
            )}
          </div>

          {/* Title - Responsive sizing with smart truncation */}
          <h1
            className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-foreground leading-tight drop-shadow-2xl"
            data-testid={`text-hero-title-${currentAnime.id}`}
          >
            {truncateTitle(currentAnime.name.split("(")[0].trim(), 60)}
          </h1>

          {/* Description - Hidden on mobile, truncated on desktop */}
          <p className="hidden md:block text-sm lg:text-base text-foreground/70 leading-relaxed max-w-2xl">
            {truncateDescription(currentAnime.description, 150)}
          </p>

          {/* Action Buttons - Responsive */}
          <div className="flex flex-wrap gap-2 sm:gap-2.5 md:gap-3 pt-2 sm:pt-2.5 md:pt-3">
            {firstEpisodeId ? (
              <Link href={`/watch/${currentAnime.id}?ep=${firstEpisodeId}`}>
                <Button
                  size="sm"
                  className="h-9 sm:h-10 md:h-11 gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 bg-white text-black hover:bg-white/90 border-0 shadow-xl transition-all hover:scale-105 font-bold text-xs sm:text-sm md:text-base"
                  data-testid={`button-watch-${currentAnime.id}`}
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-current" />
                  Watch Now
                </Button>
              </Link>
            ) : (
              <Link href={`/anime/${currentAnime.id}`}>
                <Button
                  size="sm"
                  className="h-9 sm:h-10 md:h-11 gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 bg-white text-black hover:bg-white/90 border-0 shadow-xl transition-all hover:scale-105 font-bold text-xs sm:text-sm md:text-base"
                  data-testid={`button-watch-${currentAnime.id}`}
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-current" />
                  Watch Now
                </Button>
              </Link>
            )}
            <Link href={`/anime/${currentAnime.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-9 sm:h-10 md:h-11 gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all hover:scale-105 font-semibold text-xs sm:text-sm md:text-base"
                data-testid={`button-details-${currentAnime.id}`}
              >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">More Info</span>
                <span className="sm:hidden">Info</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Hidden on desktop until hover, always visible on mobile */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 px-3 sm:px-4 md:px-6 pointer-events-none md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <div className="container mx-auto flex justify-between items-center pointer-events-none">
          {/* Desktop buttons */}
          <button
            onClick={goToPrevious}
            className="hidden md:block pointer-events-auto group/btn bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg p-3 transition-all duration-300 border border-white/20 hover:border-white/40"
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="w-7 h-7 lg:w-8 lg:h-8 text-white transition-transform group-hover/btn:-translate-x-0.5" />
          </button>

          {/* Mobile buttons - enhanced design */}
          <button
            onClick={goToPrevious}
            className="md:hidden pointer-events-auto bg-gradient-to-br from-purple-600/80 to-purple-500/80 hover:from-purple-600 hover:to-purple-500 backdrop-blur-md rounded-full p-2 sm:p-2.5 active:scale-95 transition-all duration-200 border border-purple-400/30 shadow-lg shadow-purple-500/20 mb-20"
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          <button
            onClick={goToNext}
            className="hidden md:block pointer-events-auto group/btn bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg p-3 transition-all duration-300 border border-white/20 hover:border-white/40 "
            data-testid="button-carousel-next"
          >
            <ChevronRight className="w-7 h-7 lg:w-8 lg:h-8 text-white transition-transform group-hover/btn:translate-x-0.5" />
          </button>

          {/* Mobile buttons - enhanced design */}
          <button
            onClick={goToNext}
            className="md:hidden pointer-events-auto bg-gradient-to-br from-purple-600/80 to-purple-500/80 hover:from-purple-600 hover:to-purple-500 backdrop-blur-md rounded-full p-2 sm:p-2.5 active:scale-95 transition-all duration-200 border border-purple-400/30 shadow-lg shadow-purple-500/20 mb-20"
            data-testid="button-carousel-next"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Carousel Indicators - Bottom Center */}
      <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
        {spotlights.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-6 sm:w-8 md:w-10 bg-purple-500 shadow-lg shadow-purple-500/50"
                : "w-3 sm:w-4 bg-white/30 hover:bg-white/50"
            }`}
            data-testid={`button-indicator-${idx}`}
          />
        ))}
      </div>
    </div>
  );
}
