import { Component } from 'react';
import { cn } from '../../lib/utils';

class Breadcrumb extends Component<any, any> {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <nav aria-label="Breadcrumb" className={cn('flex items-center gap-2 text-sm', className)} {...props}>
        {children}
      </nav>
    );
  }
}

export default Breadcrumb;
