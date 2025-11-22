import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { TrendingAnime } from "@shared/schema";

interface TrendingSidebarProps {
  animes: TrendingAnime[];
}

export function TrendingSidebar({ animes }: TrendingSidebarProps) {
  if (!animes || animes.length === 0) return null;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Trending Now</h2>
      </div>

      <div className="space-y-3">
        {animes.slice(0, 10).map((anime) => (
          <Link key={anime.id} href={`/anime/${anime.id}`}>
            <div
              className="flex gap-3 cursor-pointer group hover-elevate active-elevate-2 rounded-md p-2 -m-2 transition-all"
              data-testid={`card-trending-${anime.id}`}
            >
              <div className="flex-shrink-0">
                <Badge className="bg-primary/90 text-primary-foreground font-bold w-8 h-8 flex items-center justify-center">
                  {anime.rank}
                </Badge>
              </div>

              <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden">
                <img
                  src={anime.poster}
                  alt={anime.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-trending-title-${anime.id}`}>
                  {anime.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
