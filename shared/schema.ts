import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// AnimeBite API Response Types

export interface AnimeSpotlight {
  rank: number;
  id: string;
  name: string;
  jname?: string;
  description: string;
  poster: string;
  episodes?: {
    sub: number;
    dub: number;
  };
  type?: string;
  otherInfo?: string[];
}

export interface AnimeInfo {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  description?: string;
  stats?: {
    rating?: string;
    quality?: string;
    episodes?: {
      sub: number;
      dub: number;
    };
    type?: string;
    duration?: string;
  };
  promotionalVideos?: Array<{
    title: string;
    source: string;
    thumbnail: string;
  }>;
  charactersVoiceActors?: Array<{
    character: {
      id: string;
      poster: string;
      name: string;
      cast: string;
    };
    voiceActor: {
      id: string;
      poster: string;
      name: string;
      cast: string;
    };
  }>;
}

export interface TrendingAnime {
  rank: number;
  name: string;
  id: string;
  poster: string;
}

export interface LatestEpisode {
  id: string;
  name: string;
  poster: string;
  duration: string;
  type: string;
  rating: string;
  episodes: {
    sub: number;
    dub: number;
  };
}

export interface Top10Anime {
  id: string;
  rank: number;
  name: string;
  poster: string;
  episodes: {
    sub: number;
    dub: number;
  };
}

export interface HomeData {
  success: boolean;
  data: {
    spotlightAnimes: AnimeSpotlight[];
    trendingAnimes: TrendingAnime[];
    latestEpisodeAnimes: LatestEpisode[];
    topUpcomingAnimes: AnimeInfo[];
    top10Animes: {
      today: Top10Anime[];
      week: Top10Anime[];
      month: Top10Anime[];
    };
    topAiringAnimes: AnimeInfo[];
    genres: string[];
  };
}

export interface AnimeDetail {
  success: boolean;
  data: {
    anime: {
      info: {
        id: string;
        name: string;
        poster: string;
        description: string;
        stats: {
          rating: string;
          quality: string;
          episodes: {
            sub: number;
            dub: number;
          };
          type: string;
          duration: string;
        };
        promotionalVideos: Array<{
          title: string;
          source: string;
          thumbnail: string;
        }>;
        charactersVoiceActors: Array<{
          character: {
            id: string;
            poster: string;
            name: string;
            cast: string;
          };
          voiceActor: {
            id: string;
            poster: string;
            name: string;
            cast: string;
          };
        }>;
      };
      moreInfo: {
        [key: string]: string | string[];
      };
    };
    seasons: Array<{
      id: string;
      name: string;
      title: string;
      poster: string;
      isCurrent: boolean;
    }>;
    mostPopularAnimes: AnimeInfo[];
    relatedAnimes: AnimeInfo[];
    recommendedAnimes: AnimeInfo[];
  };
}

export interface Episode {
  title: string;
  episodeId: string;
  number: number;
  isFiller: boolean;
}

export interface AnimeEpisodes {
  success: boolean;
  data: {
    totalEpisodes: number;
    episodes: Episode[];
  };
}

export interface EpisodeServer {
  serverName: string;
  serverId: number;
}

export interface EpisodeServers {
  success: boolean;
  data: {
    sub: EpisodeServer[];
    dub: EpisodeServer[];
    raw: EpisodeServer[];
    episodeId: string;
    episodeNo: number;
  };
}

export interface StreamingSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface StreamingLinks {
  success: boolean;
  data: {
    tracks: Array<{
      file: string;
      label: string;
      kind: string;
      lang?: string;
      default?: boolean;
    }>;
    intro: {
      start: number;
      end: number;
    };
    outro: {
      start: number;
      end: number;
    };
    sources: StreamingSource[];
    anilistID: number;
    malID: number;
  };
}

export interface SearchResult {
  id: string;
  name: string;
  poster: string;
  duration: string;
  type: string;
  rating: string;
  episodes: {
    sub: number;
    dub: number;
  };
}

export interface SearchResponse {
  success: boolean;
  data: {
    animes: SearchResult[];
    mostPopularAnimes: AnimeInfo[];
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
    searchQuery: string;
    searchFilters: {
      [key: string]: string | string[];
    };
  };
}

export interface SearchSuggestion {
  id: string;
  name: string;
  poster: string;
  jname: string;
  moreInfo: string[];
}

export interface SearchSuggestionsResponse {
  success: boolean;
  data: {
    suggestions: SearchSuggestion[];
  };
}

export interface ScheduleItem {
  id: string;
  time: string;
  name: string;
  jname: string;
  poster?: string;
  airingTimestamp?: number;
  episode?: number;
}

export interface ScheduleResponse {
  success: boolean;
  data: {
    scheduledAnimes: ScheduleItem[];
  };
}

export interface CategoryAnime {
  id: string;
  name: string;
  poster: string;
  duration: string;
  type: string;
  rating: string;
  episodes: {
    sub: number;
    dub: number;
  };
}

export interface CategoryResponse {
  success: boolean;
  data: {
    animes: CategoryAnime[];
    genres: string[];
    top10Animes: {
      today: Top10Anime[];
      week: Top10Anime[];
      month: Top10Anime[];
    };
    category: string;
    currentPage: number;
    hasNextPage: boolean;
    totalPages: number;
  };
}

export interface NextEpisodeScheduleItem {
  id: string;
  name: string;
  episodeNumber: number;
  airingTime: string;
  dayOfWeek: string;
}

export interface NextEpisodeScheduleResponse {
  success: boolean;
  data: {
    schedules: NextEpisodeScheduleItem[];
  };
}

// Added interface for RelatedAnime
export interface RelatedAnime {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  type?: string;
  episodes?: {
    sub: number;
    dub: number;
  };
}