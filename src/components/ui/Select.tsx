import { Component, createRef, ReactNode } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// This is a wrapper class component for Radix UI's Select
// We'll keep most of the original functionality but adapt it to class components where needed

interface SelectProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  name?: string;
  dir?: "ltr" | "rtl";
  required?: boolean;
}

export class Select extends Component<SelectProps> {
  render() {
    return (
      <SelectPrimitive.Root {...this.props} />
    );
  }
}

export class SelectGroup extends Component<SelectPrimitive.SelectGroupProps> {
  render() {
    return (
      <SelectPrimitive.Group {...this.props} />
    );
  }
}

export class SelectValue extends Component<SelectPrimitive.SelectValueProps> {
  render() {
    return (
      <SelectPrimitive.Value {...this.props} />
    );
  }
}

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  forwardedRef?: React.RefObject<HTMLButtonElement>;
}

export class SelectTrigger extends Component<SelectTriggerProps> {
  private triggerRef: React.RefObject<HTMLButtonElement>;
  
  constructor(props: SelectTriggerProps) {
    super(props);
    this.triggerRef = props.forwardedRef || createRef<HTMLButtonElement>();
  }
  
  render() {
    const { className, children, forwardedRef, ...props } = this.props;
    
    return (
      <SelectPrimitive.Trigger
        ref={this.triggerRef}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          className
        )}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  }
}

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class SelectContent extends Component<SelectContentProps> {
  private contentRef: React.RefObject<HTMLDivElement>;
  
  constructor(props: SelectContentProps) {
    super(props);
    this.contentRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, children, position = 'popper', forwardedRef, ...props } = this.props;
    
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={this.contentRef}
          className={cn(
            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            position === 'popper' &&
              'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            className
          )}
          position={position}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              'p-1',
              position === 'popper' &&
                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  }
}

export class SelectItem extends Component<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>> {
  private itemRef = createRef<HTMLDivElement>();
  
  render() {
    const { className, children, ...props } = this.props;
    
    return (
      <SelectPrimitive.Item
        ref={this.itemRef}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <SelectPrimitive.ItemIndicator>
            <Check className="h-4 w-4" />
          </SelectPrimitive.ItemIndicator>
        </span>

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    );
  }
}

export class SelectLabel extends Component<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>> {
  private labelRef = createRef<HTMLDivElement>();
  
  render() {
    const { className, ...props } = this.props;
    
    return (
      <SelectPrimitive.Label
        ref={this.labelRef}
        className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
        {...props}
      />
    );
  }
}

export class SelectSeparator extends Component<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>> {
  private separatorRef = createRef<HTMLDivElement>();
  
  render() {
    const { className, ...props } = this.props;
    
    return (
      <SelectPrimitive.Separator
        ref={this.separatorRef}
        className={cn('-mx-1 my-1 h-px bg-muted', className)}
        {...props}
      />
    );
  }
}

export class SelectScrollUpButton extends Component<React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>> {
  private scrollUpRef = createRef<HTMLDivElement>();
  
  render() {
    const { className, ...props } = this.props;
    
    return (
      <SelectPrimitive.ScrollUpButton
        ref={this.scrollUpRef}
        className={cn(
          'flex cursor-default items-center justify-center py-1',
          className
        )}
        {...props}
      >
        <ChevronUp className="h-4 w-4" />
      </SelectPrimitive.ScrollUpButton>
    );
  }
}

export class SelectScrollDownButton extends Component<React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>> {
  private scrollDownRef = createRef<HTMLDivElement>();
  
  render() {
    const { className, ...props } = this.props;
    
    return (
      <SelectPrimitive.ScrollDownButton
        ref={this.scrollDownRef}
        className={cn(
          'flex cursor-default items-center justify-center py-1',
          className
        )}
        {...props}
      >
        <ChevronDown className="h-4 w-4" />
      </SelectPrimitive.ScrollDownButton>
    );
  }
} 