import React, { Component, ChangeEvent, FormEvent, createRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import profileService from '../../lib/api/profileService';
import { useToast } from '../ui/use-toast';
import { ToastContext } from '../../providers/ToastContext';
import { Upload } from 'lucide-react';

interface EmployerProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData: {
    companyName?: string;
    companySize?: string;
    industry?: string;
    companyWebsite?: string;
    websiteUrl?: string;
    companyDescription?: string;
    companyAddress?: string;
    contactPersonName?: string;
    contactPersonPosition?: string;
    contactPersonEmail?: string;
    contactPersonPhone?: string;
    companyLogoUrl?: string;
    logoUrl?: string;
  };
}

interface EmployerProfileEditModalState {
  formData: {
    companyName: string;
    companySize: string;
    industry: string;
    companyWebsite: string;
    companyDescription: string;
    companyAddress: string;
    contactPersonName: string;
    contactPersonPosition: string;
    contactPersonEmail: string;
    contactPersonPhone: string;
    companyLogoUrl: string;
    logoUrl: string;
    websiteUrl?: string;
  };
  logoFile: File | null;
  logoPreview: string | null;
  isSubmitting: boolean;
}

class EmployerProfileEditModalClass extends Component<EmployerProfileEditModalProps, EmployerProfileEditModalState> {
  static contextType = ToastContext;
  declare context: React.ContextType<typeof ToastContext>;
  fileInputRef = createRef<HTMLInputElement>();

  constructor(props: EmployerProfileEditModalProps) {
    super(props);
    
    this.state = {
      formData: {
        companyName: props.initialData.companyName || '',
        companySize: props.initialData.companySize || '',
        industry: props.initialData.industry || '',
        companyWebsite: props.initialData.companyWebsite || props.initialData.websiteUrl || '',
        companyDescription: props.initialData.companyDescription || '',
        companyAddress: props.initialData.companyAddress || '',
        contactPersonName: props.initialData.contactPersonName || '',
        contactPersonPosition: props.initialData.contactPersonPosition || '',
        contactPersonEmail: props.initialData.contactPersonEmail || '',
        contactPersonPhone: props.initialData.contactPersonPhone || '',
        companyLogoUrl: props.initialData.companyLogoUrl || '',
        logoUrl: props.initialData.logoUrl || '',
        websiteUrl: props.initialData.websiteUrl || '',
      },
      logoFile: null,
      logoPreview: props.initialData.logoUrl || props.initialData.companyLogoUrl || null,
      isSubmitting: false,
    };
  }
  
  handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  };
  
  handleSelectChange = (name: string, value: string) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  };

  handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      this.setState({ 
        logoFile: file,
        logoPreview: previewUrl
      });
    }
  };

  triggerFileInput = () => {
    this.fileInputRef.current?.click();
  };
  
  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ isSubmitting: true });
    
    try {
      // First, upload logo if there's a new one
      if (this.state.logoFile) {
        try {
          const logoResponse = await profileService.uploadEmployerLogo(this.state.logoFile);
          console.log('Logo upload response:', logoResponse);
          
          // Update the form data with the new logo URL if available
          if (logoResponse && logoResponse.logoUrl) {
            this.setState(prevState => ({
              formData: {
                ...prevState.formData,
                companyLogoUrl: logoResponse.logoUrl,
                logoUrl: logoResponse.logoUrl
              }
            }));
          }
        } catch (logoError) {
          console.error('Error uploading company logo:', logoError);
          this.context?.toast({
            title: "Logo Upload Failed",
            description: "Failed to upload company logo, but continuing with profile update.",
            variant: "destructive",
          });
        }
      }
      
      // Then update the profile data
      const formDataToSend = {
        ...this.state.formData,
        websiteUrl: this.state.formData.companyWebsite // Map companyWebsite to websiteUrl for backend
      };
      
      await profileService.updateEmployerProfile(formDataToSend);
      this.context?.toast({
        title: "Success",
        description: "Company profile updated successfully",
        variant: "default",
      });
      this.props.onSaved();
      this.props.onClose();
    } catch (error) {
      console.error('Error updating employer profile:', error);
      this.context?.toast({
        title: "Error",
        description: "Failed to update company profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };
  
  render() {
    const { isOpen, onClose } = this.props;
    const { formData, isSubmitting, logoPreview } = this.state;
    
    // Company size options
    const companySizeOptions = [
      "1-10 employees",
      "11-20 employees",
      "21-30 employees",
      "31-40 employees",
      "41+ employees"
    ];
    
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px] bg-gray-950 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Company Profile</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={this.handleSubmit} className="space-y-4">
            {/* Company Logo Upload */}
            <div>
              <Label htmlFor="companyLogo" className="text-gray-300 mb-2 block">Company Logo</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-24 h-24 bg-gray-900 border border-gray-700 rounded-md flex items-center justify-center overflow-hidden"
                >
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Company logo preview" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-500 text-center text-sm">
                      No logo
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={this.fileInputRef}
                    onChange={this.handleLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={this.triggerFileInput}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, 512x512px or larger
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="companyName" className="text-gray-300">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={this.handleInputChange}
                required
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry" className="text-gray-300">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={this.handleInputChange}
                  placeholder="Enter industry"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="companySize" className="text-gray-300">Company Size</Label>
                <Select 
                  onValueChange={(value) => this.handleSelectChange("companySize", value)}
                  value={formData.companySize}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white h-10">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {companySizeOptions.map((size) => (
                      <SelectItem key={size} value={size} className="text-white">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="companyWebsite" className="text-gray-300">Company Website</Label>
              <Input
                id="companyWebsite"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={this.handleInputChange}
                placeholder="https://example.com"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="companyAddress" className="text-gray-300">Company Address</Label>
              <Input
                id="companyAddress"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={this.handleInputChange}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="companyDescription" className="text-gray-300">Company Description</Label>
              <Textarea
                id="companyDescription"
                name="companyDescription"
                value={formData.companyDescription}
                onChange={this.handleInputChange}
                rows={4}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            <div className="border-t border-gray-800 my-4 pt-4">
              <h3 className="text-lg font-medium text-white mb-2">Contact Person Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPersonName" className="text-gray-300">Contact Name</Label>
                  <Input
                    id="contactPersonName"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={this.handleInputChange}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactPersonPosition" className="text-gray-300">Position/Title</Label>
                  <Input
                    id="contactPersonPosition"
                    name="contactPersonPosition"
                    value={formData.contactPersonPosition}
                    onChange={this.handleInputChange}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="contactPersonEmail" className="text-gray-300">Contact Email</Label>
                  <Input
                    id="contactPersonEmail"
                    name="contactPersonEmail"
                    type="email"
                    value={formData.contactPersonEmail}
                    onChange={this.handleInputChange}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactPersonPhone" className="text-gray-300">Contact Phone</Label>
                  <Input
                    id="contactPersonPhone"
                    name="contactPersonPhone"
                    value={formData.contactPersonPhone}
                    onChange={this.handleInputChange}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

// Wrapper component to use hooks in class component
const EmployerProfileEditModal = (props: EmployerProfileEditModalProps) => {
  return (
    <ToastContext.Consumer>
      {(toastContext) => (
        <EmployerProfileEditModalClass {...props} />
      )}
    </ToastContext.Consumer>
  );
};

export default EmployerProfileEditModal; 