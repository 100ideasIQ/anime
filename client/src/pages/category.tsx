
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { SEO } from "@/components/seo";
import { AnimeCard } from "@/components/anime-card";
import { AnimeCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CategoryResponse } from "@shared/schema";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<CategoryResponse>({
    queryKey: ["/api/category", category, page],
    queryFn: async () => {
      const response = await fetch(`/api/category/${category}?page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      return response.json();
    },
  });

  const categoryTitle = category
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';

  const getCategoryMeta = () => {
    const meta: { [key: string]: { title: string; description: string; keywords: string } } = {
      'trending': {
        title: 'Trending Anime - Most Popular Anime Right Now',
        description: 'Watch trending anime online free. Stream the most popular and talked-about anime series and movies right now in HD.',
        keywords: 'trending anime, popular anime, most watched anime, hot anime, viral anime'
      },
      'recently-updated': {
        title: 'Recently Updated Anime - Latest Episodes Released',
        description: 'Watch recently updated anime with latest episodes. Stream new anime episodes released today in HD with sub and dub.',
        keywords: 'recently updated anime, latest anime episodes, new anime episodes, fresh anime'
      },
      'top-airing': {
        title: 'Top Airing Anime - Currently Airing Anime Series',
        description: 'Watch top airing anime series online free. Stream currently airing anime with latest episodes in HD.',
        keywords: 'top airing anime, currently airing anime, ongoing anime, seasonal anime'
      },
      'top-upcoming': {
        title: 'Upcoming Anime - New Anime Releases & Premieres',
        description: 'Discover upcoming anime series and movies. Get updates on new anime releases and premieres coming soon.',
        keywords: 'upcoming anime, new anime releases, anime premieres, future anime'
      }
    };
    
    return meta[category || ''] || {
      title: `${categoryTitle} Anime - Watch Online Free in HD | AnimeBite`,
      description: `Watch ${categoryTitle.toLowerCase()} anime online free in HD. Stream anime series and movies in this category.`,
      keywords: `${categoryTitle.toLowerCase()} anime, watch ${categoryTitle.toLowerCase()} anime`
    };
  };

  const categoryMeta = getCategoryMeta();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={categoryMeta.title}
        description={categoryMeta.description}
        keywords={categoryMeta.keywords}
        url={`https://animebite.cc/category/${category}`}
      />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2" data-testid="text-category-title">
            <span className="text-primary">|</span> {categoryTitle}
          </h1>
          {data?.data?.currentPage && data?.data?.totalPages && (
            <p className="text-sm text-muted-foreground">
              Page {data.data.currentPage} of {data.data.totalPages}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {Array.from({ length: 21 }).map((_, idx) => (
              <AnimeCardSkeleton key={idx} />
            ))}
          </div>
        ) : data?.data?.animes && data.data.animes.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 mb-8">
              {data.data.animes.map((anime) => (
                <AnimeCard key={anime.id} {...anime} />
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                data-testid="button-prev-page"
                className="rounded-lg"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg">
                <span className="text-sm font-medium text-foreground">
                  {page} {data.data.totalPages && `/ ${data.data.totalPages}`}
                </span>
              </div>
              <Button
                variant="secondary"
                disabled={!data.data.hasNextPage}
                onClick={() => setPage(p => p + 1)}
                data-testid="button-next-page"
                className="rounded-lg"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No anime found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
