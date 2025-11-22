
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-8">
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p className="text-gray-400 mb-4">
                We collect information you provide directly to us when you create an account, including:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Email address and username</li>
                <li>Profile information</li>
                <li>Watch history and preferences</li>
                <li>Comments and forum posts</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-400 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Provide and maintain our services</li>
                <li>Personalize your experience</li>
                <li>Track your watch progress</li>
                <li>Communicate with you about updates</li>
                <li>Improve our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">3. Cookies and Tracking</h2>
              <p className="text-gray-400 mb-4">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve user experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage</h2>
              <p className="text-gray-400 mb-4">
                Your data is stored securely using Firebase services. We implement appropriate security measures to protect your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
              <p className="text-gray-400 mb-4">
                We use third-party services for video streaming. These services may have their own privacy policies governing the use of information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
              <p className="text-gray-400 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">7. Children's Privacy</h2>
              <p className="text-gray-400 mb-4">
                Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Privacy Policy</h2>
              <p className="text-gray-400 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
              <p className="text-gray-400 mb-4">
                If you have any questions about this Privacy Policy, please contact us through our Contact page.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
