
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">DMCA Policy</h1>
          <p className="text-gray-400">Digital Millennium Copyright Act Notice</p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-200 text-sm">
            AnimeBite respects the intellectual property rights of others and expects users to do the same.
          </p>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-8">
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Notice of Infringement</h2>
              <p className="text-gray-400 mb-4">
                AnimeBite does not host any content on our servers. All video content is embedded from third-party sources. We act as a search engine and indexing service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Filing a DMCA Notice</h2>
              <p className="text-gray-400 mb-4">
                If you believe that content available on our site infringes your copyright, please provide us with the following information:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>A physical or electronic signature of the copyright owner</li>
                <li>Identification of the copyrighted work claimed to have been infringed</li>
                <li>Identification of the material claimed to be infringing</li>
                <li>Your contact information (address, telephone, email)</li>
                <li>A statement of good faith belief that use is not authorized</li>
                <li>A statement of accuracy under penalty of perjury</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">How to Submit</h2>
              <p className="text-gray-400 mb-4">
                DMCA notices should be sent to:
              </p>
              <div className="bg-white/5 border border-purple-500/20 rounded-lg p-4 mt-4">
                <p className="text-white font-mono text-sm">Email: dmca@animebite.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Counter-Notice</h2>
              <p className="text-gray-400 mb-4">
                If you believe that material you posted was removed by mistake or misidentification, you may file a counter-notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Repeat Infringers</h2>
              <p className="text-gray-400 mb-4">
                We will terminate the accounts of users who are repeat infringers of copyrights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Third-Party Content</h2>
              <p className="text-gray-400 mb-4">
                Since we do not host content, removing links from our site does not remove the content from the internet. Copyright holders should also contact the actual content hosts.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
