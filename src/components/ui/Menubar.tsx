import { Component } from 'react';
import { cn } from '../../lib/utils';

interface MenubarProps extends React.HTMLAttributes<HTMLSpanElement> {}

class Menubar extends Component<MenubarProps> {
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

export default Menubar;
