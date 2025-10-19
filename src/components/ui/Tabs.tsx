import React, { Component, createRef, RefObject, ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

// Root component
interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
  activationMode?: "automatic" | "manual";
}

export class Tabs extends Component<TabsProps> {
  render() {
    return <TabsPrimitive.Root {...this.props} />;
  }
}

// List component
interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class TabsList extends Component<TabsListProps> {
  private listRef: RefObject<HTMLDivElement>;
  
  constructor(props: TabsListProps) {
    super(props);
    this.listRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <TabsPrimitive.List
        ref={this.listRef}
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
          className
        )}
        {...props}
      />
    );
  }
}

// Trigger component
interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  forwardedRef?: React.RefObject<HTMLButtonElement>;
}

export class TabsTrigger extends Component<TabsTriggerProps> {
  private triggerRef: RefObject<HTMLButtonElement>;
  
  constructor(props: TabsTriggerProps) {
    super(props);
    this.triggerRef = props.forwardedRef || createRef<HTMLButtonElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <TabsPrimitive.Trigger
        ref={this.triggerRef}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
          className
        )}
        {...props}
      />
    );
  }
}

// Content component
interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class TabsContent extends Component<TabsContentProps> {
  private contentRef: RefObject<HTMLDivElement>;
  
  constructor(props: TabsContentProps) {
    super(props);
    this.contentRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <TabsPrimitive.Content
        ref={this.contentRef}
        className={cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        {...props}
      />
    );
  }
} 