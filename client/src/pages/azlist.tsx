import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimeCard } from "@/components/anime-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CategoryResponse } from "@shared/schema";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AZListPage() {
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState("all");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const { data, isLoading } = useQuery<CategoryResponse>({
    queryKey: ["/api/azlist", sortOption, page],
    queryFn: async () => {
      const response = await fetch(`/api/azlist/${sortOption}?page=${page}`);
      if (!response.ok) {
        throw new Error("Failed to fetch A-Z list");
      }
      return response.json();
    },
  });

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    setSortOption(letter.toLowerCase());
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSelectedLetter(null);
    setSortOption(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="text-primary">|</span> A-Z List
          </h1>

          {/* <Tabs value={selectedLetter ? "letters" : sortOption} onValueChange={handleSortChange}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto bg-accent/50 rounded-lg p-1">
              <TabsTrigger value="all" data-testid="tab-all" className="rounded-md">All</TabsTrigger>
              <TabsTrigger value="recently-added" data-testid="tab-recent" className="rounded-md text-xs md:text-sm">Recently Added</TabsTrigger>
              <TabsTrigger value="recently-updated" data-testid="tab-updated" className="rounded-md text-xs md:text-sm">Recently Updated</TabsTrigger>
              <TabsTrigger value="score" data-testid="tab-score" className="rounded-md">Score</TabsTrigger>
            </TabsList>
          </Tabs> */}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Filter by Letter
          </h3>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {alphabet.map((letter) => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? "default" : "secondary"}
                size="sm"
                className="w-8 h-8 md:w-10 md:h-10 p-0 rounded-lg text-xs md:text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleLetterClick(letter)}
                data-testid={`button-letter-${letter}`}
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {Array.from({ length: 21 }).map((_, idx) => (
              <Skeleton key={idx} className="aspect-[2/3] rounded-xl" />
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => p + 1)}
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
            <p className="text-muted-foreground">No anime found</p>
          </div>
        )}
      </div>
    </div>
  );
}
