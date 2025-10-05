import { Component, createContext } from 'react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

// Form context
interface FormFieldContextValue {
  name: string;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

// Form component
interface FormProps {
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  children: React.ReactNode;
}

export class Form extends Component<FormProps> {
  render() {
    const { onSubmit, className, children } = this.props;
    
    return (
      <form
        onSubmit={onSubmit}
        className={className}
      >
        {children}
      </form>
    );
  }
}

// Form field
interface FormFieldProps {
  name: string;
  children: React.ReactNode;
}

export class FormField extends Component<FormFieldProps> {
  render() {
    const { name, children } = this.props;
    
    return (
      <FormFieldContext.Provider value={{ name }}>
        <div className="space-y-2">
          {children}
        </div>
      </FormFieldContext.Provider>
    );
  }
}

// Form item
interface FormItemProps {
  className?: string;
  children: React.ReactNode;
}

export class FormItem extends Component<FormItemProps> {
  render() {
    const { className, children } = this.props;
    
    return (
      <div className={cn("space-y-2", className)}>
        {children}
      </div>
    );
  }
}

// Form label
interface FormLabelProps {
  className?: string;
  children: React.ReactNode;
}

export class FormLabel extends Component<FormLabelProps> {
  render() {
    const { className, children } = this.props;
    
    return (
      <Label
        className={className}
      >
        {children}
      </Label>
    );
  }
}

// Form control
interface FormControlProps {
  className?: string;
  children: React.ReactNode;
}

export class FormControl extends Component<FormControlProps> {
  render() {
    const { className, children } = this.props;
    
    return (
      <div className={cn("mt-1", className)}>
        {children}
      </div>
    );
  }
}

// Form description
interface FormDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export class FormDescription extends Component<FormDescriptionProps> {
  render() {
    const { className, children } = this.props;
    
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {children}
      </p>
    );
  }
}

// Form message
interface FormMessageProps {
  className?: string;
  children?: React.ReactNode;
}

export class FormMessage extends Component<FormMessageProps> {
  render() {
    const { className, children } = this.props;
    
    if (!children) {
      return null;
    }
    
    return (
      <p className={cn("text-sm font-medium text-destructive", className)}>
        {children}
      </p>
    );
  }
}
