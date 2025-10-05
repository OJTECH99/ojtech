import React, { Component, createContext } from 'react';
import type { ToasterToastProps } from '../components/ui/Toast';
import { setToastFunction } from '../components/ui/toast-utils';

export type ToastActionElement = React.ReactElement<any>;

// Constants
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 5000;

// Types
type ToasterToast = ToasterToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ActionType = {
  ADD_TOAST: 'ADD_TOAST';
  UPDATE_TOAST: 'UPDATE_TOAST';
  DISMISS_TOAST: 'DISMISS_TOAST';
  REMOVE_TOAST: 'REMOVE_TOAST';
};

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

interface State {
  toasts: ToasterToast[];
}

// Helper functions
let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Create context interface
interface ToastContextValue extends State {
  toast: (props: Omit<ToasterToast, 'id'>) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
}

// Default context value
const defaultToastContext: ToastContextValue = {
  toasts: [],
  toast: () => ({ id: '', dismiss: () => {}, update: () => {} }),
  dismiss: () => {},
};

// Create and export the context
export const ToastContext = createContext<ToastContextValue>(defaultToastContext);

// Props and state interfaces
interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastProviderState {
  toasts: ToasterToast[];
}

// Timeout map
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// ToastProvider component
export class ToastProvider extends Component<ToastProviderProps, ToastProviderState> {
  constructor(props: ToastProviderProps) {
    super(props);
    this.state = {
      toasts: [],
    };
    
    // Register the toast function with the toast-utils
    setToastFunction((props) => {
      // props comes from ToastProps where action is ReactNode; our context expects a
      // specific ToastAction element type. To keep types safe, omit unknown action.
      const { action: _ignoredAction, ...rest } = props as any;
      this.toast({
        ...(rest as Omit<ToasterToast, 'id' | 'action'>),
        // Ensure open is true by default
        open: true,
      });
    });
  }
  
  private addToRemoveQueue = (toastId: string) => {
    if (toastTimeouts.has(toastId)) {
      return;
    }

    const timeout = setTimeout(() => {
      toastTimeouts.delete(toastId);
      this.dispatch({
        type: 'REMOVE_TOAST',
        toastId: toastId,
      });
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(toastId, timeout);
  };
  
  // Reducer logic
  private reducer = (state: ToastProviderState, action: Action): ToastProviderState => {
    switch (action.type) {
      case 'ADD_TOAST':
        return {
          ...state,
          toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
        };

      case 'UPDATE_TOAST':
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === action.toast.id ? { ...t, ...action.toast } : t
          ),
        };

      case 'DISMISS_TOAST': {
        const { toastId } = action;

        // Side effects
        if (toastId) {
          this.addToRemoveQueue(toastId);
        } else {
          state.toasts.forEach((toast) => {
            this.addToRemoveQueue(toast.id);
          });
        }

        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId || toastId === undefined
              ? {
                  ...t,
                  open: false,
                }
              : t
          ),
        };
      }
      case 'REMOVE_TOAST':
        if (action.toastId === undefined) {
          return {
            ...state,
            toasts: [],
          };
        }
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== action.toastId),
        };
      default:
        return state;
    }
  };

  // Dispatch function to update state
  private dispatch = (action: Action) => {
    this.setState((prevState) => this.reducer(prevState, action));
  };

  // Toast function
  private toast = (props: Omit<ToasterToast, 'id'>) => {
    const id = genId();

    const update = (props: ToasterToast) =>
      this.dispatch({
        type: 'UPDATE_TOAST',
        toast: { ...props, id },
      });
      
    const dismiss = () => this.dispatch({ type: 'DISMISS_TOAST', toastId: id });

    this.dispatch({
      type: 'ADD_TOAST',
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss();
        },
      },
    });

    return {
      id,
      dismiss,
      update,
    };
  };

  // Dismiss function
  private dismiss = (toastId?: string) => {
    this.dispatch({ type: 'DISMISS_TOAST', toastId });
  };

  render() {
    const value: ToastContextValue = {
      toasts: this.state.toasts,
      toast: this.toast,
      dismiss: this.dismiss,
    };

    return (
      <ToastContext.Provider value={value}>
        {this.props.children}
      </ToastContext.Provider>
    );
  }
}

// Context consumer class
interface ToastConsumerProps {
  children: (value: ToastContextValue) => React.ReactNode;
}

export class ToastConsumer extends Component<ToastConsumerProps> {
  render() {
    return (
      <ToastContext.Consumer>
        {this.props.children}
      </ToastContext.Consumer>
    );
  }
}

// Helper class to consume toast context
export class ToastHelper extends Component {
  static contextType = ToastContext;
  static currentContext: ToastContextValue | null = null;
  static toast: (props: Omit<ToasterToast, 'id'>) => { id: string; dismiss: () => void; update: (props: ToasterToast) => void };
  static dismiss: (toastId?: string) => void;
  
  // Update the context reference when the component mounts
  componentDidMount() {
    ToastHelper.currentContext = this.context as ToastContextValue;
  }
  
  // Update the context reference when the context changes
  componentDidUpdate() {
    ToastHelper.currentContext = this.context as ToastContextValue;
  }
  
  render() {
    // This component doesn't render anything, it just provides access to the context
    return null;
  }
}

// Static helper methods
(ToastHelper as any).toast = function(props: Omit<ToasterToast, 'id'>) {
  // Try to use the stored context reference
  if (ToastHelper.currentContext) {
    return ToastHelper.currentContext.toast(props);
  }
  
  // If context is not available, create a fallback toast that will be shown once context is available
  console.debug('Toast context not available yet, creating delayed toast');
  
  // Return a dummy object with the expected interface
  const dummyId = `pending-${Date.now()}`;
  
  // Schedule the toast to appear when context becomes available
  setTimeout(() => {
    if (ToastHelper.currentContext) {
      ToastHelper.currentContext.toast(props);
    }
  }, 100);
  
  return { 
    id: dummyId, 
    dismiss: () => {}, 
    update: () => {} 
  };
};

(ToastHelper as any).dismiss = function(toastId?: string) {
  // Try to use the stored context reference
  if (ToastHelper.currentContext) {
    try {
      ToastHelper.currentContext.dismiss(toastId);
      return;
    } catch (error) {
      console.error('Error calling dismiss from ToastHelper:', error);
    }
  }
  
  // Schedule dismiss when context becomes available
  setTimeout(() => {
    if (ToastHelper.currentContext) {
      try {
        ToastHelper.currentContext.dismiss(toastId);
      } catch (error) {
        console.error('Error in delayed dismiss:', error);
  }
}
  }, 100);
  
  console.debug('Toast context not available yet for dismiss, scheduled for later');
};