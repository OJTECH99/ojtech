import React, { Component, createRef, RefObject } from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ToastProps } from './use-toast.tsx';
import { ToastContext } from '../../providers/ToastContext';

// Provider component
export class ToastProvider extends Component<ToastPrimitives.ToastProviderProps> {
  render() {
    return <ToastPrimitives.Provider {...this.props} />;
  }
}

// Viewport component
interface ToastViewportProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> {
  forwardedRef?: React.RefObject<HTMLOListElement>;
}

export class ToastViewport extends Component<ToastViewportProps> {
  private viewportRef: RefObject<HTMLOListElement>;
  
  constructor(props: ToastViewportProps) {
    super(props);
    this.viewportRef = props.forwardedRef || createRef<HTMLOListElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <ToastPrimitives.Viewport
        ref={this.viewportRef}
        className={cn(
          'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
          className
        )}
        {...props}
      />
    );
  }
}

// Toast variants
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border bg-green-600 text-white',
        warning: 'border bg-yellow-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Toast component
export interface ToastComponentProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>, VariantProps<typeof toastVariants> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class Toast extends Component<ToastComponentProps> {
  private toastRef: RefObject<HTMLDivElement>;
  
  constructor(props: ToastComponentProps) {
    super(props);
    this.toastRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, variant, forwardedRef, ...props } = this.props;

  return (
      <ToastPrimitives.Root
        ref={this.toastRef}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      />
    );
  }
}

// Action component
interface ToastActionProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> {
  forwardedRef?: React.RefObject<HTMLButtonElement>;
}

export class ToastAction extends Component<ToastActionProps> {
  private actionRef: RefObject<HTMLButtonElement>;
  
  constructor(props: ToastActionProps) {
    super(props);
    this.actionRef = props.forwardedRef || createRef<HTMLButtonElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <ToastPrimitives.Action
        ref={this.actionRef}
        className={cn(
          'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
          className
        )}
        {...props}
      />
    );
  }
}

// Close component
interface ToastCloseProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> {
  forwardedRef?: React.RefObject<HTMLButtonElement>;
}

export class ToastClose extends Component<ToastCloseProps> {
  private closeRef: RefObject<HTMLButtonElement>;
  
  constructor(props: ToastCloseProps) {
    super(props);
    this.closeRef = props.forwardedRef || createRef<HTMLButtonElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <ToastPrimitives.Close
        ref={this.closeRef}
        className={cn(
          'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
          className
        )}
        toast-close=""
        {...props}
      >
        <X className="h-4 w-4" />
      </ToastPrimitives.Close>
    );
  }
}

// Title component
interface ToastTitleProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class ToastTitle extends Component<ToastTitleProps> {
  private titleRef: RefObject<HTMLDivElement>;
  
  constructor(props: ToastTitleProps) {
    super(props);
    this.titleRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <ToastPrimitives.Title
        ref={this.titleRef}
        className={cn('text-sm font-semibold', className)}
        {...props}
      />
    );
  }
}

// Description component
interface ToastDescriptionProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class ToastDescription extends Component<ToastDescriptionProps> {
  private descriptionRef: RefObject<HTMLDivElement>;
  
  constructor(props: ToastDescriptionProps) {
    super(props);
    this.descriptionRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <ToastPrimitives.Description
        ref={this.descriptionRef}
        className={cn('text-sm opacity-90', className)}
        {...props}
      />
    );
  }
}

export type ToasterToastProps = React.ComponentPropsWithoutRef<typeof Toast> & {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement<typeof ToastAction>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};