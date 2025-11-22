
import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-8">
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-400 mb-4">
                By accessing and using AnimeBite, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
              <p className="text-gray-400 mb-4">
                Permission is granted to temporarily access the materials (information or software) on AnimeBite for personal, non-commercial transitory viewing only.
              </p>
              <p className="text-gray-400 mb-4">This license shall not allow you to:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <p className="text-gray-400 mb-4">
                When you create an account, you must provide accurate and complete information. You are responsible for maintaining the security of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">4. Content</h2>
              <p className="text-gray-400 mb-4">
                AnimeBite does not host any files on its servers. All content is provided by third-party services. We are not responsible for the content provided by these services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">5. Prohibited Uses</h2>
              <p className="text-gray-400 mb-4">You may not use the site:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any malicious code or harmful data</li>
                <li>To impersonate another person or entity</li>
                <li>To harass, abuse, or harm another person</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-400 mb-4">
                AnimeBite shall not be held liable for any damages arising from the use or inability to use the materials on this site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
              <p className="text-gray-400 mb-4">
                We reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of modified terms.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
