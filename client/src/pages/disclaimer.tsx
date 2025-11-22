
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Disclaimer</h1>
          <p className="text-gray-400">Important information about our service</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">
            Please read this disclaimer carefully before using AnimeBite.
          </p>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-8">
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">1. Content Hosting</h2>
              <p className="text-gray-400 mb-4">
                AnimeBite does not host, upload, or store any video files on our servers. All content is embedded from third-party sources available publicly on the internet.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">2. Copyright</h2>
              <p className="text-gray-400 mb-4">
                We respect copyright and intellectual property rights. All trademarks, logos, and brand names are the property of their respective owners. All company, product, and service names used in this website are for identification purposes only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">3. Third-Party Links</h2>
              <p className="text-gray-400 mb-4">
                AnimeBite contains links to third-party websites and services. We have no control over the content, privacy policies, or practices of these third-party sites and accept no responsibility for them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">4. Availability</h2>
              <p className="text-gray-400 mb-4">
                We do not guarantee that our service will be available at all times. Content availability depends on third-party sources and may change without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">5. Accuracy of Information</h2>
              <p className="text-gray-400 mb-4">
                While we strive to provide accurate information, we make no warranties about the completeness, reliability, or accuracy of the information on our site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">6. Use at Your Own Risk</h2>
              <p className="text-gray-400 mb-4">
                Your use of AnimeBite is at your sole risk. The service is provided "as is" and "as available" without any warranties of any kind.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-400 mb-4">
                AnimeBite and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">8. Legal Compliance</h2>
              <p className="text-gray-400 mb-4">
                Users are responsible for ensuring their use of our service complies with all applicable laws and regulations in their jurisdiction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">9. Age Restriction</h2>
              <p className="text-gray-400 mb-4">
                Some content may not be suitable for all audiences. Parental discretion is advised. Users under 13 should not use our service.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
