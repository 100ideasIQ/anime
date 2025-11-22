import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimeCard } from "@/components/anime-card";
import { AnimeCardSkeleton } from "@/components/ui/skeleton";
import { Search, Filter, X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import type { SearchResponse } from "@shared/schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEO } from "@/components/seo";

export default function SearchPage() {
  const { language } = useLanguage();
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);

  const [query, setQuery] = useState(searchParams.get('q') || "");
  const [page, setPage] = useState(Number(searchParams.get('page') || '1'));
  const [showFilters, setShowFilters] = useState(false);

  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get('genres')?.split(',').filter(Boolean) || []
  );
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || "");
  const [selectedSeason, setSelectedSeason] = useState(searchParams.get('season') || "");
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || "");

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', page.toString());
    if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','));
    if (selectedType) params.set('type', selectedType);
    if (selectedSeason) params.set('season', selectedSeason);
    if (selectedLanguage) params.set('language', selectedLanguage);
    if (selectedStatus) params.set('status', selectedStatus);
    return params.toString();
  };

  const { data: searchData, isLoading } = useQuery<SearchResponse>({
    queryKey: ["/api/search", query, page, selectedGenres.join(','), selectedType, selectedSeason, selectedLanguage, selectedStatus],
    queryFn: async () => {
      const queryString = buildQueryString();
      const response = await fetch(`/api/search?${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to search anime');
      }
      return response.json();
    },
    enabled: query.length > 0,
  });

  useEffect(() => {
    const queryString = buildQueryString();
    navigate(`/search?${queryString}`, { replace: true });
  }, [page, query, selectedGenres, selectedType, selectedSeason, selectedLanguage, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedType("");
    setSelectedSeason("");
    setSelectedLanguage("");
    setSelectedStatus("");
    setPage(1);
  };

  const hasActiveFilters = selectedGenres.length > 0 || selectedType || selectedSeason || selectedLanguage || selectedStatus;

  const genres = [
    "Action", "Adventure", "Cars", "Comedy", "Dementia", "Demons", 
    "Drama", "Ecchi", "Fantasy", "Game", "Harem", "Historical",
    "Horror", "Josei", "Kids", "Magic", "Martial Arts", "Mecha",
    "Military", "Music", "Mystery", "Parody", "Police", "Psychological",
    "Romance", "Samurai", "School", "Sci-Fi", "Seinen", "Shoujo",
    "Shounen", "Slice of Life", "Space", "Sports", "Super Power",
    "Supernatural", "Thriller", "Vampire"
  ];

  const types = ["movie", "tv", "ova", "ona", "special", "music"];
  const seasons = ["winter", "spring", "summer", "fall"];
  const languages = ["sub", "dub"];
  const statuses = ["finished-airing", "currently-airing", "not-yet-aired"];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Search Anime"
        description="Search and discover anime series, movies, and shows. Advanced filters by genre, year, type, status, and more. Find your next anime to watch."
        keywords="anime search, find anime, search anime by genre, anime directory, anime catalog, discover anime"
        url="https://animebite.cc/search"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Search Anime</h1>

          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for anime..."
                className="pl-10 pr-4 h-12"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                data-testid="input-search-query"
              />
            </div>
            <Button type="submit" size="lg" className="md:px-8" data-testid="button-search">
              <Search className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Search</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
              className={`md:px-8 ${hasActiveFilters ? "border-primary" : ""}`}
            >
              <Filter className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Filters</span>
              {hasActiveFilters && (
                <Badge className="ml-2 h-5 px-1.5 min-w-[20px]" variant="default">
                  {selectedGenres.length + (selectedType ? 1 : 0) + (selectedSeason ? 1 : 0) + (selectedLanguage ? 1 : 0) + (selectedStatus ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </form>

          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent>
              <Card className="p-6 mb-6 bg-card/50 backdrop-blur-sm border-2">
                <div className="space-y-6">
                  {/* Genres Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Genres</h3>
                      {selectedGenres.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedGenres([]);
                            setPage(1);
                          }}
                          className="h-7 text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <Badge
                          key={genre}
                          variant={selectedGenres.includes(genre) ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 px-3 py-1.5 text-xs font-medium ${
                            selectedGenres.includes(genre) 
                              ? "shadow-md scale-105" 
                              : "hover:scale-105 hover:border-primary/50"
                          }`}
                          onClick={() => toggleGenre(genre)}
                          data-testid={`badge-genre-${genre.toLowerCase()}`}
                        >
                          {genre}
                          {selectedGenres.includes(genre) && <X className="w-3 h-3 ml-1.5" />}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Type Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Type</h3>
                        {selectedType && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedType("")}
                            className="h-7 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {types.map((type) => (
                          <Badge
                            key={type}
                            variant={selectedType === type ? "default" : "outline"}
                            className={`cursor-pointer transition-all duration-200 px-3 py-1.5 text-xs font-medium uppercase ${
                              selectedType === type 
                                ? "shadow-md scale-105" 
                                : "hover:scale-105 hover:border-primary/50"
                            }`}
                            onClick={() => {
                              setSelectedType(selectedType === type ? "" : type);
                              setPage(1);
                            }}
                            data-testid={`badge-type-${type}`}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Season Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Season</h3>
                        {selectedSeason && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSeason("")}
                            className="h-7 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {seasons.map((season) => (
                          <Badge
                            key={season}
                            variant={selectedSeason === season ? "default" : "outline"}
                            className={`cursor-pointer transition-all duration-200 px-3 py-1.5 text-xs font-medium capitalize ${
                              selectedSeason === season 
                                ? "shadow-md scale-105" 
                                : "hover:scale-105 hover:border-primary/50"
                            }`}
                            onClick={() => {
                              setSelectedSeason(selectedSeason === season ? "" : season);
                              setPage(1);
                            }}
                            data-testid={`badge-season-${season}`}
                          >
                            {season}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Language Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Language</h3>
                        {selectedLanguage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLanguage("")}
                            className="h-7 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang) => (
                          <Badge
                            key={lang}
                            variant={selectedLanguage === lang ? "default" : "outline"}
                            className={`cursor-pointer transition-all duration-200 px-3 py-1.5 text-xs font-medium uppercase ${
                              selectedLanguage === lang 
                                ? "shadow-md scale-105" 
                                : "hover:scale-105 hover:border-primary/50"
                            }`}
                            onClick={() => {
                              setSelectedLanguage(selectedLanguage === lang ? "" : lang);
                              setPage(1);
                            }}
                            data-testid={`badge-language-${lang}`}
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Status</h3>
                        {selectedStatus && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStatus("")}
                            className="h-7 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {statuses.map((status) => (
                          <Badge
                            key={status}
                            variant={selectedStatus === status ? "default" : "outline"}
                            className={`cursor-pointer transition-all duration-200 px-3 py-1.5 text-xs font-medium ${
                              selectedStatus === status 
                                ? "shadow-md scale-105" 
                                : "hover:scale-105 hover:border-primary/50"
                            }`}
                            onClick={() => {
                              setSelectedStatus(selectedStatus === status ? "" : status);
                              setPage(1);
                            }}
                            data-testid={`badge-status-${status}`}
                          >
                            {status.replace(/-/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {selectedGenres.length + (selectedType ? 1 : 0) + (selectedSeason ? 1 : 0) + (selectedLanguage ? 1 : 0) + (selectedStatus ? 1 : 0)} filter(s) active
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        data-testid="button-clear-filters"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedGenres.map((genre) => (
                <Badge
                  key={genre}
                  variant="default"
                  className="cursor-pointer px-3 py-1"
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                  <X className="w-3 h-3 ml-1.5" />
                </Badge>
              ))}
              {selectedType && (
                <Badge
                  variant="default"
                  className="cursor-pointer px-3 py-1 uppercase"
                  onClick={() => setSelectedType("")}
                >
                  {selectedType}
                  <X className="w-3 h-3 ml-1.5" />
                </Badge>
              )}
              {selectedSeason && (
                <Badge
                  variant="default"
                  className="cursor-pointer px-3 py-1 capitalize"
                  onClick={() => setSelectedSeason("")}
                >
                  {selectedSeason}
                  <X className="w-3 h-3 ml-1.5" />
                </Badge>
              )}
              {selectedLanguage && (
                <Badge
                  variant="default"
                  className="cursor-pointer px-3 py-1 uppercase"
                  onClick={() => setSelectedLanguage("")}
                >
                  {selectedLanguage}
                  <X className="w-3 h-3 ml-1.5" />
                </Badge>
              )}
              {selectedStatus && (
                <Badge
                  variant="default"
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setSelectedStatus("")}
                >
                  {selectedStatus.replace(/-/g, ' ')}
                  <X className="w-3 h-3 ml-1.5" />
                </Badge>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, idx) => (
              <AnimeCardSkeleton key={idx} />
            ))}
          </div>
        ) : searchData?.data?.animes && searchData.data.animes.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Found <span className="text-foreground font-semibold">{searchData.data.animes.length}</span> results for "<span className="text-foreground font-semibold">{searchData.data.searchQuery}</span>"
                {searchData.data.totalPages && ` - Page ${searchData.data.currentPage} of ${searchData.data.totalPages}`}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {searchData.data.animes.map((anime) => (
                <AnimeCard key={anime.id} {...anime} />
              ))}
            </div>

            {searchData.data.totalPages && searchData.data.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {searchData.data.totalPages}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  disabled={!searchData.data.hasNextPage}
                  onClick={() => setPage(p => p + 1)}
                  data-testid="button-next-page"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : query ? (
          <Card className="p-12 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">No Results Found</h2>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Start Searching</h2>
            <p className="text-muted-foreground">
              Enter a search query above to find anime
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}