import { Component, createRef, RefObject, ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

// Provider component
export class TooltipProvider extends Component<TooltipPrimitive.TooltipProviderProps> {
  render() {
    return <TooltipPrimitive.Provider {...this.props} />;
  }
}

// Root component
interface TooltipRootProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}

export class Tooltip extends Component<TooltipRootProps> {
  render() {
    return <TooltipPrimitive.Root {...this.props} />;
  }
}

// Trigger component
export class TooltipTrigger extends Component<TooltipPrimitive.TooltipTriggerProps> {
  render() {
    return <TooltipPrimitive.Trigger {...this.props} />;
  }
}

// Content component
interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class TooltipContent extends Component<TooltipContentProps> {
  private contentRef: RefObject<HTMLDivElement>;
  
  constructor(props: TooltipContentProps) {
    super(props);
    this.contentRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, sideOffset = 4, forwardedRef, ...props } = this.props;
    
    return (
      <TooltipPrimitive.Content
        ref={this.contentRef}
        sideOffset={sideOffset}
        className={cn(
          'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    );
  }
} 