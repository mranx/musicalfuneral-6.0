import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Minus } from 'lucide-react';
import { services as defaultServices, pricingPlans as defaultPricingPlans } from '@/constants';
import ServiceCard from '@/components/services/ServiceCard';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InfoVideoPlayer from "@/_mycomponents/video/InfoVideoPlayer";
import { getHomePageContent } from '@/lib/content';

// Make this page dynamic to avoid caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Fetch content from database
  const content = await getHomePageContent();
  
  // Destructure all content sections
  const { 
    hero, 
    about, 
    faqs = [], 
    services = defaultServices, 
    pricingPlans = defaultPricingPlans, 
    howItWorks = [], 
    demoVideos = [] 
  } = content;

  return (
    <main className="flex min-h-screen flex-col items-center w-full bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center space-y-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {hero?.title || "Get AI Generated tailored funeral music videos"}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
              {hero?.description || "Create personalized and meaningful funeral music videos that honor and celebrate the lives of your loved ones."}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
  {hero?.buttonText1 && (
    <Link href={hero.buttonLink1 || "/services"}>
      <Button size="xl" variant="primary">
        {hero.buttonText1}
      </Button>
    </Link>
  )}
  {hero?.buttonText2 && (
    <Link href={hero.buttonLink2 || "/contact"}>
      <Button size="xl" variant="contact">
        {hero.buttonText2}
      </Button>
    </Link>
  )}
</div>
            <div className="w-full max-w-4xl mt-8">
              <InfoVideoPlayer 
                src={hero?.videoUrl || "/assets/videos/test.mp4"}
                thumbnail="/assets/images/thumbnail.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">We offer services for</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service: any) => (
              <ServiceCard
                key={service.title}
                title={service.title}
                description={service.description}
                iconType={service.iconType}
              />
            ))}
          </div>
          <div className="text-center mt-16">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Have Queries? Lets Get In Touch</h3>
            <Link href="/contact">
              <Button size="lg" variant="primary">
                Contact
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Who Are We Section */}
      <section className="w-full py-12 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                {about?.title || "Who Are We"}
              </h2>
              <div className="text-gray-600 dark:text-gray-300">
                {about?.description ? (
                  about.description.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-6">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="mb-6">
                      We are a dedicated team of professionals committed to providing personalized and meaningful funeral music services. Our expertise spans across various religious denominations, ensuring that each service is conducted with the utmost respect and authenticity.
                    </p>
                    <p className="mb-6">
                      With years of experience in funeral services and music production, we understand the importance of creating the right atmosphere for remembrance and reflection. Our AI-powered technology allows us to deliver high-quality, customized musical arrangements that honor your loved ones.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={about?.imageUrl || "/assets/images/priest-praying-church 1.png"}
                alt="Priest praying in church"
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-24 bg-[#4A77B5] dark:bg-[#3A67A5]">
  <div className="container mx-auto px-4 md:px-6 max-w-7xl">
    <h2 className="text-3xl font-bold text-center mb-12 text-white">Services pricing plans</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {pricingPlans.map((plan: any) => (
        <Card key={plan.title} className="bg-white dark:bg-gray-700 p-8 flex flex-col h-full">
          <div className="space-y-6 flex flex-col h-full">
            <div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {plan.title}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                starting from
              </div>
              <div className="mt-1 flex items-baseline">
                <span className="text-[#4A77B5] dark:text-[#6B9BE3] text-3xl font-medium">$</span>
                <span className="text-[#4A77B5] dark:text-[#6B9BE3] text-4xl font-medium">{plan.price}</span>
                <span className="text-[#4A77B5] dark:text-[#6B9BE3] text-lg">.00</span>
              </div>
            </div>

            <Link href={`/services?plan=${encodeURIComponent(plan.title)}&price=${plan.price}`} className="mt-auto mb-4">
              <Button className="w-full bg-[#4A77B5] dark:bg-[#6B9BE3] text-white" size="lg">
                BOOK NOW
              </Button>
            </Link>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Whats included?</h4>
              {plan.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="leading-5 align-middle">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
</section>

      {/* Video Demos Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Glance to our AI Video Demos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(demoVideos.length > 0 ? demoVideos : [
              {
                title: 'Catholic Sample',
                duration: '0:15 seconds',
                src: '/assets/videos/test.mp4',
                thumbnail: '/assets/images/thumbnail.jpg'
              },
              {
                title: 'Anglican Sample',
                duration: '0:15 seconds',
                src: '/assets/videos/test.mp4',
                thumbnail: '/assets/images/thumbnail.jpg'
              },
              {
                title: 'Uniting Sample',
                duration: '0:15 seconds',
                src: '/assets/videos/test.mp4',
                thumbnail: '/assets/images/thumbnail.jpg'
              },
              {
                title: 'Baptist Sample',
                duration: '0:15 seconds',
                src: '/assets/videos/test.mp4',
                thumbnail: '/assets/images/thumbnail.jpg'
              }
            ]).map((demo: any) => (
              <div key={demo.title} className="relative aspect-video bg-gray-900 dark:bg-black rounded-lg overflow-hidden">
                <h3 className="text-white text-xl text-center font-semibold">{demo.title}</h3>
                <InfoVideoPlayer 
                  src={demo.src}
                  thumbnail={demo.thumbnail || "/assets/images/thumbnail.jpg"}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">How it works?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(howItWorks.length > 0 ? howItWorks : [
              {
                step: '01',
                title: 'Choose a audio or video format',
                description: 'Select your preferred format for the memorial service'
              },
              {
                step: '02',
                title: 'Fill out the required details and provide images',
                description: 'Share your photos and select your preferred music'
              },
              {
                step: '03',
                title: 'Get a one-time ready to play video or audio',
                description: 'Receive your personalized memorial tribute'
              }
            ]).map((item: any) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#4A77B5] dark:bg-[#3A67A5] text-white flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq: any) => (
              <div key={faq.id || faq.question} className="border dark:border-gray-700 rounded-lg">
                <details className="group">
                  <summary className="flex items-center justify-between p-4 text-left text-gray-900 dark:text-white cursor-pointer">
                    <span className="font-medium">{faq.question}</span>
                    <span className="transition group-open:rotate-180">
                      <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400 group-open:hidden" />
                      <Minus className="w-5 h-5 text-gray-500 dark:text-gray-400 hidden group-open:block" />
                    </span>
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}