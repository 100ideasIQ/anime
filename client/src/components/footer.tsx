import React from "react";
import { Link } from "wouter";
import {
  Heart,
  MessageCircle,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <footer className="bg-background/95 border-t border-border/50 backdrop-blur-xl mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/">
              <div className="flex items-center cursor-pointer group">
                <img
                  src="/logo.png"
                  alt="AnimeBite Logo"
                  className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your ultimate destination for streaming anime. Watch thousands of
              anime series and movies in HD quality.
            </p>
            <div className="flex gap-3">
              <a
                href="https://discord.com/invite/V5AWy78VTv"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </Button>
              </a>
              <a
                href="https://t.me/+8Wluy50R049kMmVk"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19c-.14.75-.42 1-.68 1.03c-.58.05-1.02-.38-1.58-.75c-.88-.58-1.38-.94-2.23-1.5c-.99-.65-.35-1.01.22-1.59c.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02c-.09.02-1.49.95-4.22 2.79c-.4.27-.76.41-1.08.4c-.36-.01-1.04-.2-1.55-.37c-.63-.2-1.12-.31-1.08-.66c.02-.18.27-.36.74-.55c2.92-1.27 4.86-2.11 5.83-2.51c2.78-1.16 3.35-1.36 3.73-1.36c.08 0 .27.02.39.12c.1.08.13.19.14.27c-.01.06.01.24 0 .38z"/>
                  </svg>
                </Button>
              </a>
              <a
                href="https://www.reddit.com/user/ky0dan/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm5.6 11.7c0 .7-.2 1.4-.6 1.9c-.9 1.3-2.7 2-4.9 2s-4.1-.7-5-2c-.4-.5-.6-1.2-.6-1.9c0-1.3.9-2.4 2.1-2.7c-.1-.2-.1-.4-.1-.6c0-.9.7-1.6 1.6-1.6c.5 0 .9.2 1.2.5c1.1-.8 2.6-1.3 4.2-1.3l.8-3.7l2.5.6l.1.1c.5-.4 1.1-.6 1.7-.6c1.3 0 2.4 1.1 2.4 2.4s-1.1 2.4-2.4 2.4s-2.4-1.1-2.4-2.4l-2.2-.5l-.7 3.1c1.5.1 2.9.6 4 1.3c.3-.3.7-.5 1.2-.5c.9 0 1.6.7 1.6 1.6c0 .2 0 .4-.1.6c1.2.3 2.1 1.4 2.1 2.7zm-3.6-6.5c0-.6-.5-1.1-1.1-1.1s-1.1.5-1.1 1.1s.5 1.1 1.1 1.1s1.1-.5 1.1-1.1zM8.9 11c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1s1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1zm6.2 0c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1s1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1zm-4.5 4.5c.3.3.7.5 1.2.6c.4.1.9.2 1.3.2s.9-.1 1.3-.2c.5-.1.9-.3 1.2-.6c.2-.2.2-.5 0-.7s-.5-.2-.7 0c-.4.4-1.1.6-1.8.6s-1.4-.2-1.8-.6c-.2-.2-.5-.2-.7 0s-.2.5 0 .7z"/>
                  </svg>
                </Button>
              </a>
            </div>
          </div>

          {/* Browse Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Browse</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/category/trending"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Trending Anime
                </Link>
              </li>
              <li>
                <Link
                  href="/category/recently-updated"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Recent Releases
                </Link>
              </li>
              <li>
                <Link
                  href="/category/top-airing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Top Airing
                </Link>
              </li>
              <li>
                <Link
                  href="/category/top-upcoming"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Top Upcoming
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/forum"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Community Forum
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/report-issue"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Report Issue
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/dmca"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  DMCA
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Discord Join Section */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Join our Discord Community
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect with fellow anime fans and stay updated!
                </p>
              </div>
            </div>
            <a
              href="https://discord.gg/V5AWy78VTv"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white">
                <MessageCircle className="h-4 w-4" />
                Join Discord
              </Button>
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            AnimeBite does not host any files, it merely pulls streams from 3rd
            party services. Legal issues should be taken up with the file hosts
            and providers. AnimeBite is not responsible for any media files
            shown by the video providers.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} AnimeBite. Made with{" "}
              <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> for
              anime lovers. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={toggleLanguage}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 px-3 py-1 rounded-md hover:bg-accent"
              >
                <span className={language === "en" ? "text-primary" : ""}>
                  EN
                </span>
                <span>/</span>
                <span className={language === "jp" ? "text-primary" : ""}>
                  JP
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
