"use client";

import React from 'react';
import { InputField } from '@/components/ui/InputField';

interface PaymentFormProps {
  onPrevious: () => void;
  onPayment: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onPrevious, onPayment }) => {
  return (
    <form className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-5 mt-5 text-gray-900 dark:text-white">Fill out the form below:</h2>
      <div>
        <InputField label="Service Date:" type="date" id="service-date" name="service-date" required />
      </div>
      <div className="grid sm:grid-cols-4 sm:gap-4 mt-4">
        <InputField 
          label="Deceased's Full Name:" 
          type="text" 
          id="deceased-name" 
          name="deceased-name" 
          required 
          placeholder="Type here..." 
        />
        <InputField 
          label="Funeral Director's Name:" 
          type="text" 
          id="director-name" 
          name="director-name" 
          required 
          placeholder="Type here..." 
        />
        <InputField 
          label="Funeral Director Company Name:" 
          type="text" 
          id="director-company" 
          name="director-company" 
          required 
          placeholder="Type here..." 
        />
        <InputField 
          label="Your Name:" 
          type="text" 
          id="your-name" 
          name="your-name" 
          required 
          placeholder="Type here..." 
        />
      </div>
      <div className="grid sm:grid-cols-3 sm:gap-4 mt-4">
        <InputField 
          label="Your Email Address:" 
          type="email" 
          id="your-email" 
          name="your-email" 
          required 
          placeholder="Type here..." 
        />
        <InputField 
          label="Your Phone No:" 
          type="tel" 
          id="your-phone" 
          name="your-phone" 
          required 
          placeholder="Type here..." 
        />
        <div className="flex flex-col mb-4">
          <label className="block font-bold text-gray-700 dark:text-gray-300" htmlFor="relationship">
            Your Relationship to the Deceased:
          </label>
          <select 
            className="block w-full p-2 border border-gray-300 rounded bg-gray-100 dark:bg-gray-700" 
            id="relationship" 
            name="relationship" 
            required
          >
            <option value="">Select your relationship</option>
            <option value="spouse">Spouse</option>
            <option value="child">Child</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="friend">Friend</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="form-buttons flex justify-between mt-4">
        <button 
          type="button" 
          onClick={onPrevious} 
          className="previous-button bg-gray-500 text-white py-2 px-4 rounded-full hover:bg-gray-600"
        >
          &nbsp;Previous&nbsp;
        </button>
        <button 
          type="button" 
          onClick={onPayment} 
          className="payment-button bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600"
        >
          &nbsp;Payment&nbsp;
        </button>
      </div>
    </form>
  );
};
