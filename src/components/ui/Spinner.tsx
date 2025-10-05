import { Component } from "react";
import { cn } from "../../lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

export class Spinner extends Component<SpinnerProps> {
  static defaultProps = {
    size: "md"
  };

  render() {
    const { className, size, ...props } = this.props;
    
    const sizeClasses = {
      sm: "h-4 w-4 border-2",
      md: "h-8 w-8 border-3",
      lg: "h-12 w-12 border-3",
      xl: "h-16 w-16 border-4"
    };
    
    return (
      <div
        className={cn(
          "animate-spin rounded-full border-gray-300 border-t-primary",
          sizeClasses[size as keyof typeof sizeClasses],
          className
        )}
        {...props}
      />
    );
  }
}
