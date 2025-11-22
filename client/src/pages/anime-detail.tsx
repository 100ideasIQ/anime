import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnimeCard } from "@/components/anime-card";
import WatchlistButton from "@/components/watchlist-button";
import ReviewsSection from "@/components/reviews-section";
import DiscussionThreads from "@/components/discussion-threads";
import { Play, Star, Clock, Calendar } from "lucide-react";
import type { AnimeDetail, AnimeEpisodes } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();

  const { data: animeData, isLoading } = useQuery<AnimeDetail>({
    queryKey: ["/api/anime", id],
  });

  const { data: episodesData } = useQuery<AnimeEpisodes>({
    queryKey: ["/api/anime", id, "episodes"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="w-full h-[50vh]" />
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!animeData?.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Anime Not Found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const anime = animeData.data.anime;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full h-[45vh] sm:h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={anime.info.poster}
            alt={anime.info.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex items-end pb-6 md:pb-8">
          <div className="flex gap-4 md:gap-6 items-end w-full max-w-6xl">
            <img
              src={anime.info.poster}
              alt={anime.info.name}
              className="hidden md:block w-32 h-44 lg:w-40 lg:h-56 object-cover rounded-lg shadow-2xl flex-shrink-0"
            />

            <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight"
                data-testid={`text-anime-title-${id}`}
              >
                {language === "jp" && anime.info.jname
                  ? anime.info.jname.split("(")[0].trim()
                  : anime.info.name.split("(")[0].trim()}
              </h1>

              <div className="flex items-center gap-2 md:gap-3 flex-wrap text-xs sm:text-sm">
                {anime.info.stats?.rating && (
                  <div className="flex items-center gap-1 font-bold">
                    <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-500 text-yellow-500" />
                    {anime.info.stats.rating}
                  </div>
                )}
                {anime.info.stats?.type && (
                  <Badge variant="secondary" className="font-semibold">
                    {anime.info.stats.type}
                  </Badge>
                )}
                {anime.info.stats?.duration && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 font-semibold"
                  >
                    <Clock className="w-3 h-3" />
                    {anime.info.stats.duration}
                  </Badge>
                )}
                {anime.info.stats?.quality && (
                  <Badge className="bg-purple-600 text-white font-semibold">
                    {anime.info.stats.quality}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 md:gap-3 pt-1 md:pt-2 flex-wrap">
                {episodesData?.data?.episodes &&
                  episodesData.data.episodes.length > 0 && (
                    <Link
                      href={`/watch/${id}?ep=${episodesData.data.episodes[0].episodeId}`}
                    >
                      <Button
                        size="lg"
                        className="h-9 md:h-11 px-4 md:px-6 gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm md:text-base"
                        data-testid="button-watch-now"
                      >
                        <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                        Watch Now
                      </Button>
                    </Link>
                  )}
                <WatchlistButton
                  animeId={id || ""}
                  animeTitle={anime.info.name}
                  posterUrl={anime.info.poster}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Main Content - 3 cols on desktop */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="episodes" className="w-full">
              <TabsList className="w-full justify-start bg-muted/50 h-auto p-0.5 overflow-x-auto flex-nowrap">
                <TabsTrigger
                  value="episodes"
                  className="data-[state=active]:bg-background font-bold text-sm md:text-base px-4 md:px-6 h-10 whitespace-nowrap"
                  data-testid="tab-episodes"
                >
                  Episodes
                </TabsTrigger>
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-background font-bold text-sm md:text-base px-4 md:px-6 h-10 whitespace-nowrap"
                  data-testid="tab-overview"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-background font-bold text-sm md:text-base px-4 md:px-6 h-10 whitespace-nowrap"
                >
                  Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="discussions"
                  className="data-[state=active]:bg-background font-bold text-sm md:text-base px-4 md:px-6 h-10 whitespace-nowrap"
                >
                  Discussions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="episodes" className="mt-4 md:mt-6">
                {episodesData?.data?.episodes &&
                episodesData.data.episodes.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3">
                    {episodesData.data.episodes.map((episode) => (
                      <Link
                        key={episode.episodeId}
                        href={`/watch/${id}?ep=${episode.episodeId}`}
                      >
                        <div
                          className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-purple-500 transition-all cursor-pointer bg-muted/50 hover:bg-muted"
                          data-testid={`card-episode-${episode.number}`}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl md:text-3xl font-black text-foreground/20 group-hover:text-foreground/30 transition-colors">
                              {episode.number}
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/90 transition-all flex items-center justify-center">
                            <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-current opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all" />
                          </div>

                          {episode.isFiller && (
                            <div className="absolute top-1 right-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No episodes available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="overview" className="mt-4 md:mt-6 space-y-6">
                {anime.info.description && (
                  <div>
                    <h2 className="text-lg md:text-xl font-bold mb-2">
                      Synopsis
                    </h2>
                    <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                      {anime.info.description}
                    </p>
                  </div>
                )}

                {anime.moreInfo && Object.keys(anime.moreInfo).length > 0 && (
                  <div>
                    <h2 className="text-lg md:text-xl font-bold mb-3">
                      Information
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {Object.entries(anime.moreInfo).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-xs text-muted-foreground font-semibold mb-1">
                            {key}
                          </dt>
                          <dd className="text-sm text-foreground font-medium">
                            {Array.isArray(value) ? value.join(", ") : value}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-4 md:mt-6">
                <ReviewsSection
                  animeId={id || ""}
                  animeTitle={anime.info.name}
                />
              </TabsContent>

              <TabsContent value="discussions" className="mt-4 md:mt-6">
                <DiscussionThreads
                  animeId={id || ""}
                  animeTitle={anime.info.name}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - 1 col on desktop */}
          <div className="lg:col-span-1 space-y-4">
            {animeData.data.seasons && animeData.data.seasons.length > 1 && (
              <div>
                <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Seasons
                </h3>
                <div className="space-y-2">
                  {animeData.data.seasons.map((season) => (
                    <Link key={season.id} href={`/anime/${season.id}`}>
                      <div
                        className={`p-3 rounded-lg cursor-pointer transition-all text-sm ${
                          season.isCurrent
                            ? "bg-purple-600/20 border border-purple-600/50"
                            : "bg-muted/50 hover:bg-muted border border-transparent"
                        }`}
                        data-testid={`card-season-${season.id}`}
                      >
                        <p className="font-bold text-foreground line-clamp-1">
                          {season.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Anime - Sidebar Section */}
            {animeData.data.relatedAnimes &&
              animeData.data.relatedAnimes.length > 0 && (
                <div className="mt-4 md:mt-6">
                  <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Related Anime
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {animeData.data.relatedAnimes.slice(0, 3).map((anime) => (
                      <Link key={anime.id} href={`/anime/${anime.id}`}>
                        <Card className="group relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 bg-muted/50 hover:bg-muted">
                          <img
                            src={anime.poster}
                            alt={anime.name}
                            className="w-20 h-28 object-cover rounded-md mr-3 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-foreground font-bold text-sm line-clamp-2 leading-tight">
                              {language === "jp" && anime.jname
                                ? anime.jname
                                : anime.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                              {language === "jp" && anime.jdescription
                                ? anime.jdescription
                                : anime.description}
                            </p>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Related Anime - Bottom Section (removed for desktop redesign) */}
        {/* You might want to conditionally render this or adjust it based on screen size if needed */}

        {/* Recommended Anime - Bottom Section */}
        {animeData.data.recommendedAnimes &&
          animeData.data.recommendedAnimes.length > 0 && (
            <div className="mt-8 md:mt-12 max-w-7xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {animeData.data.recommendedAnimes.slice(0, 12).map((anime) => (
                  <AnimeCard key={anime.id} {...anime} />
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
