'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ContactFormData {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  message: string;
}

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to send message
      console.log(data);
      reset();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">Send us a message</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4">
          <div className="relative">
            <input
              {...register('fullName', { required: 'Full name is required' })}
              className="peer w-full border-b border-gray-300 dark:border-gray-600 py-2 focus:outline-none focus:border-gray-500 dark:focus:border-gray-600 bg-transparent text-base text-gray-900 dark:text-white"
              placeholder=" "
            />
            <label className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm">
              Full name
            </label>
            {errors.fullName && (
              <span className="absolute -bottom-5 left-0 text-sm text-red-500">{errors.fullName.message}</span>
            )}
          </div>
          <div className="relative">
            <input
              {...register('phoneNumber', { required: 'Phone number is required' })}
              className="peer w-full border-b border-gray-300 dark:border-gray-600 py-2 focus:outline-none focus:border-gray-500 dark:focus:border-gray-600 bg-transparent text-base text-gray-900 dark:text-white"
              placeholder=" "
            />
            <label className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm">
              Phone Number
            </label>
            {errors.phoneNumber && (
              <span className="absolute -bottom-5 left-0 text-sm text-red-500">{errors.phoneNumber.message}</span>
            )}
          </div>
        </div>

        <div className="relative mt-8 sm:mt-6">
          <input
            {...register('emailAddress', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="peer w-full border-b border-gray-300 dark:border-gray-600 py-2 focus:outline-none focus:border-gray-500 dark:focus:border-gray-600 bg-transparent text-base text-gray-900 dark:text-white"
            placeholder=" "
          />
          <label className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm">
            Email address
          </label>
          {errors.emailAddress && (
            <span className="absolute -bottom-5 left-0 text-sm text-red-500">{errors.emailAddress.message}</span>
          )}
        </div>

        <div className="relative mt-8 sm:mt-6">
          <textarea
            {...register('message', { required: 'Message is required' })}
            className="peer w-full border-b border-gray-300 dark:border-gray-600 py-2 focus:outline-none focus:border-gray-500 dark:focus:border-gray-600 bg-transparent resize-none h-24 text-base text-gray-900 dark:text-white"
            placeholder=" "
          />
          <label className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm">
            Message
          </label>
          {errors.message && (
            <span className="absolute -bottom-5 left-0 text-sm text-red-500">{errors.message.message}</span>
          )}
        </div>

        <div className="pt-4 sm:pt-6">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#4A77B5] hover:bg-[#3A67A5] dark:bg-[#6B9BE3] dark:hover:bg-[#5B8BD3] text-white px-8 py-2.5 rounded-full transition-colors disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
