import { ToastProps } from "./use-toast";
import { ToastHelper } from "../../providers/ToastContext";

// Toast manager class
export class ToastManager {
  private static toastFunction: ((props: ToastProps) => void) | null = null;

  // Set the toast function
  static setToastFunction(fn: (props: ToastProps) => void) {
    this.toastFunction = fn;
  }

  // Show a toast
  static toast(props: ToastProps) {
    try {
      // First try the ToastHelper from ToastContext
      if (ToastHelper.currentContext) {
        return (ToastHelper as any).toast(props);
    }
      
      // Fall back to the registered function
      if (this.toastFunction) {
        return this.toastFunction(props);
  }

      console.warn("Toast function not set. Make sure ToastProvider is mounted.");
    } catch (error) {
      console.error("Error showing toast:", error);
    }
  }
  
  // Dismiss all toasts
  static dismissAll() {
    try {
      // Try ToastHelper first
      if (ToastHelper.currentContext) {
        (ToastHelper as any).dismiss();
        return;
  }

      console.warn("Toast dismiss function not available. Make sure ToastProvider is mounted.");
    } catch (error) {
      console.error("Error dismissing toasts:", error);
  }
}
}

// Export the toast function
export const toast = {
  // Default toast
  default: (props: Omit<ToastProps, "variant">) => ToastManager.toast({ ...props, variant: "default" }),
  
  // Destructive toast
  destructive: (props: Omit<ToastProps, "variant">) => ToastManager.toast({ ...props, variant: "destructive" }),
  
  // Success toast
  success: (props: Omit<ToastProps, "variant">) => ToastManager.toast({ ...props, variant: "success" }),
  
  // Warning toast
  warning: (props: Omit<ToastProps, "variant">) => ToastManager.toast({ ...props, variant: "warning" }),
  
  // Generic toast
  toast: (props: ToastProps) => ToastManager.toast(props),
  
  // Dismiss all toasts
  dismissAll: () => ToastManager.dismissAll()
};

// Set the toast function
export const setToastFunction = (fn: (props: ToastProps) => void) => {
  ToastManager.setToastFunction(fn);
}; 