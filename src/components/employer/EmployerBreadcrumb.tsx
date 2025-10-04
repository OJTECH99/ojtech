import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Home, Building, Briefcase, Loader2, Users, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  title: string;
  href: string;
  isCurrentPage?: boolean;
}

interface EmployerBreadcrumbProps {
  items: BreadcrumbItem[];
}

interface EmployerBreadcrumbState {
  isLoading: boolean;
}

export class EmployerBreadcrumb extends Component<EmployerBreadcrumbProps, EmployerBreadcrumbState> {
  constructor(props: EmployerBreadcrumbProps) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  getIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home size={14} className="mr-1" />;
      case 'Dashboard':
        return <Building size={14} className="mr-1" />;
      case 'Jobs':
        return <Briefcase size={14} className="mr-1" />;
      case 'Applications':
        return <Users size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  render() {
    const { items } = this.props;
    const { isLoading } = this.state;

    return (
      <nav className="mb-6">
        <ol className="flex flex-wrap items-center space-x-1.5 text-sm text-muted-foreground">
          {/* Home icon always first */}
          <li className="flex items-center">
            <Link 
              to="/"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home size={14} className="mr-1" />
              Home
            </Link>
          </li>
          
          {/* Separator */}
          <li className="flex items-center">
            <ChevronRight size={14} className="text-muted-foreground/50" />
          </li>
          
          {/* Dynamic breadcrumb items */}
          {items.map((item, index) => (
            <React.Fragment key={item.href}>
              <li className="flex items-center">
                {isLoading && index === items.length - 1 ? (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    Loading...
                  </span>
                ) : index === items.length - 1 ? (
                  <span className="font-medium text-foreground flex items-center">
                    {this.getIcon(item.title)}
                    {item.title}
                  </span>
                ) : (
                  <Link 
                    to={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                  >
                    {this.getIcon(item.title)}
                    {item.title}
                  </Link>
                )}
              </li>
              
              {/* Add separator if not the last item */}
              {index < items.length - 1 && (
                <li className="flex items-center">
                  <ChevronRight size={14} className="text-muted-foreground/50" />
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    );
  }
}
