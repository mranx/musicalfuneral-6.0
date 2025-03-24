'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

// Define types for props
interface EditorTemplateProps {
  title: string;
  description: string;
  comingSoon?: boolean;
}

export default function EditorTemplate({ title, description, comingSoon = true }: EditorTemplateProps) {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>

      {comingSoon ? (
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              This editor is still under development
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-center text-gray-500 dark:text-gray-400 max-w-md">
              We're working on implementing this editor. In the meantime, you can go back to the dashboard to explore other features.
            </p>
            <Button 
              className="mt-6" 
              onClick={() => router.push('/admin/dashboard')}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p>Editor content will go here</p>
      )}
    </div>
  );
}
