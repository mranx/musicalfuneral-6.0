'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface ServiceCardProps {
  title: string;
  description: string;
  iconType: string;
}

export default function ServiceCard({ title, description, iconType }: ServiceCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-700 p-8 flex flex-col items-center text-center">
      <div className="mb-4 relative w-12 h-12">
        <Image
          src={`/assets/images/icons/${iconType}.PNG`}
          alt={title}
          fill
          className="object-contain dark:invert"
          sizes="48px"
        />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
        {description}
      </p>
      <Button 
        variant="outline" 
        className="mt-auto rounded-full text-sm font-normal hover:bg-transparent"
      >
        Book now
      </Button>
    </Card>
  );
}
