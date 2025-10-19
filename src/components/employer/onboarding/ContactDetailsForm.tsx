import React, { Component } from 'react';
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/Form";
import { Loader2 } from "lucide-react";

interface FormValues {
  contactPerson: string;
  position: string;
  contactEmail: string;
  contactPhone: string;
  companyAddress: string;
}

interface ContactDetailsFormProps {
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading?: boolean;
}

interface ContactDetailsFormState {
  formData: FormValues;
  errors: Partial<Record<keyof FormValues, string>>;
  touched: Partial<Record<keyof FormValues, boolean>>;
}

export class ContactDetailsForm extends Component<ContactDetailsFormProps, ContactDetailsFormState> {
  constructor(props: ContactDetailsFormProps) {
    super(props);
    this.state = {
      formData: {
        contactPerson: props.initialData?.contactPerson || '',
        position: props.initialData?.position || '',
        contactEmail: props.initialData?.contactEmail || '',
        contactPhone: props.initialData?.contactPhone || '',
        companyAddress: props.initialData?.companyAddress || ''
      },
      errors: {},
      touched: {}
    };
  }

  handleChange = (name: keyof FormValues, value: string) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      },
      touched: {
        ...prevState.touched,
        [name]: true
      }
    }), () => this.validateField(name));
  };

  validateField = (name: keyof FormValues) => {
    const { formData } = this.state;
    let error = '';

    switch (name) {
      case 'contactPerson':
        if (!formData.contactPerson) {
          error = 'Contact person is required';
        }
        break;
      case 'position':
        if (!formData.position) {
          error = 'Position is required';
        }
        break;
      case 'contactEmail':
        if (!formData.contactEmail) {
          error = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'companyAddress':
        if (!formData.companyAddress) {
          error = 'Company address is required';
        }
        break;
      default:
        break;
    }

    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        [name]: error
      }
    }));

    return error === '';
  };

  validateForm = () => {
    const fields: Array<keyof FormValues> = ['contactPerson', 'position', 'contactEmail', 'companyAddress'];
    
    // Mark all fields as touched
    const touched = fields.reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {});
    
    this.setState({ touched });
    
    // Validate all fields
    const isValid = fields.every(field => this.validateField(field));
    
    return isValid;
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (this.validateForm()) {
      this.props.onSubmit(this.state.formData);
    }
  };

  render() {
    const { formData, errors, touched } = this.state;
    const { isLoading } = this.props;
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Contact Details</h2>
          <p className="text-gray-500">Enter contact information for your company</p>
        </div>
        
        <Form>
          <form onSubmit={this.handleSubmit} className="space-y-8">
            <FormField>
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    value={formData.contactPerson}
                    onChange={e => this.handleChange('contactPerson', e.target.value)}
                  />
                </FormControl>
                <FormDescription>The primary contact person for your company</FormDescription>
                {touched.contactPerson && errors.contactPerson && (
                  <FormMessage>{errors.contactPerson}</FormMessage>
                )}
              </FormItem>
            </FormField>

            <FormField>
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="HR Manager" 
                    value={formData.position}
                    onChange={e => this.handleChange('position', e.target.value)}
                  />
                </FormControl>
                <FormDescription>The position of the contact person</FormDescription>
                {touched.position && errors.position && (
                  <FormMessage>{errors.position}</FormMessage>
                )}
              </FormItem>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField>
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="contact@example.com" 
                      type="email" 
                      value={formData.contactEmail}
                      onChange={e => this.handleChange('contactEmail', e.target.value)}
                    />
                  </FormControl>
                  {touched.contactEmail && errors.contactEmail && (
                    <FormMessage>{errors.contactEmail}</FormMessage>
                  )}
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+1234567890" 
                      value={formData.contactPhone}
                      onChange={e => this.handleChange('contactPhone', e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  {touched.contactPhone && errors.contactPhone && (
                    <FormMessage>{errors.contactPhone}</FormMessage>
                  )}
                </FormItem>
              </FormField>
            </div>

            <FormField>
              <FormItem>
                <FormLabel>Company Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="123 Business St, City, Country" 
                    value={formData.companyAddress}
                    onChange={e => this.handleChange('companyAddress', e.target.value)}
                  />
                </FormControl>
                {touched.companyAddress && errors.companyAddress && (
                  <FormMessage>{errors.companyAddress}</FormMessage>
                )}
              </FormItem>
            </FormField>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </Form>
      </div>
    );
  }
}
