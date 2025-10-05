import { Component } from 'react';
import { Toaster, type ToasterProps } from 'sonner';

class SonnerToaster extends Component<ToasterProps> {
  render() {
    const { theme = 'system', ...props } = this.props;
    return (
      <Toaster
        theme={theme}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            description: 'group-[.toast]:text-muted-foreground',
            actionButton:
              'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
            cancelButton:
              'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          },
        }}
        {...props}
      />
    );
  }
}

export default SonnerToaster;
