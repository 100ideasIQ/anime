import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/seo";
import { HeroCarousel } from "@/components/hero-carousel";
import { AnimeCard } from "@/components/anime-card";
import { EstimatedSchedule } from "@/components/estimated-schedule";
import { ContinueWatchingSection } from "@/components/continue-watching-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { HeroSkeleton, HorizontalScrollSkeleton, RankedListItemSkeleton, SectionHeaderSkeleton } from "@/components/ui/skeleton";
import { ChevronRight, Eye, MessageSquare, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { HomeData, AnimeSpotlight } from "@shared/schema";

export default function Home() {
  const [currentAnime, setCurrentAnime] = useState<AnimeSpotlight | null>(null);

  const { data: homeData, isLoading } = useQuery<HomeData>({
    queryKey: ["/api/home"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <HeroSkeleton />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-12">
          <HorizontalScrollSkeleton />
          <HorizontalScrollSkeleton />
          <HorizontalScrollSkeleton />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <SectionHeaderSkeleton />
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <RankedListItemSkeleton key={idx} />
                ))}
              </div>
            </section>
            
            <section>
              <SectionHeaderSkeleton />
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <RankedListItemSkeleton key={idx} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Ensure homeData and homeData.data are defined before accessing properties
  const data = homeData?.data;

  // Define handleAnimeChange locally if it's intended to be used within this component
  const handleAnimeChange = (anime: AnimeSpotlight) => {
    setCurrentAnime(anime);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AnimeBite - Watch Anime online with DUB and SUB for FREE"
        description="Watch anime online free in HD quality. Stream 10,000+ anime series, latest episodes, movies with English sub and dub. Fast streaming, no ads, updated daily."
        keywords="watch anime online, anime streaming, free anime, anime episodes, anime movies, latest anime, trending anime, top anime, anime sub, anime dub, HD anime, AnimeBite"
        image="https://animebite.cc/logo.png"
        url="https://animebite.cc/"
      />
      {data?.spotlightAnimes && (
        <HeroCarousel
          spotlights={data.spotlightAnimes}
          onAnimeChange={handleAnimeChange}
        />
      )}

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-12">
        {/* Continue Watching Section */}
        <ContinueWatchingSection />

        {/* Latest Episodes */}
        {data?.latestEpisodeAnimes && data.latestEpisodeAnimes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary">|</span> Recently Updated
              </h2>
              <Link href="/category/recently-updated">
                <button
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-view-all-latest"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
                {data.latestEpisodeAnimes.slice(0, 15).map((anime, idx) => (
                  <div
                    key={`latest-${idx}-${anime.id}`}
                    className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] snap-start"
                  >
                    <AnimeCard {...anime} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trending Anime */}
        {data?.trendingAnimes && data.trendingAnimes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary">|</span> Trending Anime
              </h2>
              <Link href="/category/trending">
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                  View all
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
                {data.trendingAnimes.slice(0, 15).map((anime, idx) => (
                  <div
                    key={`trending-${idx}-${anime.id}`}
                    className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] snap-start"
                  >
                    <AnimeCard {...anime} rank={anime.rank} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Top Airing */}
        {data?.topAiringAnimes && data.topAiringAnimes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary">|</span> Top Airing
              </h2>
              <Link href="/category/top-airing">
                <button
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-view-all-airing"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
                {data.topAiringAnimes.slice(0, 15).map((anime, idx) => (
                  <div
                    key={`airing-${idx}-${anime.id}`}
                    className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] snap-start"
                  >
                    <AnimeCard {...anime} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Seasonal Anime & All Time Anime Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seasonal Anime */}
          {data?.topUpcomingAnimes && data.topUpcomingAnimes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-primary">|</span> Seasonal Anime
                </h2>
                <Link href="/category/top-upcoming">
                  <button
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid="link-view-all-upcoming"
                  >
                    View all
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
              <div className="space-y-3">
                {data.topUpcomingAnimes.slice(0, 10).map((anime, idx) => (
                  <Link
                    key={`seasonal-${idx}-${anime.id}`}
                    href={`/anime/${anime.id}`}
                  >
                    <div className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-all cursor-pointer group">
                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        <span className="text-lg font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden">
                        <img
                          src={anime.poster}
                          alt={anime.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {anime.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {anime.episodes && (
                            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
                              {anime.episodes.sub > 0
                                ? `${anime.episodes.sub} EP`
                                : "NEW"}
                            </span>
                          )}
                          {anime.type && (
                            <span className="text-xs text-muted-foreground">
                              {anime.type}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        <span className="text-xs px-2 py-1 bg-secondary rounded text-secondary-foreground font-medium">
                          {anime.rating || "N/A"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All Time Anime (Top 10) */}
          {data?.top10Animes && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-primary">|</span> All Time Anime
                </h2>
              </div>
              <div className="space-y-3">
                {data.top10Animes.today.slice(0, 10).map((anime, idx) => (
                  <Link
                    key={`alltime-${idx}-${anime.id}`}
                    href={`/anime/${anime.id}`}
                  >
                    <div className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-all cursor-pointer group">
                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        <span className="text-lg font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden">
                        <img
                          src={anime.poster}
                          alt={anime.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {anime.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {anime.episodes && (
                            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
                              {anime.episodes.sub > 0
                                ? `${anime.episodes.sub} EP`
                                : "NEW"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center">
                        <span className="text-xs px-2 py-1 bg-secondary rounded text-secondary-foreground font-medium">
                          TV Show
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Estimated Schedule */}
        <section>
          <EstimatedSchedule />
        </section>

        {/* Trending Forum Posts */}
        <TrendingForumPosts />
      </div>
    </div>
  );
}

function TrendingForumPosts() {
  const [, setLocation] = useLocation();
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingPosts();
  }, []);

  const loadTrendingPosts = async () => {
    setLoading(true);
    try {
      const { getTrendingForumPosts } = await import("@/lib/firestore-utils");
      const posts = await getTrendingForumPosts(5);
      setTrendingPosts(posts);
    } catch (error) {
      console.error("Error loading trending posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      discussions: "bg-blue-500",
      "off-topic": "bg-purple-500",
    };
    return colors[categoryId] || "bg-gray-500";
  };

  const getCategoryName = (categoryId: string) => {
    const names: Record<string, string> = {
      discussions: "Discussions",
      "off-topic": "Off Topic",
    };
    return names[categoryId] || categoryId;
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Just now";
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
  };

  if (loading) {
    return null;
  }

  if (trendingPosts.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="text-primary">|</span> Trending Forum Posts
        </h2>
        <Link href="/forum">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {trendingPosts.map((post, idx) => (
          <div
            key={post.id}
            onClick={() => setLocation(`/forum/post/${post.id}`)}
            className="group relative bg-black/20 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20 shadow-lg transition-all cursor-pointer overflow-hidden"
          >
            {/* Rank Badge */}
            <div className="absolute top-2 right-2 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold">
              #{idx + 1}
            </div>

            <div className="flex gap-3 mb-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={post.avatarUrl} />
                <AvatarFallback>
                  {post.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full text-white ${getCategoryColor(post.category)}`}
                  >
                    {getCategoryName(post.category)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    by <span className="font-medium">{post.username}</span>
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {post.content}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{post.views || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{post.replies || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{post.likes || 0}</span>
              </div>
              <span className="ml-auto">{formatTimeAgo(post.createdAt)}</span>
            </div>

            {/* Hover effect gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
    </section>
  );
}
