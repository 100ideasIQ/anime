import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearch, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Clock,
  TvMinimalPlay,
  Upload,
  Subtitles,
  RotateCcw,
  RotateCw,
  PlayCircle,
} from "lucide-react";
import type {
  AnimeDetail,
  AnimeEpisodes,
  EpisodeServers,
  StreamingLinks,
} from "@shared/schema";
import Hls from "hls.js";
import CommentsSection from "@/components/comments-section";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthContext";

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const epId = new URLSearchParams(searchString).get("ep");

  const episodeId = epId || null;
  const [selectedServer, setSelectedServer] = useState<string>("hd-1");
  const [selectedCategory, setSelectedCategory] = useState<
    "sub" | "dub" | "raw"
  >("sub");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [settingsTab, setSettingsTab] = useState<
    "speed" | "quality" | "subtitles"
  >("speed");
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [availableSubtitles, setAvailableSubtitles] = useState<
    Array<{ label: string; lang: string; src: string }>
  >([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("off");
  const [uploadedSubtitles, setUploadedSubtitles] = useState<
    Array<{ label: string; src: string; lang: string }>
  >([]);

  const [autoPlay, setAutoPlay] = useState(true);
  const [autoNext, setAutoNext] = useState(true);
  const [skipIntro, setSkipIntro] = useState(true);
  const [hasSkippedIntro, setHasSkippedIntro] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  const [hoveredEpisode, setHoveredEpisode] = useState<string | null>(null);
  const [episodeSearch, setEpisodeSearch] = useState("");

  const { currentUser } = useAuth();

  const { data: animeData } = useQuery<AnimeDetail>({
    queryKey: ["/api/anime", id],
    enabled: !!id,
  });

  const { data: episodesData } = useQuery<AnimeEpisodes>({
    queryKey: ["/api/anime", id, "episodes"],
    enabled: !!id,
  });

  const { data: serversData } = useQuery<EpisodeServers>({
    queryKey: ["/api/episode/servers", episodeId],
    queryFn: async () => {
      const response = await fetch(
        `/api/episode/servers?animeEpisodeId=${episodeId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch servers");
      return response.json();
    },
    enabled: !!episodeId,
  });

  const { data: streamingData } = useQuery<StreamingLinks>({
    queryKey: [
      "/api/episode/sources",
      episodeId,
      selectedServer,
      selectedCategory,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        animeEpisodeId: episodeId || "",
        server: selectedServer,
        category: selectedCategory,
      });
      const response = await fetch(`/api/episode/sources?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch streaming sources");
      return response.json();
    },
    enabled: !!episodeId && !!selectedServer,
    retry: 2,
  });

  const currentEpisode = episodesData?.data?.episodes?.find(
    (ep) => ep.episodeId === episodeId,
  );
  const currentEpisodeIndex =
    episodesData?.data?.episodes?.findIndex(
      (ep) => ep.episodeId === episodeId,
    ) ?? -1;
  const previousEpisode =
    currentEpisodeIndex > 0
      ? episodesData?.data?.episodes[currentEpisodeIndex - 1]
      : null;
  const nextEpisode =
    episodesData?.data?.episodes &&
    currentEpisodeIndex < episodesData.data.episodes.length - 1
      ? episodesData.data.episodes[currentEpisodeIndex + 1]
      : null;

  const filteredEpisodes = episodesData?.data?.episodes?.filter((episode) => {
    if (!episodeSearch) return true;
    const searchLower = episodeSearch.toLowerCase();
    return (
      episode.number.toString().includes(searchLower) ||
      episode.title?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    if (serversData?.data) {
      const availableServers = serversData.data[selectedCategory];
      if (availableServers && availableServers.length > 0) {
        const preferredServer =
          availableServers.find(
            (s) => s.serverName === "HD-1" || s.serverName === "hd-1",
          ) || availableServers[0];
        setSelectedServer(preferredServer.serverName.toLowerCase());
      }
    }
  }, [serversData, selectedCategory]);

  // Convert SRT to VTT format
  const convertSrtToVtt = (srtContent: string): string => {
    if (srtContent.trim().startsWith("WEBVTT")) {
      return srtContent;
    }

    let vtt = "WEBVTT\n\n";
    const lines = srtContent.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip sequence numbers
      if (/^\d+$/.test(line)) {
        continue;
      }

      // Convert timestamp format from , to .
      if (line.includes("-->")) {
        vtt += line.replace(/,/g, ".") + "\n";
      } else if (line) {
        vtt += line + "\n";
      } else {
        vtt += "\n";
      }
    }

    return vtt;
  };

  useEffect(() => {
    if (!videoRef.current || !streamingData?.data?.sources?.[0]?.url) return;

    const video = videoRef.current;
    const sourceUrl = streamingData.data.sources[0].url;

    setBuffering(true);
    setHasSkippedIntro(false);
    setHasAutoPlayed(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Remove all existing tracks
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        debug: false,
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        setBuffering(false);

        // Resume from saved timestamp
        if (currentUser && id && episodeId) {
          const { getProgress } = await import("@/lib/firestore-utils");
          const progress = await getProgress(currentUser.uid, id);
          if (
            progress &&
            progress.lastEpisodeId === episodeId &&
            progress.lastTimestamp > 0
          ) {
            video.currentTime = progress.lastTimestamp;
          }
        }

        if (autoPlay && !hasAutoPlayed) {
          video.play().then(() => {
            setHasAutoPlayed(true);
          }).catch(() => {
            // Autoplay was blocked, user needs to interact
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setBuffering(false);
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      video.addEventListener("loadedmetadata", async () => {
        setBuffering(false);

        // Resume from saved timestamp
        if (currentUser && id && episodeId) {
          const { getProgress } = await import("@/lib/firestore-utils");
          const progress = await getProgress(currentUser.uid, id);
          if (
            progress &&
            progress.lastEpisodeId === episodeId &&
            progress.lastTimestamp > 0
          ) {
            video.currentTime = progress.lastTimestamp;
          }
        }

        if (autoPlay && !hasAutoPlayed) {
          video.play().then(() => {
            setHasAutoPlayed(true);
          }).catch(() => {
            // Autoplay was blocked, user needs to interact
          });
        }
      });
    }

    const subs: Array<{ label: string; lang: string; src: string }> = [];
    if (streamingData.data.tracks) {
      streamingData.data.tracks.forEach((track, index) => {
        if (
          track.file &&
          track.file !== "/api/proxy/stream?url=undefined" &&
          track.kind === "captions"
        ) {
          const trackElement = document.createElement("track");
          trackElement.kind = "subtitles";
          trackElement.src = track.file;
          trackElement.srclang =
            track.lang?.toLowerCase().replace(/\s+/g, "-") || `lang-${index}`;
          trackElement.label =
            track.label || track.lang || `Subtitle ${index + 1}`;
          trackElement.default = false;
          video.appendChild(trackElement);

          subs.push({
            label: track.label || track.lang || `Subtitle ${index + 1}`,
            lang: trackElement.srclang,
            src: track.file,
          });
        }
      });
    }
    setAvailableSubtitles(subs);

    // Re-add uploaded subtitles
    uploadedSubtitles.forEach((sub) => {
      const trackElement = document.createElement("track");
      trackElement.kind = "subtitles";
      trackElement.src = sub.src;
      trackElement.srclang = sub.lang;
      trackElement.label = sub.label;
      trackElement.default = false;
      video.appendChild(trackElement);
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamingData, autoPlay]);

  useEffect(() => {
    if (!videoRef.current || !streamingData?.data?.tracks) return;

    const video = videoRef.current;
    const tracks = Array.from(video.textTracks);

    tracks.forEach((track) => {
      if (currentSubtitle === "off") {
        track.mode = "hidden";
      } else if (
        track.label === currentSubtitle ||
        track.language === currentSubtitle
      ) {
        track.mode = "showing";
      } else {
        track.mode = "hidden";
      }
    });
  }, [currentSubtitle, streamingData?.data?.tracks]);

  const handleSubtitleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !videoRef.current) return;

    const video = videoRef.current;
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;

      // Convert to VTT format
      const vttContent = convertSrtToVtt(content);
      const blob = new Blob([vttContent], { type: "text/vtt" });
      const url = URL.createObjectURL(blob);

      const trackElement = document.createElement("track");
      trackElement.kind = "subtitles";
      trackElement.src = url;
      trackElement.srclang = "custom-" + Date.now();
      trackElement.label = file.name.replace(/\.(srt|vtt|ass)$/i, "");
      trackElement.default = false;
      video.appendChild(trackElement);

      const newSub = {
        label: trackElement.label,
        src: url,
        lang: trackElement.srclang,
      };

      setUploadedSubtitles((prev) => [...prev, newSub]);
      setCurrentSubtitle(trackElement.label);
      setShowSettings(false);

      // Force the track to show
      trackElement.addEventListener("load", () => {
        const tracks = Array.from(video.textTracks);
        tracks.forEach((track) => {
          if (track.label === trackElement.label) {
            track.mode = "showing";
          } else {
            track.mode = "hidden";
          }
        });
      });
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!videoRef.current || !skipIntro || hasSkippedIntro) return;

    const video = videoRef.current;
    const introStart = streamingData?.data?.intro?.start;
    const introEnd = streamingData?.data?.intro?.end;

    if (introStart !== undefined && introEnd !== undefined) {
      const handleTimeUpdate = () => {
        if (
          video.currentTime >= introStart &&
          video.currentTime < introEnd &&
          !hasSkippedIntro
        ) {
          video.currentTime = introEnd;
          setHasSkippedIntro(true);
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      return () => video.removeEventListener("timeupdate", handleTimeUpdate);
    }
  }, [streamingData, skipIntro, hasSkippedIntro]);

  // Track progress and watch time
  useEffect(() => {
    if (
      !videoRef.current ||
      !currentUser ||
      !id ||
      !episodeId ||
      !currentEpisode ||
      !animeData
    )
      return;

    const video = videoRef.current;
    let progressInterval: NodeJS.Timeout;
    let lastSavedTime = video.currentTime;

    const saveProgress = async () => {
      const { updateProgress, updateWatchTime } = await import(
        "@/lib/firestore-utils"
      );
      const currentVideoTime = video.currentTime;
      const watchedSeconds = Math.max(0, currentVideoTime - lastSavedTime);

      // Update progress
      await updateProgress(
        currentUser.uid,
        id,
        currentEpisode.number,
        currentVideoTime,
        false,
        animeData.data.anime.info.name,
        animeData.data.anime.info.poster,
        episodeId,
      );

      // Update total watch time
      if (watchedSeconds > 0 && watchedSeconds < 15) {
        // Only count if reasonable (prevent seeking issues)
        await updateWatchTime(currentUser.uid, watchedSeconds);
      }

      lastSavedTime = currentVideoTime;
    };

    progressInterval = setInterval(() => {
      if (!video.paused && video.currentTime > 0) {
        saveProgress();
      }
    }, 10000); // Save every 10 seconds

    // Save on unmount
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (!video.paused && video.currentTime > 0) {
        saveProgress();
      }
    };
  }, [currentUser, id, episodeId, currentEpisode, animeData]);

  useEffect(() => {
    if (!videoRef.current || !autoNext || !nextEpisode) return;

    const video = videoRef.current;
    const handleEnded = () => {
      if (autoNext && nextEpisode) {
        setLocation(`/watch/${id}?ep=${nextEpisode.episodeId}`);
      }
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [autoNext, nextEpisode, id, setLocation]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleWaiting = () => setBuffering(true);
    const handleCanPlay = () => setBuffering(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleVolumeSliderChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        videoRef.current.muted = false;
      }
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds),
      );
    }
  };

  const handleSeek = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (videoRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      setHoveredTime(pos * duration);
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleSeek(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && progressBarRef.current && videoRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = Math.max(
          0,
          Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        videoRef.current.currentTime = pos * duration;
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, duration]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const goToPrevious = () => {
    if (previousEpisode) {
      setLocation(`/watch/${id}?ep=${previousEpisode.episodeId}`);
    }
  };

  const goToNext = () => {
    if (nextEpisode) {
      setLocation(`/watch/${id}?ep=${nextEpisode.episodeId}`);
    }
  };

  if (!episodeId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 text-center max-w-md shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2">
            No Episode Selected
          </h1>
          <p className="text-gray-400 mb-6">
            Please select an episode to watch
          </p>
          <Link href={`/anime/${id}`}>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-0">
              Go to Anime Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              <div
                ref={containerRef}
                className="relative aspect-video bg-black group"
                onMouseMove={resetControlsTimeout}
                onMouseLeave={() =>
                  isPlaying && !isDragging && setShowControls(false)
                }
              >
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  onClick={togglePlay}
                  crossOrigin="anonymous"
                />

                {buffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  </div>
                )}

                {!isPlaying && !buffering && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <button
                      onClick={togglePlay}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 flex items-center justify-center transition-all hover:scale-110 shadow-2xl shadow-purple-500/50"
                    >
                      <Play
                        className="w-10 h-10 text-white ml-1"
                        fill="white"
                      />
                    </button>
                  </div>
                )}

                <div
                  className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-200 z-20 ${showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <div className="px-4 pb-4 pt-12">
                    <div
                      ref={progressBarRef}
                      className="w-full h-2 bg-white/10 backdrop-blur-sm rounded-full cursor-pointer mb-4 group/progress relative"
                      onMouseDown={handleProgressMouseDown}
                      onMouseMove={handleProgressHover}
                      onMouseLeave={() => setHoveredTime(null)}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-purple-500/50"></div>
                      </div>
                      {hoveredTime !== null && (
                        <div
                          className="absolute bottom-full mb-2 -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded"
                          style={{ left: `${(hoveredTime / duration) * 100}%` }}
                        >
                          {formatTime(hoveredTime)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={togglePlay}
                          className="hover:text-purple-400 transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6" />
                          )}
                        </button>

                        <button
                          onClick={() => skip(-10)}
                          className="hover:text-purple-400 transition-colors"
                          title="Rewind 10 seconds"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => skip(10)}
                          className="hover:text-purple-400 transition-colors"
                          title="Forward 10 seconds"
                        >
                          <RotateCw className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 group/volume">
                          <button
                            onClick={toggleMute}
                            className="hover:text-purple-400 transition-colors"
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </button>
                          <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300">
                            <Slider
                              value={[isMuted ? 0 : volume]}
                              max={1}
                              step={0.01}
                              onValueChange={handleVolumeSliderChange}
                              className="w-24"
                            />
                          </div>
                        </div>

                        <div className="text-sm font-medium">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="hover:text-purple-400 transition-colors"
                          >
                            <Settings className="w-5 h-5" />
                          </button>

                          {showSettings && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setShowSettings(false)}
                              />
                              <div className="absolute bottom-full right-0 mb-3 bg-black/80 backdrop-blur-xl rounded-lg overflow-hidden min-w-[280px] shadow-2xl border border-purple-500/30 z-40">
                                <div className="flex border-b border-purple-500/20">
                                  <button
                                    onClick={() => setSettingsTab("speed")}
                                    className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
                                      settingsTab === "speed"
                                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                                  >
                                    Speed
                                  </button>
                                  <button
                                    onClick={() => setSettingsTab("quality")}
                                    className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
                                      settingsTab === "quality"
                                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                                  >
                                    Quality
                                  </button>
                                  <button
                                    onClick={() => setSettingsTab("subtitles")}
                                    className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
                                      settingsTab === "subtitles"
                                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                                  >
                                    Subtitles
                                  </button>
                                </div>

                                <div className="p-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                                  {settingsTab === "speed" && (
                                    <div className="space-y-2">
                                      {[
                                        0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2,
                                      ].map((speed) => (
                                        <button
                                          key={speed}
                                          onClick={() =>
                                            setPlaybackSpeed(speed)
                                          }
                                          className={`w-full px-3 py-2 rounded text-sm text-left transition-all ${
                                            playbackSpeed === speed
                                              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                                              : "text-gray-300 hover:bg-white/10"
                                          }`}
                                        >
                                          {speed === 1 ? "Normal" : `${speed}x`}
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {settingsTab === "quality" && (
                                    <div className="space-y-2">
                                      <button className="w-full px-3 py-2 rounded text-sm text-left bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                                        Auto
                                      </button>
                                      <button className="w-full px-3 py-2 rounded text-sm text-left text-gray-300 hover:bg-white/10">
                                        1080p
                                      </button>
                                      <button className="w-full px-3 py-2 rounded text-sm text-left text-gray-300 hover:bg-white/10">
                                        720p
                                      </button>
                                      <button className="w-full px-3 py-2 rounded text-sm text-left text-gray-300 hover:bg-white/10">
                                        480p
                                      </button>
                                    </div>
                                  )}

                                  {settingsTab === "subtitles" && (
                                    <div className="space-y-2">
                                      <button
                                        onClick={() =>
                                          fileInputRef.current?.click()
                                        }
                                        className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded text-sm text-white transition-all"
                                      >
                                        <Upload className="w-4 h-4" />
                                        Upload Subtitle
                                      </button>
                                      <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".srt,.vtt,.ass"
                                        onChange={handleSubtitleUpload}
                                        className="hidden"
                                      />

                                      <button
                                        onClick={() =>
                                          setCurrentSubtitle("off")
                                        }
                                        className={`w-full px-3 py-2 rounded text-sm text-left transition-all flex items-center gap-2 ${
                                          currentSubtitle === "off"
                                            ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                                            : "text-gray-300 hover:bg-white/10"
                                        }`}
                                      >
                                        <X className="w-4 h-4" />
                                        Off
                                      </button>

                                      {availableSubtitles.map((sub, index) => (
                                        <button
                                          key={index}
                                          onClick={() =>
                                            setCurrentSubtitle(sub.label)
                                          }
                                          className={`w-full px-3 py-2 rounded text-sm text-left transition-all flex items-center gap-2 ${
                                            currentSubtitle === sub.label
                                              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                                              : "text-gray-300 hover:bg-white/10"
                                          }`}
                                        >
                                          <Subtitles className="w-4 h-4" />
                                          {sub.label}
                                        </button>
                                      ))}

                                      {uploadedSubtitles.map((sub, index) => (
                                        <button
                                          key={`uploaded-${index}`}
                                          onClick={() =>
                                            setCurrentSubtitle(sub.label)
                                          }
                                          className={`w-full px-3 py-2 rounded text-sm text-left transition-all flex items-center gap-2 ${
                                            currentSubtitle === sub.label
                                              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                                              : "text-gray-300 hover:bg-white/10"
                                          }`}
                                        >
                                          <Upload className="w-4 h-4" />
                                          {sub.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          onClick={toggleFullscreen}
                          className="hover:text-purple-400 transition-colors"
                        >
                          {isFullscreen ? (
                            <Minimize className="w-5 h-5" />
                          ) : (
                            <Maximize className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-5 flex-wrap">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <span className="text-sm text-gray-300 group-hover:text-purple-400 transition-colors">
                      Auto Play
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={autoPlay}
                        onChange={(e) => setAutoPlay(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-purple-700 transition-all duration-300"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <span className="text-sm text-gray-300 group-hover:text-purple-400 transition-colors">
                      Auto Next
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={autoNext}
                        onChange={(e) => setAutoNext(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-purple-700 transition-all duration-300"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <span className="text-sm text-gray-300 group-hover:text-purple-400 transition-colors">
                      Skip Intro
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={skipIntro}
                        onChange={(e) => setSkipIntro(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-purple-700 transition-all duration-300"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={goToPrevious}
                    disabled={!previousEpisode}
                    className="gap-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-purple-500/20 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={goToNext}
                    disabled={!nextEpisode}
                    className="gap-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white disabled:opacity-30 border-0"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-xl p-5 border border-purple-500/20 shadow-lg">
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-purple-500/20">
                  <TvMinimalPlay className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">
                      You are watching
                    </div>
                    <div className="text-lg font-bold text-white">
                      Episode {currentEpisode?.number}
                    </div>
                  </div>
                </div>

                {serversData?.data?.sub && serversData.data.sub.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                        SUB
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {serversData.data.sub.length} available
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {serversData.data.sub.map((server) => (
                        <Button
                          key={server.serverId}
                          size="sm"
                          onClick={() => {
                            setSelectedCategory("sub");
                            setSelectedServer(server.serverName.toLowerCase());
                          }}
                          className={`${
                            selectedServer ===
                              server.serverName.toLowerCase() &&
                            selectedCategory === "sub"
                              ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
                              : "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-gray-300 border-purple-500/20"
                          }`}
                        >
                          {server.serverName}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {serversData?.data?.dub && serversData.data.dub.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                        DUB
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {serversData.data.dub.length} available
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {serversData.data.dub.map((server) => (
                        <Button
                          key={server.serverId}
                          size="sm"
                          onClick={() => {
                            setSelectedCategory("dub");
                            setSelectedServer(server.serverName.toLowerCase());
                          }}
                          className={`${
                            selectedServer ===
                              server.serverName.toLowerCase() &&
                            selectedCategory === "dub"
                              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0"
                              : "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-gray-300 border-purple-500/20"
                          }`}
                        >
                          {server.serverName}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-white">
                      Downloads
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Download links are currently unavailable.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-xl p-5 border border-purple-500/20 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={animeData?.data?.anime?.info?.poster}
                  alt={animeData?.data?.anime?.info?.name}
                  className="w-28 h-40 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {animeData?.data?.anime?.info?.name}
                  </h2>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {animeData?.data?.anime?.info?.stats?.rating && (
                      <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                        ⭐ {animeData.data.anime.info.stats.rating}
                      </Badge>
                    )}
                    {animeData?.data?.anime?.info?.stats?.quality && (
                      <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                        {animeData.data.anime.info.stats.quality}
                      </Badge>
                    )}
                    {animeData?.data?.anime?.info?.stats?.type && (
                      <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                        {animeData.data.anime.info.stats.type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                    {animeData?.data?.anime?.info?.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {streamingData?.data?.anilistID && (
                      <a
                        href={`https://anilist.co/anime/${streamingData.data.anilistID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#02a9ff]/10 border border-[#02a9ff]/30 text-[#02a9ff] text-xs font-medium hover:bg-[#02a9ff]/20 transition-all"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M6.361 2.943L0 21.056h4.942l1.077-3.133H11.4l1.052 3.133H22.9c.71 0 1.1-.392 1.1-1.101V17.53c0-.71-.39-1.101-1.1-1.101h-6.483V4.045c0-.71-.392-1.102-1.101-1.102h-2.422c-.71 0-1.101.392-1.101 1.102v1.064l-.758-2.166zm2.324 5.948l1.688 5.018H7.144z" />
                        </svg>
                        AniList
                      </a>
                    )}
                    {streamingData?.data?.malID && (
                      <a
                        href={`https://myanimelist.net/anime/${streamingData.data.malID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e51a2]/10 border border-[#2e51a2]/30 text-[#2e51a2] text-xs font-medium hover:bg-[#2e51a2]/20 transition-all"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M8.273 7.247v8.423l-2.103-.003v-5.216l-2.03 5.219-2.045-5.219v5.216H0V7.247h2.135l2.07 5.240 2.068-5.240zm4.546 0v8.423H11.05V7.247zm3.812 0l2.035 5.239 2.069-5.239h2.103l.002 8.423h-1.879v-5.216l-2.047 5.219-2.031-5.219v5.216h-2.135V7.247zm-7.149 8.423h-2.135V7.247h2.135z" />
                        </svg>
                        MAL
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {nextEpisode && (
                <div className="mt-5 pt-5 border-t border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-white">
                      Next Episode
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Episode {nextEpisode.number}
                    {nextEpisode.title && ` - ${nextEpisode.title}`}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-1 space-y-4">
            <div className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4">Episodes</h2>
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search episodes..."
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                />
              </div>
              <div className="grid grid-cols-5 xl:grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {filteredEpisodes?.map((episode) => (
                  <Link
                    key={episode.episodeId}
                    href={`/watch/${id}?ep=${episode.episodeId}`}
                  >
                    <div
                      className={`aspect-square rounded-lg cursor-pointer transition-all flex items-center justify-center relative group/episode ${
                        episode.episodeId === episodeId
                          ? "bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-500/30"
                          : "bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-purple-900/30 hover:to-purple-800/30 border border-purple-500/10"
                      }`}
                      onMouseEnter={() => setHoveredEpisode(episode.episodeId)}
                      onMouseLeave={() => setHoveredEpisode(null)}
                    >
                      <span
                        className={`text-base font-bold transition-opacity ${
                          episode.episodeId === episodeId
                            ? "text-white"
                            : "text-gray-300"
                        } ${hoveredEpisode === episode.episodeId ? "opacity-0" : "opacity-100"}`}
                      >
                        {episode.number}
                      </span>

                      {hoveredEpisode === episode.episodeId &&
                        episode.episodeId !== episodeId && (
                          <div className="absolute inset-0 flex items-center justify-center bg-purple-600/20 backdrop-blur-sm rounded-lg">
                            <PlayCircle className="w-8 h-8 text-purple-400" />
                          </div>
                        )}

                      {episode.isFiller && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-lg"></div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {animeData?.data?.relatedAnimes &&
              animeData.data.relatedAnimes.length > 0 && (
                <div className="hidden xl:block bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20 shadow-lg">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                    Related Anime
                  </h2>
                  <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                    {animeData.data.relatedAnimes.slice(0, 10).map((anime) => (
                      <Link
                        key={anime.id}
                        href={`/anime/${anime.id}`}
                        className="block"
                      >
                        <div className="group flex gap-3 rounded-lg bg-white/5 hover:bg-purple-900/20 border border-purple-500/10 hover:border-purple-500/40 transition-all duration-300 cursor-pointer p-2.5 hover:-translate-y-0.5">
                          <div className="relative flex-shrink-0 w-10 h-14 rounded-md overflow-hidden ring-1 ring-white/10 group-hover:ring-purple-500/50 transition-all">
                            <img
                              src={anime.poster}
                              alt={anime.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <h3 className="text-white text-xs font-semibold line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                              {anime.name}
                            </h3>

                            <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                              {anime.stats?.type && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 text-[10px] font-medium border border-purple-400/30">
                                  {anime.stats.type}
                                </span>
                              )}
                              {anime.stats?.rating && (
                                <span className="px-1.5 py-0.5 rounded bg-yellow-500/30 text-yellow-200 text-[10px] font-medium border border-yellow-400/30 flex items-center gap-0.5">
                                  <span>⭐</span> {anime.stats.rating}
                                </span>
                              )}
                              {anime.stats?.quality && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-200 text-[10px] font-medium border border-purple-500/30">
                                  {anime.stats.quality}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                              {anime.stats?.episodes?.sub > 0 && (
                                <span className="text-purple-300 font-medium">
                                  <span className="text-purple-400">SUB</span>{" "}
                                  {anime.stats.episodes.sub}
                                </span>
                              )}
                              {anime.stats?.episodes?.sub > 0 &&
                                anime.stats?.episodes?.dub > 0 && (
                                  <span className="text-gray-500">•</span>
                                )}
                              {anime.stats?.episodes?.dub > 0 && (
                                <span className="text-green-300 font-medium">
                                  <span className="text-green-400">DUB</span>{" "}
                                  {anime.stats.episodes.dub}
                                </span>
                              )}
                              {anime.stats?.duration && (
                                <>
                                  {(anime.stats?.episodes?.sub > 0 ||
                                    anime.stats?.episodes?.dub > 0) && (
                                    <span className="text-gray-500">•</span>
                                  )}
                                  <span className="text-gray-400">
                                    {anime.stats.duration}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {animeData?.data?.relatedAnimes &&
            animeData.data.relatedAnimes.length > 0 && (
              <div className="xl:hidden bg-black/40 backdrop-blur-xl rounded-xl p-5 border border-purple-500/20 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">
                  Related Anime
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {animeData.data.relatedAnimes.slice(0, 4).map((anime) => (
                    <Link key={anime.id} href={`/anime/${anime.id}`}>
                      <div className="group relative aspect-[2/3] overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
                        <img
                          src={anime.poster}
                          alt={anime.name}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                          <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-full p-3 shadow-2xl hover:scale-110 transition-transform duration-200">
                            <Play className="w-6 h-6 text-black fill-current" />
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                          <h3 className="text-white font-bold text-sm line-clamp-2 drop-shadow-2xl tracking-tight leading-tight">
                            {anime.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          <div className="xl:col-span-4 bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 shadow-lg mt-6">
            <CommentsSection animeId={id || ""} episodeId={episodeId || ""} />
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }

        video::cue {
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 1.2em;
          font-family: Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}
