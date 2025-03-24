import { MapPin, Mail, Phone } from 'lucide-react';
import ContactForm from '@/components/forms/ContactForm';

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8 items-center">
            {/* Left Side - Text and Contact Info */}
            <div className="order-2 lg:order-1">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">Lets get in touch</h1>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  We are here to help and answer any questions you might have. We look forward to hearing from you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#3F72AF] flex-shrink-0" />
                  <p className="text-gray-600">+1 345 678 9012</p>
                </div>

                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#3F72AF] flex-shrink-0" />
                  <p className="text-gray-600">info@consultancy.com</p>
                </div>

                <div className="flex items-center space-x-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#3F72AF] flex-shrink-0" />
                  <p className="text-gray-600">Main blvd. 24th street</p>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="order-1 lg:order-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
