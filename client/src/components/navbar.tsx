import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Menu,
  X,
  Home,
  Compass,
  Library,
  User,
  LogIn,
  MessageSquare,
  Film,
  Tv,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SearchSuggestionsResponse } from "@shared/schema";

interface NavbarProps {
  backgroundImage?: string;
}

export function Navbar({ backgroundImage }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { currentUser, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const { data: suggestions } = useQuery<SearchSuggestionsResponse>({
    queryKey: ["/api/search/suggestions", searchQuery],
    queryFn: async () => {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      return response.json();
    },
    enabled: searchQuery.length > 2 && showSuggestions,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const isHomePage = location === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Background Image for Homepage */}
      {isHomePage && backgroundImage && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover blur-md scale-110 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/70" />
        </div>
      )}

      {/* Solid background for other pages */}
      {!isHomePage && (
        <div className="absolute inset-0 bg-background/98 backdrop-blur-xl border-b border-border/50" />
      )}

      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <div
              className="flex items-center cursor-pointer group"
              data-testid="link-home"
            >
              <img
                src="/logo.png"
                alt="AnimeBite Logo"
                className="
                  h-11 w-auto          /* mobile default */
                  sm:h-12             /* small screens */
                  md:h-13             /* desktop */
                  lg:h-13             /* large desktop */
                  object-contain
                  transition-transform
                  group-hover:scale-105
                "
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-3xl mx-12">
            {/* Nav Links */}
            <div className="flex items-center gap-1">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${location === "/" ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-foreground"}`}
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${location === "/search" ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-foreground"}`}
                  data-testid="button-advanced-search"
                >
                  <Compass className="w-4 h-4" />
                  Explore
                </Button>
              </Link>
              <Link href="/azlist">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${location === "/azlist" ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-foreground"}`}
                  data-testid="link-azlist"
                >
                  <Library className="w-4 h-4" />
                  A-Z List
                </Button>
              </Link>
              <Link href="/movies">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${location === "/movies" ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-foreground"}`}
                >
                  <Film className="w-4 h-4" />
                  Movies
                </Button>
              </Link>
              <Link href="/tv-series">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${location === "/tv-series" ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-foreground"}`}
                >
                  <Tv className="w-4 h-4" />
                  TV Series
                </Button>
              </Link>
              <Link href="/forum">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${location === "/forum" || location.startsWith("/forum/") ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-foreground"}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Forum
                </Button>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search anime..."
                  className="pl-11 pr-4 h-11 bg-background/40 backdrop-blur-sm border-border/50 rounded-full focus:bg-background/60 transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  data-testid="input-search"
                />
              </form>

              {showSuggestions &&
                suggestions?.data?.suggestions &&
                suggestions.data.suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-popover/95 backdrop-blur-xl border border-popover-border rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
                    {suggestions.data.suggestions.map((item) => (
                      <Link key={item.id} href={`/anime/${item.id}`}>
                        <div
                          className="flex gap-3 p-3 hover-elevate active-elevate-2 cursor-pointer rounded-lg"
                          onClick={() => {
                            setShowSuggestions(false);
                            setSearchQuery("");
                          }}
                          data-testid={`suggestion-${item.id}`}
                        >
                          <img
                            src={item.poster}
                            alt={item.name}
                            className="w-12 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-popover-foreground line-clamp-1">
                              {item.name}
                            </h4>
                            {item.jname && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.jname}
                              </p>
                            )}
                            {item.moreInfo && item.moreInfo.length > 0 && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.moreInfo.join(" • ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://discord.gg/V5AWy78VTv"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </Button>
            </a>
            {currentUser && userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.avatarUrl} />
                      <AvatarFallback>
                        {userProfile.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">
                      {userProfile.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      setLocation(`/profile/${userProfile.username}`)
                    }
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Search & Menu */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/search">
              <Button
                variant="ghost"
                size="icon"
              >
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <a
              href="https://discord.gg/V5AWy78VTv"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </Button>
            </a>
            {currentUser && userProfile ? (
              <Link href={`/profile/${userProfile.username}`}>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatarUrl} />
                    <AvatarFallback>
                      {userProfile.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* REBUILT MOBILE SEARCH POPUP */}
        {isMobileSearchOpen && (
          <div className="md:hidden fixed inset-0 z-[100] bg-background">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setShowSuggestions(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold">Search Anime</h2>
              </div>

              {/* Search Input */}
              <div className="p-4">
                <form
                  onSubmit={(e) => {
                    handleSearch(e);
                    setIsMobileSearchOpen(false);
                  }}
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search anime..."
                      className="pl-12 pr-4 h-12 text-base rounded-full"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      autoFocus
                      data-testid="input-search-mobile"
                    />
                  </div>
                </form>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto px-4">
                {showSuggestions &&
                  suggestions?.data?.suggestions &&
                  suggestions.data.suggestions.length > 0 && (
                    <div className="space-y-2 pb-4">
                      {suggestions.data.suggestions.map((item) => (
                        <a
                          key={item.id}
                          href={`/anime/${item.id}`}
                          className="flex gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent transition-colors active:scale-[0.98]"
                          data-testid={`suggestion-${item.id}`}
                        >
                          <img
                            src={item.poster}
                            alt={item.name}
                            className="w-16 h-20 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-foreground line-clamp-2 mb-1">
                              {item.name}
                            </h4>
                            {item.jname && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                                {item.jname}
                              </p>
                            )}
                            {item.moreInfo && item.moreInfo.length > 0 && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.moreInfo.join(" • ")}
                              </p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                {showSuggestions &&
                  searchQuery.length > 2 &&
                  (!suggestions?.data?.suggestions ||
                    suggestions.data.suggestions.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No results found for "{searchQuery}"
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-background/98 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-3 space-y-1">
              {/* Navigation Section */}
              <div className="space-y-1">
                <Link href="/">
                  <button
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      location === "/"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-foreground/80 hover:bg-accent/50 hover:text-foreground active:scale-[0.98]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`p-2 rounded-lg ${location === "/" ? "bg-primary/20" : "bg-accent/50"}`}>
                      <Home className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-base">Home</span>
                  </button>
                </Link>
                
                <Link href="/search">
                  <button
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      location === "/search"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-foreground/80 hover:bg-accent/50 hover:text-foreground active:scale-[0.98]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`p-2 rounded-lg ${location === "/search" ? "bg-primary/20" : "bg-accent/50"}`}>
                      <Compass className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-base">Explore</span>
                  </button>
                </Link>

                <Link href="/azlist">
                  <button
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      location === "/azlist"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-foreground/80 hover:bg-accent/50 hover:text-foreground active:scale-[0.98]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`p-2 rounded-lg ${location === "/azlist" ? "bg-primary/20" : "bg-accent/50"}`}>
                      <Library className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-base">A-Z List</span>
                  </button>
                </Link>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/50 my-2" />

              {/* Categories Section */}
              <div className="space-y-1">
                <Link href="/movies">
                  <button
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      location === "/movies"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-foreground/80 hover:bg-accent/50 hover:text-foreground active:scale-[0.98]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`p-2 rounded-lg ${location === "/movies" ? "bg-primary/20" : "bg-accent/50"}`}>
                      <Film className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-base">Movies</span>
                  </button>
                </Link>

                <Link href="/tv-series">
                  <button
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      location === "/tv-series"
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-foreground/80 hover:bg-accent/50 hover:text-foreground active:scale-[0.98]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`p-2 rounded-lg ${location === "/tv-series" ? "bg-primary/20" : "bg-accent/50"}`}>
                      <Tv className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-base">TV Series</span>
                  </button>
                </Link>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/50 my-2" />

              {/* Community Section */}
              <div className="space-y-1">
                <Link href="/forum">
                  <button
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      location === "/forum" || location.startsWith("/forum/")
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-foreground/80 hover:bg-accent/50 hover:text-foreground active:scale-[0.98]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`p-2 rounded-lg ${location === "/forum" || location.startsWith("/forum/") ? "bg-primary/20" : "bg-accent/50"}`}>
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-base">Forum</span>
                  </button>
                </Link>
              </div>

              {/* Auth Section */}
              {!currentUser && (
                <>
                  <div className="h-px bg-border/50 my-2" />
                  <div className="space-y-2 pt-1">
                    <Link href="/auth/login">
                      <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent/50 hover:bg-accent text-foreground font-medium transition-all duration-200 active:scale-[0.98]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LogIn className="w-5 h-5" />
                        Login
                      </button>
                    </Link>
                    <Link href="/auth/signup">
                      <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-sm transition-all duration-200 active:scale-[0.98]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        Sign Up
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
