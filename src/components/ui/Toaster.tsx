import { Component } from 'react';
import type React from 'react';
import { ToastContext } from '../../providers/ToastContext';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '../../components/ui/Toast';
import type { ToasterToastProps } from '../../components/ui/Toast';

export class Toaster extends Component {
  static contextType = ToastContext;
  declare context: React.ContextType<typeof ToastContext>;
  
  render() {
    const toastHelpers = this.context;
    
    if (!toastHelpers) {
      return null; // No toast context available
    }
    
    return (
          <ToastProvider>
        {toastHelpers.toasts.map((t: ToasterToastProps) => {
              const { id, title, description, action, ...props } = t;
              return (
              <Toast key={id} {...props}>
                <div className="grid gap-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose />
              </Toast>
              );
            })}
            <ToastViewport />
          </ToastProvider>
    );
  }
}