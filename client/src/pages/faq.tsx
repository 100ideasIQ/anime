
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-400">
            Find answers to common questions about AnimeBite.
          </p>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-8">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border-purple-500/20">
              <AccordionTrigger className="text-white hover:text-purple-400">
                Is AnimeBite free to use?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Yes, AnimeBite is completely free to use. You can watch anime without any subscription fees.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-purple-500/20">
              <AccordionTrigger className="text-white hover:text-purple-400">
                Do I need to create an account?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                While you can browse and watch anime without an account, creating one allows you to save your watchlist, track progress, and participate in discussions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-purple-500/20">
              <AccordionTrigger className="text-white hover:text-purple-400">
                Why is a video not loading?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Try switching to a different server from the server selection menu. If the issue persists, please report it using our Report Issue page.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-purple-500/20">
              <AccordionTrigger className="text-white hover:text-purple-400">
                How often is new content added?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                New episodes are typically added shortly after they air in Japan. We update our library regularly to bring you the latest anime.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-purple-500/20">
              <AccordionTrigger className="text-white hover:text-purple-400">
                Can I download episodes?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Currently, download functionality is not available. All content is streamed online.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-purple-500/20">
              <AccordionTrigger className="text-white hover:text-purple-400">
                What quality options are available?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Most anime are available in multiple qualities including 1080p, 720p, and 480p. Quality depends on the source and your selected server.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border-purple-500/20">
              <AccordionTrigger className="text-white hover:text-purple-400">
                How do I request an anime?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                You can use our Contact Us page to submit anime requests. We'll do our best to add them to our library.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border-purple-500/20">
              <AccordionTrigger className="text-white hover:text-purple-400">
                Are subtitles available?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Yes, most anime have English subtitles. Some also have dub versions available. You can also upload your own subtitle files.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
