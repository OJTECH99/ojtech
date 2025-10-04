import React, { Component, ChangeEvent, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import profileService from '../../lib/api/profileService';
import { toast } from '../ui/toast-utils';

interface EducationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData: {
    university?: string;
    major?: string;
    graduationYear?: number | null;
  };
}

interface EducationEditModalState {
  formData: {
    university: string;
    major: string;
    graduationYear: string;
  };
  isLoading: boolean;
  error: string | null;
}

export class EducationEditModal extends Component<EducationEditModalProps, EducationEditModalState> {
  constructor(props: EducationEditModalProps) {
    super(props);
    
    // Initialize form data from props
    this.state = {
      formData: {
        university: props.initialData.university || '',
        major: props.initialData.major || '',
        graduationYear: props.initialData.graduationYear ? String(props.initialData.graduationYear) : ''
      },
      isLoading: false,
      error: null
    };
  }
  
  componentDidUpdate(prevProps: EducationEditModalProps) {
    // If the initial data changes, update the form
    if (
      prevProps.initialData.university !== this.props.initialData.university ||
      prevProps.initialData.major !== this.props.initialData.major ||
      prevProps.initialData.graduationYear !== this.props.initialData.graduationYear
    ) {
      this.setState({
        formData: {
          university: this.props.initialData.university || '',
          major: this.props.initialData.major || '',
          graduationYear: this.props.initialData.graduationYear ? String(this.props.initialData.graduationYear) : ''
        }
      });
    }
  }
  
  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  };
  
  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ isLoading: true, error: null });
    
    try {
      // Parse the graduation year to a number
      const { university, major, graduationYear } = this.state.formData;
      const graduationYearNum = graduationYear ? parseInt(graduationYear, 10) : null;
      
      // Update the education info
      await profileService.updateEducationInfo({
        university,
        major,
        graduationYear: graduationYearNum
      });
      
      toast.success({
        title: "Education Updated",
        description: "Your education information has been successfully updated."
      });
      
      this.props.onSaved();
      this.props.onClose();
    } catch (err: any) {
      console.error('Error updating education:', err);
      
      const errorMsg = err.response?.data?.message || 'Failed to update education information. Please try again.';
      this.setState({ error: errorMsg });
      
      toast.destructive({
        title: "Update Failed",
        description: errorMsg
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };
  
  render() {
    const { isOpen, onClose } = this.props;
    const { formData, isLoading, error } = this.state;
    const currentYear = new Date().getFullYear();
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900/90 border border-gray-800/50 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Update Education</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={this.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="university">University/Institution</Label>
              <Input
                id="university"
                name="university"
                value={formData.university}
                onChange={this.handleChange}
                placeholder="e.g. Harvard University"
                className="bg-black/80 border border-gray-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="major">Major/Field of Study</Label>
              <Input
                id="major"
                name="major"
                value={formData.major}
                onChange={this.handleChange}
                placeholder="e.g. Computer Science"
                className="bg-black/80 border border-gray-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Input
                id="graduationYear"
                name="graduationYear"
                type="number"
                min="1990"
                max={currentYear + 10}
                value={formData.graduationYear}
                onChange={this.handleChange}
                placeholder={String(currentYear + 4)}
                className="bg-black/80 border border-gray-700 text-white"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm py-2">{error}</div>
            )}
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-gray-600 to-gray-800"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

export default EducationEditModal; 