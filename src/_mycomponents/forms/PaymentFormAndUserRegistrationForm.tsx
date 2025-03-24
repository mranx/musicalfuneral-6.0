'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Success Modal Component with TypeScript types
interface SuccessModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  ctaText: string;
  orderId?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isVisible, 
  onClose, 
  title, 
  message, 
  ctaText,
  orderId
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
          
          {orderId && (
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              <span className="font-medium">Order ID:</span> {orderId}
            </p>
          )}
          
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#3F72AF] text-white rounded-md hover:bg-[#2C5282] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F72AF]"
          >
            {ctaText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Error Modal Component
interface ErrorModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ 
  isVisible, 
  onClose, 
  title, 
  message 
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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{message}</p>
          
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay Component
const LoadingOverlay: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 z-10 relative flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F72AF]"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Processing your request...</p>
      </div>
    </div>
  );
};

interface FormData {
  directorName: string;
  directorCompany: string;
  directorEmail: string;
  name: string;
  email: string;
  phone: string;
  relation: string;
  deceasedName: string;
  dateOfBirth: string;
  dateOfPassing: string;
  serviceDate: string; // New field using date format
  specialRequests: string;
}

interface PaymentFormAndUserRegistrationFormProps {
  setTab: (tab: number) => void;
  onFormDataUpdate?: (formData: FormData) => void;
  servicePlan: string;
  servicePrice: string | number;
}

const PaymentFormAndUserRegistrationForm: React.FC<PaymentFormAndUserRegistrationFormProps> = ({ 
  setTab, 
  onFormDataUpdate,
  servicePlan,
  servicePrice
}) => {
  // Get session data to check if user is logged in
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const isLoggedIn = status === 'authenticated' && session?.user;
  
  // State for auto-login processing
  const [autoLoginInProgress, setAutoLoginInProgress] = useState(false);
  // State to store the order ID
  const [orderId, setOrderId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    directorName: '',
    directorCompany: '',
    directorEmail: '',
    name: '',
    email: '',
    phone: '',
    relation: '',
    deceasedName: '',
    dateOfBirth: '',
    dateOfPassing: '',
    serviceDate: '', // Initialize new field
    specialRequests: ''
  });

  // State for section visibility
  const [sections, setSections] = useState({
    directorInfo: true,
    yourInfo: true,
    deceasedInfo: true,
    additionalInfo: true
  });

  // State for success modal, error modal and loading
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Populate form with user data if logged in
  useEffect(() => {
    if (isLoggedIn && session.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email
      }));
    }
  }, [isLoggedIn, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Prevent changing email if user is logged in
    if (isLoggedIn && name === 'email') {
      return;
    }
    
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    
    // Send updated data to parent component if the callback exists
    if (onFormDataUpdate) {
      onFormDataUpdate(updatedData);
    }
  };

  const handleAutoLogin = async (email: string, loginToken: string) => {
    try {
      setAutoLoginInProgress(true);
      
      // Use the loginToken with NextAuth signIn function
      // We'll use a custom credential approach that accepts the token
      const result = await signIn('credentials', {
        redirect: false,
        email: email,
        password: '', // Not needed for auto-login
        loginToken: loginToken,
      });
      
      if (result?.error) {
        console.error('Auto-login failed:', result.error);
        // We still proceed with form submission even if auto-login fails
      } else {
        // Force a session update to reflect the login status
        await update();
      }
    } catch (error) {
      console.error('Error during auto-login:', error);
    } finally {
      setAutoLoginInProgress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading animation
    setIsLoading(true);
    
    try {
      // Include the servicePlan and servicePrice in the data we send to the server
      const serviceData = {
        ...formData,
        servicePlan,
        servicePrice
      };
      
      // Send to the API endpoint
      const response = await fetch('/api/services/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Show error modal instead of console.log
        setErrorMessage(data.error || 'Registration failed. Please try again.');
        setShowErrorModal(true);
        return;
      }
      
      // Final update to parent before showing success
      if (onFormDataUpdate) {
        onFormDataUpdate(formData);
      }
      
      // Handle auto-login for new users
      if (data.isNewUser && data.loginToken) {
        await handleAutoLogin(data.user.email, data.loginToken);
      }
      
      // Store the order ID
      if (data.orderId) {
        setOrderId(data.orderId);
      }
      
      // Show success modal
      setShowSuccessModal(true);
      
    } catch (error) {
      // Show error modal for any exceptions
      setErrorMessage('An error occurred during registration. Please try again.');
      setShowErrorModal(true);
    } finally {
      // Hide loading animation
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    
    // Navigate to the next page
    if (orderId) {
      // The cookie is already set by the server in the /api/services/register endpoint
      // We just need to navigate to the next page
      setTab(2); // Move to payment tab
    } else {
      // No order ID, just move to the next tab
      setTab(2);
    }
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ title, section }: { title: string; section: keyof typeof sections }) => (
    <div
      className="flex items-center justify-between cursor-pointer py-3 border-b dark:border-gray-700"
      onClick={() => toggleSection(section)}
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      <ChevronDown
        className={`w-5 h-5 transition-transform text-gray-500 ${sections[section] ? 'transform rotate-180' : ''}`}
      />
    </div>
  );

  const relationOptions = [
    "Son",
    "Daughter",
    "Father",
    "Mother",
    "Brother",
    "Sister",
    "Cousin",
    "Next of kin",
    "Executor"
  ];

  // Custom success message based on login status
  const getSuccessMessage = () => {
    if (isLoggedIn) {
      return "Your order has been successfully created. You can view it in your dashboard.";
    } else {
      return "Your account has been created and you are now logged in. You can view your order in your dashboard.";
    }
  };

  return (
    <div className="max-w-4xl mx-auto shadow-lg rounded-md p-4 bg-white dark:bg-gray-800" style={{ margin: "0 152px" }}>
      <h2 className="text-3xl font-bold mb-5 mt-5 text-gray-900 dark:text-white">Service Registration</h2>
      
      {/* Show logged-in notification if user is logged in */}
      {isLoggedIn && (
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
          <p className="text-blue-700 dark:text-blue-200">
            You are logged in as <strong>{session?.user?.email}</strong>. Your new order will be added to your account.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Funeral Director Information (Not Required) */}
        <div className="space-y-4">
          <SectionHeader title="Funeral Director Information" section="directorInfo" />
          {sections.directorInfo && (
            <div className="space-y-4 pt-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Funeral Director's Name
                </label>
                <input
                  type="text"
                  name="directorName"
                  value={formData.directorName}
                  onChange={handleChange}
                  className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter funeral director's name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Funeral Director's Company Name
                </label>
                <input
                  type="text"
                  name="directorCompany"
                  value={formData.directorCompany}
                  onChange={handleChange}
                  className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Funeral Director's Email
                </label>
                <input
                  type="email"
                  name="directorEmail"
                  value={formData.directorEmail}
                  onChange={handleChange}
                  className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          )}
        </div>

        {/* Your Information */}
        <div className="space-y-4">
          <SectionHeader title="Your Information" section="yourInfo" />
          {sections.yourInfo && (
            <div className="space-y-4 pt-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full text-sm ${isLoggedIn ? 'bg-gray-200 dark:bg-gray-600' : 'bg-[#E7E7E7] dark:bg-gray-700'} dark:text-gray-200 p-2 border border-gray-300 rounded-md`}
                  placeholder="Enter your email address"
                  required
                  readOnly={Boolean(isLoggedIn)}

                />
                {isLoggedIn && (
                  <p className="text-xs text-gray-500 mt-1">
                    Your email is linked to your account and cannot be changed.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Your Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Your Relation to Deceased <span className="text-red-500">*</span>
                </label>
                <select 
                  name="relation"
                  value={formData.relation}
                  onChange={handleChange}
                  className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select your relation</option>
                  {relationOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Deceased Information */}
        <div className="space-y-4">
          <SectionHeader title="Deceased Information" section="deceasedInfo" />
          {sections.deceasedInfo && (
            <div className="space-y-4 pt-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Deceased Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="deceasedName"
                  value={formData.deceasedName}
                  onChange={handleChange}
                  className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md"
                  placeholder="Enter deceased's name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Date of Passing <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfPassing"
                  value={formData.dateOfPassing}
                  onChange={handleChange}
                  className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
    Service Date and Time <span className="text-red-500">*</span>
  </label>
  <input
    type="datetime-local"
    name="serviceDate"
    value={formData.serviceDate}
    onChange={handleChange}
    className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md"
    required
  />
</div>
            </div>
          )}
        </div>
        
        {/* Additional Information */}
        <div className="space-y-4">
          <SectionHeader title="Additional Information" section="additionalInfo" />
          {sections.additionalInfo && (
            <div className="space-y-4 pt-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Special Requests or Instructions
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 p-2 border border-gray-300 rounded-md min-h-[100px]"
                  placeholder="Enter any special requests or additional information"
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setTab(0)}
            className="text-sm dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            disabled={isLoading || autoLoginInProgress}
          >
            Previous
          </Button>
          <Button 
            type="submit" 
            className="text-sm"
            variant="primary"
            disabled={isLoading || autoLoginInProgress}
          >
            {isLoading || autoLoginInProgress ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
                {autoLoginInProgress ? "Logging in..." : "Processing..."}
              </span>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </form>
      
      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading || autoLoginInProgress} />
      
      {/* Success Modal */}
      <SuccessModal
        isVisible={showSuccessModal}
        onClose={handleModalClose}
        title="Registration Successful!"
        message={getSuccessMessage()}
        ctaText="Continue to Payment"
        orderId={orderId || undefined}
      />

      {/* Error Modal */}
      <ErrorModal
        isVisible={showErrorModal}
        onClose={handleErrorModalClose}
        title="Registration Failed"
        message={errorMessage}
      />
    </div>
  );
};

export default PaymentFormAndUserRegistrationForm;