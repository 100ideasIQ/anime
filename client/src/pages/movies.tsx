
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/seo";
import { AnimeCard } from "@/components/anime-card";
import { AnimeCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Film } from "lucide-react";
import type { CategoryResponse } from "@shared/schema";

export default function MoviesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<CategoryResponse>({
    queryKey: ["/api/category/movie", page],
    queryFn: async () => {
      const response = await fetch(`/api/category/movie?page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Watch Latest Anime Movies Online Free in HD"
        description="Watch anime movies online free in HD. Stream latest anime films, classic movies with English sub and dub. Updated daily with new anime movie releases."
        keywords="anime movies, watch anime movies, anime films, latest anime movies, popular anime movies, anime movie streaming, HD anime movies"
        url="https://animebite.cc/movies"
      />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Film className="w-8 h-8 text-primary" />
            <span className="flex items-center gap-2">
              <span className="text-primary">|</span> Anime Movies
            </span>
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
                className="rounded-lg"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No movies found</p>
          </div>
        )}
      </div>
    </div>
  );
}
