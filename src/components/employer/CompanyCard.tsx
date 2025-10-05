import { Component } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from '../ui/badge';
import { Building, MapPin, Users, ExternalLink } from "lucide-react";

interface CompanyCardProps {
  id: string;
  name: string;
  logo?: string;
  description: string;
  location: string;
  industry: string;
  size: string;
  website?: string;
  openPositions: number;
  onViewClick?: (id: string) => void;
}

interface CompanyCardState {
  isHovered: boolean;
}

export class CompanyCard extends Component<CompanyCardProps, CompanyCardState> {
  constructor(props: CompanyCardProps) {
    super(props);
    this.state = {
      isHovered: false
    };
  }

  handleMouseEnter = () => {
    this.setState({ isHovered: true });
  };

  handleMouseLeave = () => {
    this.setState({ isHovered: false });
  };

  handleViewClick = () => {
    if (this.props.onViewClick) {
      this.props.onViewClick(this.props.id);
    }
  };

  render() {
    const { 
      name, 
      logo, 
      description, 
      location, 
      industry, 
      size, 
      website, 
      openPositions 
    } = this.props;

    const placeholderLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
    const logoUrl = logo || placeholderLogo;

    return (
      <Card 
        className="transition-all duration-300 hover:shadow-md flex flex-col"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative shrink-0">
              <img 
                src={logoUrl}
                alt={`${name} logo`}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{location}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-6 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary" className="flex gap-1 items-center">
              <Building className="h-3 w-3" />
              <span>{industry}</span>
            </Badge>
            
            <Badge variant="secondary" className="flex gap-1 items-center">
              <Users className="h-3 w-3" />
              <span>{size}</span>
            </Badge>
          </div>

          {openPositions > 0 && (
            <Badge className="mt-2 bg-blue-50 text-blue-700 border-blue-200 border hover:bg-blue-100">
              {openPositions} Open Position{openPositions !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardContent>
        
        <CardFooter className="pt-2 border-t flex gap-2">
          <Button variant="outline" className="w-full" onClick={this.handleViewClick}>
            View Profile
          </Button>
          
          {website && (
            <Button 
              variant="ghost" 
              className="px-2" 
              onClick={() => window.open(website, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
} 