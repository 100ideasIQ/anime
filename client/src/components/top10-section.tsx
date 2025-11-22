import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import type { Top10Anime } from "@shared/schema";

interface Top10SectionProps {
  today: Top10Anime[];
  week: Top10Anime[];
  month: Top10Anime[];
}

export function Top10Section({ today, week, month }: Top10SectionProps) {
  const [activeTab, setActiveTab] = useState("today");

  const renderAnimeList = (animes: Top10Anime[]) => (
    <div className="space-y-3">
      {animes.map((anime) => (
        <Link key={anime.id} href={`/anime/${anime.id}`}>
          <div
            className="flex gap-3 cursor-pointer group hover-elevate active-elevate-2 rounded-md p-2 -m-2 transition-all"
            data-testid={`card-top10-${anime.id}`}
          >
            <div className="flex-shrink-0">
              <Badge
                className={`font-bold text-base w-10 h-10 flex items-center justify-center ${
                  anime.rank <= 3
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {anime.rank}
              </Badge>
            </div>

            <div className="flex-shrink-0 w-16 h-20 rounded-md overflow-hidden">
              <img
                src={anime.poster}
                alt={anime.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-top10-title-${anime.id}`}>
                {anime.name}
              </h3>
              {anime.episodes && (
                <div className="flex gap-2 mt-1">
                  {anime.episodes.sub > 0 && (
                    <span className="text-xs text-muted-foreground">SUB: {anime.episodes.sub}</span>
                  )}
                  {anime.episodes.dub > 0 && (
                    <span className="text-xs text-muted-foreground">DUB: {anime.episodes.dub}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Top 10</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="today" data-testid="tab-today">Today</TabsTrigger>
          <TabsTrigger value="week" data-testid="tab-week">Week</TabsTrigger>
          <TabsTrigger value="month" data-testid="tab-month">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          {renderAnimeList(today)}
        </TabsContent>

        <TabsContent value="week" className="mt-4">
          {renderAnimeList(week)}
        </TabsContent>

        <TabsContent value="month" className="mt-4">
          {renderAnimeList(month)}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
