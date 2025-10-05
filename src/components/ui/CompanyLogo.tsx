import { Component } from 'react';
import { Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CompanyLogoProps {
  logoUrl?: string | null;
  companyName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface CompanyLogoState {
  // TODO: Add state properties
}

class CompanyLogo extends Component<CompanyLogoProps, CompanyLogoState> {
  constructor(props: CompanyLogoProps) {
    super(props);
    this.state = {
      // TODO: Initialize state from useState hooks
    };
  }

  render() {
    const { logoUrl, companyName = 'Company', size = 'md', className } = this.props;

    const containerSizeClasses: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16',
    };

    const iconSizes: Record<'sm' | 'md' | 'lg', number> = {
      sm: 16,
      md: 24,
      lg: 32,
    };

    const containerClass = cn(
      'flex items-center justify-center rounded-md bg-muted overflow-hidden',
      containerSizeClasses[size],
      className,
    );

    return (
      <div className={containerClass} title={companyName}>
        {logoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={logoUrl}
            alt={companyName}
            className="h-full w-full object-cover"
          />
        ) : (
          <Briefcase className="text-primary/50" size={iconSizes[size]} />
        )}
      </div>
    );
  }
}

export default CompanyLogo;
