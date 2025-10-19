import { useContext } from "react";
import { ToastContext } from "../../providers/ToastContext";
import { toast as toastUtils } from "./toast-utils";
import React from "react";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  action?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    console.warn("useToast must be used within a ToastProvider");
    
    // Return a fallback that uses toast-utils
    return {
      toast: (props: ToastProps) => {
        return toastUtils.toast(props);
      },
      dismiss: (toastId?: string) => {
        if (toastId) {
          // Individual toast dismiss not supported in fallback
          toastUtils.dismissAll();
        } else {
          toastUtils.dismissAll();
        }
      },
      toasts: []
    };
  }

  return context;
}

// This is for class components that can't use hooks
export function withToast(Component: any) {
  return function WithToastComponent(props: any) {
    const toast = useToast();
    return <Component {...props} toast={toast} />;
  };
} 