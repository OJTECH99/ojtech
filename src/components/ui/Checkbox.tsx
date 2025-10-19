import React, { Component, createRef, RefObject } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  forwardedRef?: React.RefObject<HTMLButtonElement>;
}

export class Checkbox extends Component<CheckboxProps> {
  private checkboxRef: RefObject<HTMLButtonElement>;
  
  constructor(props: CheckboxProps) {
    super(props);
    this.checkboxRef = props.forwardedRef || createRef<HTMLButtonElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <CheckboxPrimitive.Root
        ref={this.checkboxRef}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn('flex items-center justify-center text-current')}
        >
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
} 