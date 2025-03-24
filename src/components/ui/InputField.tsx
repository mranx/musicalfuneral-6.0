import React from 'react';

interface InputFieldProps {
  label: string;
  type: string;
  id: string;
  name: string;
  required: boolean;
  placeholder?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  type, 
  id, 
  name, 
  required, 
  placeholder 
}) => (
  <div className="flex flex-col mb-4">
    <label 
      className="block font-bold text-gray-700 dark:text-gray-300" 
      htmlFor={id}
    >
      {label}
    </label>
    <input 
      className="block w-full p-2 border border-gray-300 rounded-[8px] bg-gray-100 dark:bg-gray-700" 
      type={type} 
      id={id} 
      name={name} 
      required={required} 
      placeholder={placeholder || ""} 
    />
  </div>
);
