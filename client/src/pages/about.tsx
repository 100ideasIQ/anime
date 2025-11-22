
import { Card } from "@/components/ui/card";
import { Heart, Users, Zap, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">About AnimeBite</h1>
          <p className="text-gray-400 text-lg">
            Your ultimate destination for streaming anime
          </p>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-8 mb-8">
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 mb-4">
                AnimeBite was created with a simple mission: to provide anime fans with a seamless, high-quality streaming experience. We believe that everyone should have access to their favorite anime, anytime, anywhere.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">What We Offer</h2>
              <p className="text-gray-400 mb-4">
                We aggregate anime content from various sources to provide you with the most comprehensive anime library. Our platform features:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Thousands of anime titles with both sub and dub options</li>
                <li>HD quality streaming</li>
                <li>Multiple server options for reliable playback</li>
                <li>User-friendly interface with advanced features</li>
                <li>Active community forums and discussions</li>
                <li>Personalized watchlists and progress tracking</li>
              </ul>
            </section>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-lg">Built for Fans</h3>
            <p className="text-gray-400 text-sm">
              Created by anime enthusiasts, for anime enthusiasts. We understand what you need.
            </p>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-lg">Fast & Reliable</h3>
            <p className="text-gray-400 text-sm">
              Optimized for speed with multiple servers to ensure smooth streaming.
            </p>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-lg">Community Driven</h3>
            <p className="text-gray-400 text-sm">
              Join discussions, share reviews, and connect with fellow anime fans.
            </p>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-lg">Always Improving</h3>
            <p className="text-gray-400 text-sm">
              We continuously update and improve our platform based on user feedback.
            </p>
          </Card>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Contact & Support</h2>
          <p className="text-gray-400 mb-4">
            Have questions, suggestions, or need help? We're here for you:
          </p>
          <ul className="list-none text-gray-400 space-y-2">
            <li>• Visit our FAQ page for quick answers</li>
            <li>• Use the Contact Us form to reach our team</li>
            <li>• Join our Discord community for real-time support</li>
            <li>• Report issues through our Report Issue page</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
