import React, { Component, createRef, RefObject, ReactNode } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Root component
interface AccordionProps {
  children: ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  orientation?: "vertical" | "horizontal";
}

export class Accordion extends Component<AccordionProps> {
  render() {
    return <AccordionPrimitive.Root {...this.props} />;
  }
}

// Item component
interface AccordionItemProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class AccordionItem extends Component<AccordionItemProps> {
  private itemRef: RefObject<HTMLDivElement>;
  
  constructor(props: AccordionItemProps) {
    super(props);
    this.itemRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <AccordionPrimitive.Item
        ref={this.itemRef}
        className={cn('border-b', className)}
        {...props}
      />
    );
  }
}

// Trigger component
interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  forwardedRef?: React.RefObject<HTMLButtonElement>;
}

export class AccordionTrigger extends Component<AccordionTriggerProps> {
  private triggerRef: RefObject<HTMLButtonElement>;
  
  constructor(props: AccordionTriggerProps) {
    super(props);
    this.triggerRef = props.forwardedRef || createRef<HTMLButtonElement>();
  }
  
  render() {
    const { className, children, forwardedRef, ...props } = this.props;
    
    return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={this.triggerRef}
          className={cn(
            'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
            className
          )}
          {...props}
        >
          {children}
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  }
}

// Content component
interface AccordionContentProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class AccordionContent extends Component<AccordionContentProps> {
  private contentRef: RefObject<HTMLDivElement>;
  
  constructor(props: AccordionContentProps) {
    super(props);
    this.contentRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, children, forwardedRef, ...props } = this.props;
    
    return (
      <AccordionPrimitive.Content
        ref={this.contentRef}
        className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        {...props}
      >
        <div className={cn('pb-4 pt-0', className)}>{children}</div>
      </AccordionPrimitive.Content>
    );
  }
} 