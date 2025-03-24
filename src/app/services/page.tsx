'use client';

import { pricingPlans } from '@/constants'; // Keep this for fallback
import { Play, Plus, Minus, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect, Suspense } from 'react';
import DemoVideo from '@/components/video/DemoVideo';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PaymentFormAndUserRegistrationForm from '@/_mycomponents/forms/PaymentFormAndUserRegistrationForm';
import InfoVideoPlayer from "@/_mycomponents/video/InfoVideoPlayer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define the types for all components props
interface ServiceSelectionChipProps {
  serviceName: string;
  servicePrice: string;
}

// Service Selection Chip Component
const ServiceSelectionChip: React.FC<ServiceSelectionChipProps> = ({ 
  serviceName, 
  servicePrice 
}) => {
  return (
    <div className="flex gap-2 mb-6">
      <h6 className="text-[#3F72AF] text-sm font-semibold py-2.5 px-3.5 rounded-full bg-[#3F72AF14]">
        {serviceName}
      </h6>
      {/* <h6 className="text-[#3F72AF] text-sm font-semibold py-2.5 px-3.5 rounded-full bg-[#3F72AF14]">
        ${servicePrice}.00
      </h6> */}
    </div>
  );
};

// Full Page Loader Component - Matching the About page loader style
const FullPageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A77B5]"></div>
  </div>
);

interface InputFieldProps {
  label: string;
  type: string;
  id: string;
  name: string;
  required: boolean;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, type, id, name, required, placeholder }) => (
  <div className={`flex flex-col mb-4`}>
    <label className="block font-bold text-gray-700 dark:text-gray-300" htmlFor={id}>{label}</label>
    <input className="block w-full p-2 border border-gray-300 rounded-[8px] bg-gray-100 dark:bg-gray-700" type={type} id={id} name={name} required={required} placeholder={placeholder || ""} />
  </div>
);

// Define the pricing plan interface for API data
interface ApiPricingPlan {
  id: string;
  title: string;
  price: number;
  features: string;
  order: number;
  isActive: boolean;
}

// Define a union type for any kind of pricing plan
type AnyPricingPlan = ApiPricingPlan | {
  title: string;
  price: number;
  features: string[];
};

// Define type for form data
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
  specialRequests: string;
}

// Main content component that uses useSearchParams
function ServicesContent() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan');
  const selectedPrice = searchParams.get('price');
  
  const [tab, setTab] = useState<number>(selectedPlan ? 1 : 0);
  const [modal, setModal] = useState<boolean>(false);
  const [servicePlan, setServicePlan] = useState<string>(selectedPlan || '');
  const [servicePrice, setServicePrice] = useState<string>(selectedPrice || '0');
  const [userFormData, setUserFormData] = useState<FormData>({
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
    specialRequests: ''
  });
  
  // Add state for dynamic pricing plans
  const [plans, setPlans] = useState<ApiPricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageLoading, setPageLoading] = useState<boolean>(true); // New state for full page loading
  
  useEffect(() => {
    // Update the state if URL parameters change
    if (selectedPlan) {
      setServicePlan(selectedPlan);
      setServicePrice(selectedPrice ? String(selectedPrice) : '0');
      setTab(1);
    }
    
    // Fetch dynamic pricing plans
    fetchPricingPlans();
    // Don't use a timer - loader will disappear after data is fetched
  }, [selectedPlan, selectedPrice]);
  
  // Function to fetch pricing plans from the API
  const fetchPricingPlans = async () => {
    try {
      setIsLoading(true);
      setPageLoading(true); // Show full page loader while fetching data
      const response = await fetch('/api/admin/content/pricing');
      
      if (!response.ok) throw new Error('Failed to fetch pricing plans');
      
      const data = await response.json();
      
      // Only show active plans and sort by order
      const activePlans = data
        .filter((plan: ApiPricingPlan) => plan.isActive)
        .sort((a: ApiPricingPlan, b: ApiPricingPlan) => a.order - b.order);
      
      setPlans(activePlans);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      // If the API call fails, use the static plans from constants
      setPlans([]);
    } finally {
      setIsLoading(false);
      setPageLoading(false); // Hide loader after data is fetched (success or error)
    }
  };

  // Function to receive form data from PaymentFormAndUserRegistrationForm
  const handleFormDataUpdate = (formData: FormData) => {
    setUserFormData(formData);
  };

  const handleSelectPlan = (plan: string, price: string | number) => {
    setServicePlan(plan);
    setServicePrice(String(price));
    setTab(1);
  };

  const handlePrevious = (): void => {
    if (tab === 1) {
      setTab(0);
    } else if (tab === 2) {
      setTab(1);
    }
  };

  const handlePayment = (): void => {
    setTab(2);
  };

  // Helper function to convert pipe-separated features to array
  const getFeaturesArray = (features: string): string[] => {
    return features.split('|').map(feature => feature.trim()).filter(Boolean);
  };

  // Helper function to get a unique key
  const getUniqueKey = (plan: AnyPricingPlan, index: number): string => {
    return 'id' in plan ? `api-plan-${plan.id}` : `static-plan-${index}`;
  };

  // Helper function to check if a plan has string features (API plan) or array features (static plan)
  const hasStringFeatures = (plan: AnyPricingPlan): plan is ApiPricingPlan => {
    return typeof plan.features === 'string';
  };

  // If content is loading, show the full page loader
  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A77B5]"></div>
      </div>
    );
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center w-full dark:bg-gray-900">
        {/* Service Selection Section */}
        {tab === 0 && (
          <section className="w-full py-12 md:py-24 bg-[#4A77B5] dark:bg-[#3A67A5]">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
              <h2 className="text-3xl font-bold text-center mb-12 text-white">Services pricing plans</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A77B5]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Use dynamic plans if available, otherwise use static plans from constants */}
                  {(plans.length > 0 ? plans : pricingPlans).map((plan, index) => (
                    <Card key={getUniqueKey(plan, index)} className="bg-white dark:bg-gray-700 p-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                            {plan.title}
                          </h3>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            starting from
                          </div>
                          <div className="mt-1 flex items-baseline">
                            <span className="text-[#3F72AF] dark:text-[#6B9BE3] text-3xl font-medium">$</span>
                            <span className="text-[#3F72AF] dark:text-[#6B9BE3] text-4xl font-medium">{plan.price}</span>
                            <span className="text-[#3F72AF] dark:text-[#6B9BE3] text-lg">.00</span>
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-[#3F72AF] dark:bg-[#6B9BE3] text-white" 
                          size="lg"
                          onClick={() => handleSelectPlan(plan.title, plan.price)}
                        >
                          SELECT PLAN
                        </Button>

                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900 dark:text-white">Whats included?</h4>
                          {/* Handle both dynamic and static features */}
                          {hasStringFeatures(plan) ? (
                            // For dynamic plans where features is a string
                            getFeaturesArray(plan.features).map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-3">
                                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="leading-5 align-middle">{feature}</span>
                              </div>
                            ))
                          ) : (
                            // For static plans where features is an array
                            plan.features.map((feature: string, featureIndex: number) => (
                              <div key={featureIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-3">
                                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="leading-5 align-middle">{feature}</span>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {userFormData.deceasedName && (
                          <div>
                            <h2 className="text-3xl font-bold mb-5 mt-5 text-gray-900 dark:text-white">Deceased Information:</h2>
                            <ul>
                              {userFormData.deceasedName && (
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ textAlign: 'left' }}>Name:</span> <span style={{ textAlign: 'right' }}>{userFormData.deceasedName}</span>
                                </li>
                              )}
                              {userFormData.dateOfBirth && (
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ textAlign: 'left' }}>Date of Birth:</span> <span style={{ textAlign: 'right' }}>{new Date(userFormData.dateOfBirth).toLocaleDateString()}</span>
                                </li>
                              )}
                              {userFormData.dateOfPassing && (
                                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ textAlign: 'left' }}>Date of Passing:</span> <span style={{ textAlign: 'right' }}>{new Date(userFormData.dateOfPassing).toLocaleDateString()}</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {userFormData.specialRequests && (
                          <div>
                            <h2 className="text-3xl font-bold mb-5 mt-5 text-gray-900 dark:text-white">Additional Information:</h2>
                            <p>{userFormData.specialRequests}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Form Section */}
        {tab === 1 && (
          <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
              <div className="flex flex-col mb-6">
                <div className="flex space-x-2 mb-4">
                  <img 
                    src="/assets/images/icons/back-arrow.svg" 
                    alt="Back" 
                    className="cursor-pointer" 
                    onClick={handlePrevious} 
                  />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Payment & User Registration</h2>
                </div>
                
                {/* Selected Service Chips */}
                {servicePlan && (
                  <ServiceSelectionChip 
                    serviceName={servicePlan} 
                    servicePrice={servicePrice}
                  />
                )}
                
                <PaymentFormAndUserRegistrationForm 
                  setTab={setTab} 
                  onFormDataUpdate={handleFormDataUpdate} 
                  servicePlan={servicePlan} 
                  servicePrice={servicePrice} 
                />
                <div className="video-section mt-8">
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Caecilia LT Std', fontSize: '24px', fontWeight: 700, lineHeight: '32px', textAlign: 'center', textDecoration: 'underline', textDecorationSkipInk: 'none' }}>Watch tutorial for this step</h3>
                  <div className="relative aspect-video bg-gray-900 dark:bg-black rounded-lg overflow-hidden w-1/2 m-auto">
                  <InfoVideoPlayer 
                    src="/assets/videos/test.mp4"
                    thumbnail="/assets/images/thumbnail.jpg"
                  />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Payment Section */}
        {tab === 2 && (
          <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
              <div className='grid sm:grid-cols-2 gap-4'>
                <section className="w-full px-4 bg-gray-50 dark:bg-gray-900 md:px-6 order-2 sm:order-1">
                  <div className="flex items-center space-x-2 mb-4">
                    <button 
                      className="flex items-center text-[#3F72AF] hover:text-[#2C5282] focus:outline-none"
                      onClick={handlePrevious}
                    >
                      <ArrowLeft className="w-5 h-5 mr-1" />
                      <span>Back</span>
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Make Payment</h2>
                  </div>
                  <form className="bg-white dark:bg-gray-900 p-6 rounded-lg ">
                    <h2 className="text-3xl font-bold mb-5 mt-5 text-gray-900 dark:text-white">Complete Checkout:</h2>
                    <div className='flex mt-7 mb-7'>
                      <img src="/assets/images/master.png" alt="Master Card" className="cursor-pointer mr-2" />
                      <img src="/assets/images/american.png" alt="American Express" className="cursor-pointer mr-2" />
                      <img src="/assets/images/visa.png" alt="Visa" className="cursor-pointer" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 w-full">
                      <InputField label="Card Number" type="text" id="card-number" name="card-number" required placeholder="" />
                      <InputField label="MM/YY" type="text" id="expiry" name="expiry" required placeholder="Type here..." />

                      <InputField label="CSV" type="text" id="csv" name="csv" required placeholder="" />
                      <InputField label="Zip" type="text" id="zip" name="zip" required placeholder="Type here..." />
                    </div>
                    <div className="form-buttons flex justify-between mt-4">
                      <button type="button" onClick={handlePrevious} className="previous-button bg-gray-500 text-white py-2 px-4 rounded-full hover:bg-gray-600">&nbsp;Previous&nbsp;</button>
                      <button type="button" onClick={() => setModal(true)} className="payment-button bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600">&nbsp;Payment&nbsp;</button>
                    </div>
                  </form>
                </section>
                <section className="w-full ppx-4 md:px-6 order-1 sm:order-2">
                  <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg ">
                      <h2 className="text-3xl font-bold mb-5 mt-5 text-gray-900 dark:text-white">Service Details:</h2>
                      <div className='mb-6'>
                        <ul>
                          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ textAlign: 'left' }}>Service Plan:</span> <span style={{ textAlign: 'right' }}>{servicePlan}</span>
                          </li>
                          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ textAlign: 'left' }}>Pre Service:</span> <span style={{ textAlign: 'right' }}>Instrumental (20 minutes)</span>
                          </li>
                          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ textAlign: 'left' }}>Service Start:</span> <span style={{ textAlign: 'right' }}>Vocal</span>
                          </li>
                          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ textAlign: 'left' }}>Reflection Piece 1:</span> <span style={{ textAlign: 'right' }}>Vocal</span>
                          </li>
                          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ textAlign: 'left' }}>Pre Service:</span> <span style={{ textAlign: 'right' }}>Vocal 1</span>
                          </li>
                          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ textAlign: 'left' }}>Service End:</span> <span style={{ textAlign: 'right' }}>Vocal</span>
                          </li>
                          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ textAlign: 'left' }}>Price:</span> <span style={{ textAlign: 'right' }}>${servicePrice}.00</span>
                          </li>
                        </ul>
                      </div>
                      <h2 className="text-3xl font-bold mb-5 mt-5 text-gray-900 dark:text-white">Your Information:</h2>
                      <div>
                        <ul>
                          {userFormData.name && (
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ textAlign: 'left' }}>Name:</span> <span style={{ textAlign: 'right' }}>{userFormData.name}</span>
                            </li>
                          )}
                          {userFormData.email && (
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ textAlign: 'left' }}>Email:</span> <span style={{ textAlign: 'right' }}>{userFormData.email}</span>
                            </li>
                          )}
                          {userFormData.phone && (
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ textAlign: 'left' }}>Phone:</span> <span style={{ textAlign: 'right' }}>{userFormData.phone}</span>
                            </li>
                          )}
                          {userFormData.relation && (
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ textAlign: 'left' }}>Relation to Deceased:</span> <span style={{ textAlign: 'right' }}>{userFormData.relation}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Modal */}
            <div className={`${modal === true ? 'block' : 'hidden'}`}>
              <div className='h-screen w-screen bg-black opacity-50 fixed top-0 right-0 left-0 z-10'></div>
              <div className="overflow-y-auto overflow-x-hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative p-4 w-full max-w-2xl min-w-[450px] max-h-full">
                  <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Payment Successful
                      </h3>
                      <Link
                        href={"music/choose-preferred-service"}
                        className="text-blue-500 hover:underline hover:text-blue-600"
                      >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                      </Link>
                    </div>
                    <div className="p-4 md:p-5 space-y-4">
                      <div className='flex items-center justify-center'>
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="44" height="44" rx="22" fill="#039E1C" />
                          <path d="M11.6638 22.6638L18.1121 29.1121L32.3362 14.8879" stroke="white" strokeWidth="3.7931" strokeLinecap="round" />
                        </svg>
                      </div>
                      <h3 className='text-3xl font-bold text-center'>Checkout completed <br /> successfully!</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

  // Main component that wraps ServicesContent with Suspense and adds page loader
export default function ServicesPage() {
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Simulate initial page load time or fetch necessary data
    // Reduced to a much shorter duration (300ms)
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A77B5]"></div>
      </div>
    );
  }
  
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A77B5]"></div>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}