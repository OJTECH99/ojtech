import { toast } from "../components/ui/toast-utils";

export interface UseToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
}

export interface UseToastType {
  toast: (props: UseToastProps) => void;
  success: (props: UseToastProps) => void;
  error: (props: UseToastProps) => void;
  warning: (props: UseToastProps) => void;
  dismiss: () => void;
}

export const useToast = (): UseToastType => {
  return {
    toast: (props: UseToastProps) => toast.toast({ ...props, variant: props.variant || "default" }),
    success: (props: UseToastProps) => toast.success(props),
    error: (props: UseToastProps) => toast.destructive(props),
    warning: (props: UseToastProps) => toast.warning(props),
    dismiss: () => toast.dismissAll(),
  };
}; 