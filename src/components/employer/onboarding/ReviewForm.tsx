import React, { Component } from 'react';
import { Button } from "../../../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card";
import { ArrowRight, Check, Loader2, Building, User, Mail, Phone, MapPin, Globe, Pencil } from "lucide-react";
// Next Image replaced with standard img;

interface EmployerOnboardingData {
  companyName: string;
  companySize: string;
  industry: string;
  companyDescription: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
  contactPerson: string;
  position: string;
  contactEmail: string;
  contactPhone?: string;
  companyAddress: string;
}

interface ReviewFormProps {
  data: EmployerOnboardingData;
  onSubmit: () => Promise<void>;
  onEdit: (step: number) => void;
}

interface ReviewFormState {
  isSubmitting: boolean;
}

export class ReviewForm extends Component<ReviewFormProps, ReviewFormState> {
  constructor(props: ReviewFormProps) {
    super(props);
    this.state = {
      isSubmitting: false
    };
  }

  handleSubmit = async () => {
    try {
      this.setState({ isSubmitting: true });
      await this.props.onSubmit();
    } catch (error) {
      console.error('Error submitting review:', error);
      this.setState({ isSubmitting: false });
    }
  };

  render() {
    const { data, onEdit } = this.props;
    const { isSubmitting } = this.state;
    
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Review Your Information</h3>
          <p className="text-muted-foreground">
            Please review your information before completing your registration
          </p>
        </div>

        <div className="grid gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg">Company Information</CardTitle>
                <CardDescription>Basic details about your company</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEdit(0)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                {data.companyLogoUrl ? (
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-muted mr-4">
                    <img
                      src={data.companyLogoUrl}
                      alt={data.companyName}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center mr-4">
                    <Building className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{data.companyName}</p>
                  <p className="text-sm text-muted-foreground">{data.industry}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Size: {data.companySize}</span>
                </div>
                {data.companyWebsite && (
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={data.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {data.companyWebsite}
                    </a>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 mt-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{data.companyDescription}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <CardDescription>Contact details for your company</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEdit(1)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{data.contactPerson} ({data.position})</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{data.contactEmail}</span>
                </div>
                {data.contactPhone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{data.contactPhone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                  <span>{data.companyAddress}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col space-y-4">
          <Button onClick={this.handleSubmit} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing Registration...
              </>
            ) : (
              <>
                Complete Registration
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }
}
