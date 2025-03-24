'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

// Define types for alert variants
type AlertVariant = 'success' | 'error' | 'warning' | 'info';

// Interface for alert props
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: AlertVariant;
  actionLabel?: string;
  onAction?: () => void;
}

// Variant configurations
const variantConfig = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    titleColor: 'text-green-600',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-500',
    titleColor: 'text-red-600',
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-600',
  },
  info: {
    icon: AlertCircle,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-600',
  }
};

export function AlertModal({
  isOpen, 
  onClose, 
  title, 
  message, 
  variant = 'info',
  actionLabel,
  onAction
}: AlertModalProps) {
  // Get variant configuration
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
            <DialogTitle className={config.titleColor}>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
          {onAction && actionLabel && (
            <Button onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Custom hook for managing alerts
export function useAlert() {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info' as AlertVariant,
    actionLabel: '' as string | undefined,
    onAction: undefined as (() => void) | undefined
  });

  const showAlert = ({
    title, 
    message, 
    variant = 'info',
    actionLabel,
    onAction
  }: {
    title: string, 
    message: string, 
    variant?: AlertVariant,
    actionLabel?: string,
    onAction?: () => void
  }) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      variant,
      actionLabel,
      onAction
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    AlertComponent: () => (
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        actionLabel={alertState.actionLabel}
        onAction={alertState.onAction}
      />
    ),
    showAlert,
    hideAlert
  };
}