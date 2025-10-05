import { Component, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export class Card extends Component<CardProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <div
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export class CardHeader extends Component<CardHeaderProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <div
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
      />
    );
  }
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export class CardTitle extends Component<CardTitleProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <h3
        className={cn(
          "text-2xl font-semibold leading-none tracking-tight",
          className
        )}
        {...props}
      />
    );
  }
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export class CardDescription extends Component<CardDescriptionProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <p
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export class CardContent extends Component<CardContentProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <div className={cn("p-6 pt-0", className)} {...props} />
    );
  }
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export class CardFooter extends Component<CardFooterProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <div
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
      />
    );
  }
} 