
import { Mail, MessageSquare, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-400">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Email</h3>
            <p className="text-gray-400 text-sm">support@animebite.com</p>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Discord</h3>
            <p className="text-gray-400 text-sm">Join our community</p>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Github className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">GitHub</h3>
            <p className="text-gray-400 text-sm">Report issues</p>
          </Card>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                  className="bg-white/5 border-purple-500/20 text-white"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  className="bg-white/5 border-purple-500/20 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Subject
              </label>
              <Input
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="How can we help?"
                className="bg-white/5 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Message
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Tell us more..."
                rows={6}
                className="bg-white/5 border-purple-500/20 text-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
            >
              Send Message
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
