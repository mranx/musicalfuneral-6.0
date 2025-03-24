import React from 'react';
import Link from 'next/link';

interface SuccessModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  ctaText: string;
  ctaLink: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isVisible,
  onClose,
  title,
  message,
  ctaText,
  ctaLink
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md z-10 relative">
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{message}</p>
          
          <Link 
            href={ctaLink}
            className="px-6 py-2 bg-[#4A77B5] text-white rounded-md hover:bg-[#3A67A5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A77B5]"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;