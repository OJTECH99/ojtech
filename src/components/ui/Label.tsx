import React, { Component, createRef, RefObject } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

interface LabelProps 
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  forwardedRef?: React.RefObject<HTMLLabelElement>;
}

export class Label extends Component<LabelProps> {
  private labelRef: RefObject<HTMLLabelElement>;
  
  constructor(props: LabelProps) {
    super(props);
    this.labelRef = props.forwardedRef || createRef<HTMLLabelElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <LabelPrimitive.Root
        ref={this.labelRef}
        className={cn(labelVariants(), className)}
        {...props}
      />
    );
  }
}

export { labelVariants }; 