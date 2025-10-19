import React, { Component, createRef, RefObject } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class RadioGroup extends Component<RadioGroupProps> {
  private radioGroupRef: RefObject<HTMLDivElement>;
  
  constructor(props: RadioGroupProps) {
    super(props);
    this.radioGroupRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <RadioGroupPrimitive.Root
        className={cn('grid gap-2', className)}
        {...props}
        ref={this.radioGroupRef}
      />
    );
  }
}

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  forwardedRef?: React.RefObject<HTMLButtonElement>;
}

export class RadioGroupItem extends Component<RadioGroupItemProps> {
  private radioItemRef: RefObject<HTMLButtonElement>;
  
  constructor(props: RadioGroupItemProps) {
    super(props);
    this.radioItemRef = props.forwardedRef || createRef<HTMLButtonElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <RadioGroupPrimitive.Item
        ref={this.radioItemRef}
        className={cn(
          'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    );
  }
} 