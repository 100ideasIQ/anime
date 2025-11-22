import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import AnimeDetailPage from "@/pages/anime-detail";
import WatchPage from "@/pages/watch";
import SearchPage from "@/pages/search";
import CategoryPage from "@/pages/category";
import AZListPage from "@/pages/azlist";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ResetPassword from "@/pages/reset-password";
import Profile from "@/pages/profile";
import Forum from "@/pages/forum";
import ForumPostPage from "@/pages/forum-post";
import Movies from "@/pages/movies";
import TVSeries from "@/pages/tv-series";
import ContactPage from "@/pages/contact";
import ReportIssuePage from "@/pages/report-issue";
import FAQPage from "@/pages/faq";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import DMCAPage from "@/pages/dmca";
import DisclaimerPage from "@/pages/disclaimer";
import AboutPage from "@/pages/about";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { HomeData } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/anime/:id" component={AnimeDetailPage} />
      <Route path="/watch/:id" component={WatchPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/category/:category" component={CategoryPage} />
      <Route path="/genre/:category" component={CategoryPage} />
      <Route path="/azlist" component={AZListPage} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/signup" component={Signup} />
      <Route path="/auth/reset" component={ResetPassword} />
      <Route path="/profile/:username?" component={Profile} />
      <Route path="/forum" component={Forum} />
      <Route path="/forum/post/:id" component={ForumPostPage} />
      <Route path="/forum/:id" component={ForumPostPage} />
      <Route path="/movies" component={Movies} />
      <Route path="/tv-series" component={TVSeries} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/report-issue" component={ReportIssuePage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/dmca" component={DMCAPage} />
      <Route path="/disclaimer" component={DisclaimerPage} />
      <Route path="/about" component={AboutPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);

  const { data: homeData } = useQuery<HomeData>({
    queryKey: ["/api/home"],
    enabled: location === "/",
  });

  useEffect(() => {
    if (location === "/" && homeData?.data?.spotlightAnimes?.[0]) {
      setBackgroundImage(homeData.data.spotlightAnimes[0].poster);
    } else {
      setBackgroundImage(undefined);
    }
  }, [location, homeData]);

  useEffect(() => {
    // Check if we're in a webview or embedded context
    const isEmbedded = window.self !== window.top;
    const isSocialMediaWebview = /FB|FBAN|Instagram|Twitter|WhatsApp|Telegram|Discord|Reddit/i.test(navigator.userAgent);
    const isReplit = window.location.hostname.includes('replit');
    
    // Skip protection if in embedded context or social media webview
    if (isEmbedded || isSocialMediaWebview || isReplit) {
      return;
    }

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow right-click on social media embeds
      if (target.closest('iframe[src*="twitter.com"]') ||
          target.closest('iframe[src*="facebook.com"]') ||
          target.closest('iframe[src*="telegram.org"]') ||
          target.closest('iframe[src*="whatsapp.com"]') ||
          target.closest('iframe[src*="discord.com"]') ||
          target.closest('iframe[src*="reddit.com"]') ||
          target.closest('iframe[src*="x.com"]')) {
        return;
      }
      e.preventDefault();
    };

    // Prevent text selection and copy
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Allow copy in social media embeds
      if (target.closest('iframe[src*="twitter.com"]') ||
          target.closest('iframe[src*="facebook.com"]') ||
          target.closest('iframe[src*="telegram.org"]') ||
          target.closest('iframe[src*="whatsapp.com"]') ||
          target.closest('iframe[src*="discord.com"]') ||
          target.closest('iframe[src*="reddit.com"]') ||
          target.closest('iframe[src*="x.com"]')) {
        return;
      }
      e.preventDefault();
    };

    // Prevent keyboard shortcuts for copy (Ctrl+C, Cmd+C)
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Allow shortcuts in social media embeds
      if (target.closest('iframe[src*="twitter.com"]') ||
          target.closest('iframe[src*="facebook.com"]') ||
          target.closest('iframe[src*="telegram.org"]') ||
          target.closest('iframe[src*="whatsapp.com"]') ||
          target.closest('iframe[src*="discord.com"]') ||
          target.closest('iframe[src*="reddit.com"]') ||
          target.closest('iframe[src*="x.com"]')) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
      }
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J (DevTools)
      if (e.key === 'F12' || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
        e.preventDefault();
      }
    };

    // Prevent text selection via drag
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow selection in input fields and social media embeds
      if (target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' ||
          target.closest('iframe[src*="twitter.com"]') ||
          target.closest('iframe[src*="facebook.com"]') ||
          target.closest('iframe[src*="telegram.org"]') ||
          target.closest('iframe[src*="whatsapp.com"]') ||
          target.closest('iframe[src*="discord.com"]') ||
          target.closest('iframe[src*="reddit.com"]') ||
          target.closest('iframe[src*="x.com"]')) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar backgroundImage={location === "/" ? backgroundImage : undefined} />
      <div className="pt-20 flex-1">
        <Router />
      </div>
      <Footer />
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;