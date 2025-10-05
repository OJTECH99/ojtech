import { Component } from 'react';
import { cn } from '../../lib/utils';

interface ContextMenuProps extends React.HTMLAttributes<HTMLSpanElement> {}

class ContextMenu extends Component<ContextMenuProps> {
  render() {
    const { className, ...props } = this.props;
    return (
      <span
        className={cn(
          'ml-auto text-xs tracking-widest text-muted-foreground',
          className
        )}
        {...props}
      />
    );
  }
}

export default ContextMenu;
