import React, { Component, createRef, RefObject } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class Progress extends Component<ProgressProps> {
  private progressRef: RefObject<HTMLDivElement>;
  
  constructor(props: ProgressProps) {
    super(props);
    this.progressRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, value, forwardedRef, ...props } = this.props;
    
    return (
      <ProgressPrimitive.Root
        ref={this.progressRef}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    );
  }
} 