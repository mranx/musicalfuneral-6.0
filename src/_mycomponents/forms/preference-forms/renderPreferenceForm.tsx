import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

// Import your preference form components
import SecularOrCivilPreferenceForm from './SecularOrCivilPreferenceForm';
import CatholicPreferenceForm from './CatholicPreferenceForm';
import BaptistPreferenceForm from './BaptistPreferenceForm';
import AnglicanPreferenceForm from './AnglicanPreferenceForm';
import UnitingPreferenceForm from './UnitingPreferenceForm';

// Helper function to get the form name from the preference type
const getPreferenceFormName = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'secular':
    case 'civil':
      return 'Secular/Civil';
    case 'catholic':
      return 'Catholic';
    case 'baptist':
      return 'Baptist';
    case 'anglican':
      return 'Anglican';
    case 'uniting':
      return 'Uniting';
    default:
      return 'Unknown';
  }
};

interface RenderPreferenceFormProps {
  preferenceType: string;
  existingData?: any;
  orderId?: string;
  mode?: 'create' | 'edit';
}

const renderPreferenceForm = ({ 
  preferenceType, 
  existingData, 
  orderId, 
  mode = 'create' 
}: RenderPreferenceFormProps) => {
  const formName = getPreferenceFormName(preferenceType);
  
  switch (preferenceType.toLowerCase()) {
    case 'secular':
    case 'civil':
      return <SecularOrCivilPreferenceForm 
        existingData={existingData} 
        orderId={orderId} 
        mode={mode} 
      />;
    case 'catholic':
      return <CatholicPreferenceForm 
        existingData={existingData} 
        orderId={orderId} 
        mode={mode} 
      />;
    case 'baptist':
      return <BaptistPreferenceForm 
        existingData={existingData} 
        orderId={orderId} 
        mode={mode} 
      />;
    case 'anglican':
      return <AnglicanPreferenceForm 
        existingData={existingData} 
        orderId={orderId} 
        mode={mode} 
      />;
    case 'uniting':
      return <UnitingPreferenceForm 
        existingData={existingData} 
        orderId={orderId} 
        mode={mode} 
      />;
    default:
      return (
        <div className="text-center py-10">
          <p className="text-red-500">Unknown preference type. Please select a valid service type.</p>
          <Link href={`/service-preferences/${orderId}`}>
            <Button className="mt-4">Select Service Type</Button>
          </Link>
        </div>
      );
  }
};

export default renderPreferenceForm;