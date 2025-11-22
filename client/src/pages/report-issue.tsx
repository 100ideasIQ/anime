
import { AlertCircle, Bug, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function ReportIssuePage() {
  const [formData, setFormData] = useState({
    type: "",
    title: "Report",
    description: "report bugs or issues",
    url: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Issue reported:", formData);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Report an Issue</h1>
          <p className="text-gray-400">
            Help us improve by reporting bugs or issues you encounter.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6 text-center">
            <Bug className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Bug Report</h3>
            <p className="text-gray-400 text-sm">Something not working?</p>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6 text-center">
            <AlertCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Playback Issues</h3>
            <p className="text-gray-400 text-sm">Video not loading?</p>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6 text-center">
            <FileQuestion className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Content Issues</h3>
            <p className="text-gray-400 text-sm">Wrong info or missing?</p>
          </Card>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Issue Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white"
              >
                <option value="">Select type...</option>
                <option value="bug">Bug Report</option>
                <option value="playback">Playback Issue</option>
                <option value="content">Content Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Brief description of the issue"
                className="bg-white/5 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Page URL (if applicable)
              </label>
              <Input
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://..."
                className="bg-white/5 border-purple-500/20 text-white"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Please describe the issue in detail..."
                rows={6}
                className="bg-white/5 border-purple-500/20 text-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
            >
              Submit Report
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
