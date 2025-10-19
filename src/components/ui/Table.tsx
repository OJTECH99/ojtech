import React, { Component } from "react";
import { cn } from "../../lib/utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}
interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {}
interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {}
interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {}

export class Table extends Component<TableProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <div className="relative w-full overflow-auto">
        <table
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    );
  }
}

export class TableHeader extends Component<TableHeaderProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <thead className={cn("[&_tr]:border-b", className)} {...props} />
    );
  }
}

export class TableBody extends Component<TableBodyProps> {
  render() {
    const { className, ...props } = this.props;
    return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
  }
}

export class TableFooter extends Component<TableFooterProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <tfoot
        className={cn(
          "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
          className
        )}
        {...props}
      />
    );
  }
}

export class TableRow extends Component<TableRowProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <tr
        className={cn(
          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          className
        )}
        {...props}
      />
    );
  }
}

export class TableHead extends Component<TableHeadProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <th
        className={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          className
        )}
        {...props}
      />
    );
  }
}

export class TableCell extends Component<TableCellProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <td
        className={cn(
          "p-4 align-middle [&:has([role=checkbox])]:pr-0",
          className
        )}
        {...props}
      />
    );
  }
}

export class TableCaption extends Component<TableCaptionProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <caption
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
}
