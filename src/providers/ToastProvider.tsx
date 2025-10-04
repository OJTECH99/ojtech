import React, { Component } from 'react';
import { ToastContainer } from '../components/ui/Toast';
import { useToast, ToastProps } from '../components/ui/use-toast';
import { ToastContext as MainToastContext } from './ToastContext';

// Create context
export const ToastContext = MainToastContext;

// Provider wrapper component to use hooks - DEPRECATED
// This component is kept for backwards compatibility
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