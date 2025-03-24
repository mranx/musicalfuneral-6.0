import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8">
                {/* Replace with your actual logo */}
                <svg viewBox="0 0 24 24" className="fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-lg">FUNERAL MUSIC ONLINE</h2>
                <p className="text-sm text-gray-400">COMPASSION & UNDERSTANDING</p>
              </div>
            </div>
          </div>

          {/* Quicklinks */}
          <div>
            <h3 className="font-semibold mb-4">Quicklinks</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
              <li><Link href="/about-us" className="hover:text-gray-300">About Us</Link></li>
              <li><Link href="/services" className="hover:text-gray-300">Services</Link></li>
              <li><Link href="/faqs" className="hover:text-gray-300">FAQs</Link></li>
              <li><Link href="/portfolio" className="hover:text-gray-300">Portfolio</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/help-center" className="hover:text-gray-300">Help & Center</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-gray-300">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-gray-300">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>A: Building 192, Midway, NY</li>
              <li>P: +1 345 678 9012</li>
              <li>E: info@name.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">Copyright © {new Date().getFullYear()} Name</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-gray-300">
              <Facebook size={20} />
            </Link>
            <Link href="#" className="hover:text-gray-300">
              <Instagram size={20} />
            </Link>
            <Link href="#" className="hover:text-gray-300">
              <Twitter size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
