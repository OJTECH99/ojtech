import React from 'react';
import { ToastContext as MainToastContext } from './ToastContext';

// Create context
export const ToastContext = MainToastContext;

// Provider wrapper component to use hooks - DEPRECATED
// Use ToastProvider from ToastContext.tsx instead
export function ToastProvider({ children }: { children: React.ReactNode }) {
  console.warn('ToastProvider from ToastProvider.tsx is deprecated. Use ToastProvider from ToastContext.tsx instead.');
  
  // Use the main toast context directly
  return (
    <MainToastContext.Consumer>
      {(toastHelpers) => (
    <ToastContext.Provider value={toastHelpers}>
      {children}
    </ToastContext.Provider>
      )}
    </MainToastContext.Consumer>
  );
} 