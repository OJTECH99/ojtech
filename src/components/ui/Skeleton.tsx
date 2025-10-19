import React, { Component } from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export class Skeleton extends Component<SkeletonProps> {
  render() {
    const { className, ...props } = this.props;
    return (
    <div
        className={cn(
          "animate-pulse rounded-md bg-muted/70",
          className
        )}
      {...props}
    />
  );
  }
}
